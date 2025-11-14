const {onSchedule} = require("firebase-functions/v2/scheduler");
const {admin} = require("../config/database");
const FirestoreService = require("../services/firestoreService");

/**
 * postId로 게시글 조회 (병렬 처리로 최적화)
 * @param {string} postId - 게시글 ID
 * @param {Array} communities - 커뮤니티 목록 (캐시용)
 * @return {Promise<Object|null>} 게시글 문서 또는 null
 */
async function findPostById(postId, communities = null) {
  try {
    const communitiesService = new FirestoreService("communities");
    
    if (!communities) {
      communities = await communitiesService.getAll();
    }
    
    const postPromises = communities.map(async (community) => {
      const postRef = communitiesService.db
          .collection(`communities/${community.id}/posts`)
          .doc(postId);
      return await postRef.get();
    });
    
    const postDocs = await Promise.all(postPromises);
    
    for (const postDoc of postDocs) {
      if (postDoc.exists) {
        return postDoc;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`[STORAGE_CLEANUP] findPostById 오류 (postId: ${postId}):`, error.message);
    return null;
  }
}

/**
 * 파일 삭제 헬퍼 함수
 * @param {Object} fileDoc - 파일 문서
 * @param {Object} bucket - Storage bucket
 * @param {Object} filesService - FirestoreService 인스턴스
 * @param {boolean} deleteFromStorage - 스토리지에서도 삭제할지 여부 (기본값: true)
 */
async function deleteFile(fileDoc, bucket, filesService, deleteFromStorage = true) {
  const filePath = fileDoc.filePath;
  
  if (deleteFromStorage && filePath) {
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    }
  }
  
  await filesService.delete(fileDoc.id);
}

/**
 * 스토리지 정리 로직 (공통 함수)
 * @param {boolean} deleteFromStorage - 스토리지에서도 파일을 삭제할지 여부 (기본값: true)
 */
async function cleanupStorage(deleteFromStorage = true) {
  console.log("[STORAGE_CLEANUP] 스토리지 정리 작업 시작", {
    timestamp: new Date().toISOString(),
  });

  const bucket = admin.storage().bucket();
  const filesService = new FirestoreService("files");
  const BATCH_SIZE = 100; 
  const stats = {
    deletedUnusedFiles: 0,
    deletedOrphanedStorage: 0,
    deletedMissingPostFiles: 0,
    deletedOrphanedAttachments: 0,
    errors: [],
  };

  try {
    // 1. files 컬렉션에서 isUsed === false인 항목 삭제 (배치 처리)
    console.log("[STORAGE_CLEANUP] 1단계: isUsed === false인 파일 삭제 시작");
    let lastDoc = null;
    let hasMore = true;
    
    while (hasMore) {
      let query = filesService.db
          .collection("files")
          .where("isUsed", "==", false)
          .limit(BATCH_SIZE);
      
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        hasMore = false;
        break;
      }
      
      const batch = snapshot.docs;
      lastDoc = batch[batch.length - 1];
      hasMore = batch.length === BATCH_SIZE;
      
      for (const doc of batch) {
        const fileDoc = {id: doc.id, ...doc.data()};
        try {
          const filePath = fileDoc.filePath;
          if (!filePath) {
            console.warn(`[STORAGE_CLEANUP] filePath가 없는 파일 문서: ${fileDoc.id}`);
            continue;
          }

          await deleteFile(fileDoc, bucket, filesService, deleteFromStorage);
          stats.deletedUnusedFiles++;
          console.log(`[STORAGE_CLEANUP] 파일 삭제 완료: ${fileDoc.id}`);
        } catch (error) {
          console.error(`[STORAGE_CLEANUP] 파일 삭제 실패 (${fileDoc.id}):`, error.message);
          stats.errors.push({type: "unused_file", fileId: fileDoc.id, error: error.message});
        }
      }
      
      console.log(`[STORAGE_CLEANUP] 1단계 진행: ${stats.deletedUnusedFiles}개 삭제 완료`);
    }

    // 3, 4. attachedTo가 있는 파일 처리 (게시글 존재 여부 + media 배열 확인 통합)
    console.log("[STORAGE_CLEANUP] 3-4단계: attachedTo 파일 검증 및 삭제 시작");
    
    const communitiesService = new FirestoreService("communities");
    const communities = await communitiesService.getAll();
    
    let lastAttachedDoc = null;
    let hasMoreAttached = true;
    let processedCount = 0;
    
    while (hasMoreAttached) {
      let query = filesService.db
          .collection("files")
          .where("attachedTo", "!=", null)
          .limit(BATCH_SIZE);
      
      if (lastAttachedDoc) {
        query = query.startAfter(lastAttachedDoc);
      }
      
      const snapshot = await query.get();
      if (snapshot.empty) {
        hasMoreAttached = false;
        break;
      }
      
      const batch = snapshot.docs;
      lastAttachedDoc = batch[batch.length - 1];
      hasMoreAttached = batch.length === BATCH_SIZE;
      

      const batchPromises = batch.map(async (doc) => {
        const fileDoc = {id: doc.id, ...doc.data()};
        const attachedTo = fileDoc.attachedTo;
        if (!attachedTo) return;

        try {
          const post = await findPostById(attachedTo, communities);
          
          if (!post) {
            // 3단계: 게시글이 없으면 파일 삭제
            await deleteFile(fileDoc, bucket, filesService, deleteFromStorage);
            stats.deletedMissingPostFiles++;
            console.log(`[STORAGE_CLEANUP] 존재하지 않는 게시글의 파일 삭제: ${fileDoc.id} (attachedTo: ${attachedTo})`);
            return;
          }
          
          // 4단계: 게시글이 있으면 media 배열 확인
          const postData = post.data();
          const postMedia = postData.media || [];
          const postMediaPaths = new Set(postMedia);
          const filePath = fileDoc.filePath;
          
          // 게시글의 media 배열에 없으면 삭제
          if (filePath && !postMediaPaths.has(filePath)) {
            await deleteFile(fileDoc, bucket, filesService, deleteFromStorage);
            stats.deletedOrphanedAttachments++;
            console.log(`[STORAGE_CLEANUP] 게시글 media와 불일치하는 파일 삭제: ${fileDoc.id} (postId: ${attachedTo})`);
          }
        } catch (error) {
          console.error(`[STORAGE_CLEANUP] 파일 검증/삭제 실패 (${fileDoc.id}):`, error.message);
          stats.errors.push({type: "attached_file_check", fileId: fileDoc.id, error: error.message});
        }
      });
      
      await Promise.all(batchPromises);
      
      processedCount += batch.length;
      console.log(`[STORAGE_CLEANUP] 3-4단계 진행: ${processedCount}개 처리 완료 (존재하지 않는 게시글 파일 ${stats.deletedMissingPostFiles}개, media 불일치 파일 ${stats.deletedOrphanedAttachments}개)`);
    }
    
    console.log(`[STORAGE_CLEANUP] 3-4단계 완료: 총 ${processedCount}개 처리, 존재하지 않는 게시글 파일 ${stats.deletedMissingPostFiles}개, media 불일치 파일 ${stats.deletedOrphanedAttachments}개 삭제 완료`);

    console.log("[STORAGE_CLEANUP] 스토리지 정리 작업 완료", stats);
    return stats;
  } catch (error) {
    console.error("[STORAGE_CLEANUP] 스토리지 정리 작업 실패:", error);
    stats.errors.push({type: "general", error: error.message});
    throw error;
  }
}

/**
 * 일일 스토리지 정리 스케줄러
 * 매일 새벽 3시에 실행되어 files 컬렉션과 스토리지를 함께 정리합니다.
 */
const storageCleanupScheduler = onSchedule(
    {
      schedule: "0 3 * * *", 
      timeZone: "Asia/Seoul",
      region: "asia-northeast3",
      timeoutSeconds: 540, 
      memory: "512MiB", 
    },
    async (event) => {
      return await cleanupStorage(true);
    }
);

/**
 * 주간 orphaned 스토리지 파일 정리 함수
 * files 컬렉션에는 없는데 스토리지에만 있는 파일을 삭제합니다.
 */
async function cleanupOrphanedStorage() {
  console.log("[STORAGE_CLEANUP] 주간 orphaned 스토리지 파일 정리 시작", {
    timestamp: new Date().toISOString(),
  });

  const bucket = admin.storage().bucket();
  const filesService = new FirestoreService("files");
  const BATCH_SIZE = 100;
  const stats = {
    deletedOrphanedStorage: 0,
    errors: [],
  };

  try {
    const filesDocPaths = new Set();
    let lastFileDoc = null;
    let hasMoreFiles = true;
    
    while (hasMoreFiles) {
      let query = filesService.db.collection("files").limit(BATCH_SIZE);
      if (lastFileDoc) {
        query = query.startAfter(lastFileDoc);
      }
      
      const snapshot = await query.get();
      if (snapshot.empty) {
        hasMoreFiles = false;
        break;
      }
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.filePath) {
          filesDocPaths.add(data.filePath);
        }
      });
      
      lastFileDoc = snapshot.docs[snapshot.docs.length - 1];
      hasMoreFiles = snapshot.docs.length === BATCH_SIZE;
      
      if (filesDocPaths.size % 10000 === 0) {
        console.log(`[STORAGE_CLEANUP] files 컬렉션 경로 수집 중: ${filesDocPaths.size}개`);
      }
    }
    
    console.log(`[STORAGE_CLEANUP] files 컬렉션에 등록된 파일 경로 수: ${filesDocPaths.size}개`);
    
    let pageToken = null;
    do {
      const [files, , {pageToken: nextPageToken}] = await bucket.getFiles({
        prefix: "files/",
        maxResults: BATCH_SIZE,
        pageToken: pageToken,
      });
      
      const orphanedFiles = files.filter((file) => !filesDocPaths.has(file.name));
      
      const deletePromises = orphanedFiles.map(async (storageFile) => {
        try {
          await storageFile.delete();
          stats.deletedOrphanedStorage++;
          console.log(`[STORAGE_CLEANUP] Orphaned 스토리지 파일 삭제: ${storageFile.name}`);
        } catch (error) {
          console.error(`[STORAGE_CLEANUP] Orphaned 파일 삭제 실패 (${storageFile.name}):`, error.message);
          stats.errors.push({type: "orphaned_storage", filePath: storageFile.name, error: error.message});
        }
      });
      
      await Promise.all(deletePromises);
      
      pageToken = nextPageToken;
      console.log(`[STORAGE_CLEANUP] 진행: ${stats.deletedOrphanedStorage}개 삭제 완료`);
    } while (pageToken);

    console.log("[STORAGE_CLEANUP] 주간 orphaned 스토리지 파일 정리 완료", stats);
    return stats;
  } catch (error) {
    console.error("[STORAGE_CLEANUP] 주간 orphaned 스토리지 파일 정리 실패:", error);
    stats.errors.push({type: "general", error: error.message});
    throw error;
  }
}

/**
 * 주간 orphaned 스토리지 파일 정리 스케줄러
 * 매주 일요일 새벽 4시에 실행되어 files 컬렉션에는 없는데 스토리지에만 있는 파일을 삭제합니다.
 */
const storageCleanupWeeklyScheduler = onSchedule(
    {
      schedule: "0 4 * * 0",
      timeZone: "Asia/Seoul",
      region: "asia-northeast3",
      timeoutSeconds: 540, 
      memory: "512MiB",
    },
    async (event) => {
      return await cleanupOrphanedStorage();
    }
);

module.exports = {
  storageCleanupScheduler,
  storageCleanupWeeklyScheduler,
};
