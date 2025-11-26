const { db, Timestamp } = require("../config/database");
const { FieldPath, FieldValue } = require("firebase-admin/firestore");
const {
  MISSION_LIKES_COLLECTION,
  MISSION_LIKES_STATS_COLLECTION,
} = require("../constants/missionConstants");

class MissionLikeService {
  /**
   * 토글 좋아요
   * @param {string} userId
   * @param {string} missionId
   * @returns {Promise<{liked:boolean, likesCount:number}>}
   */
  async toggleLike(userId, missionId) {
    if (!userId || !missionId) {
      const err = new Error("userId와 missionId가 필요합니다.");
      err.code = "BAD_REQUEST";
      throw err;
    }

    const likeDocId = `${userId}_${missionId}`;
    const likeRef = db.collection(MISSION_LIKES_COLLECTION).doc(likeDocId);
    const statsRef = db.collection(MISSION_LIKES_STATS_COLLECTION).doc(missionId);
    const now = FieldValue.serverTimestamp();

    let result = { liked: false, likesCount: 0 };

    await db.runTransaction(async (transaction) => {
      const likeDoc = await transaction.get(likeRef);
      const statsDoc = await transaction.get(statsRef);

      const baseCount = statsDoc.exists ? statsDoc.data().likesCount || 0 : 0;
      let delta = 0;
      let liked = false;

      if (likeDoc.exists) {
        // UNLIKE: 좋아요 취소
        transaction.delete(likeRef);

        transaction.set(
          statsRef,
          {
            missionId,
            likesCount: FieldValue.increment(-1),
            updatedAt: now,
          },
          { merge: true },
        );

        liked = false;
        delta = -1;
      } else {
        // LIKE: 좋아요 추가
        transaction.set(likeRef, {
          userId,
          missionId,
          createdAt: now,
        });

        transaction.set(
          statsRef,
          {
            missionId,
            likesCount: FieldValue.increment(1),
            updatedAt: now,
          },
          { merge: true },
        );

        liked = true;
        delta = 1;
      }

      const finalLikesCount = Math.max(0, baseCount + delta);

      result = {
        liked,
        likesCount: finalLikesCount,
      };
    });

    return result;
  }

  /**
   * 미션들에 대한 좋아요 카운트/상태 조회
   * @param {Array<string>} missionIds
   * @param {string|null} userId
   * @returns {Promise<Object>} { likesCountMap, likedSet }
   */
  async getLikesMetadata(missionIds, userId = null) {
    if (!Array.isArray(missionIds) || missionIds.length === 0) {
      return {
        likesCountMap: {},
        likedSet: new Set(),
      };
    }

    const statsRefs = missionIds.map((missionId) =>
      db.collection(MISSION_LIKES_STATS_COLLECTION).doc(missionId),
    );
    const statsSnapshots = await db.getAll(...statsRefs);
    const likesCountMap = {};

    statsSnapshots.forEach((docSnap) => {
      if (docSnap.exists) {
        likesCountMap[docSnap.id] = docSnap.data().likesCount || 0;
      }
    });

    const likedSet = new Set();
    if (userId) {
      const likeRefs = missionIds.map((missionId) =>
        db.collection(MISSION_LIKES_COLLECTION).doc(`${userId}_${missionId}`),
      );
      const likeSnaps = await db.getAll(...likeRefs);
      likeSnaps.forEach((docSnap) => {
        if (docSnap.exists) {
          likedSet.add(docSnap.data().missionId);
        }
      });
    }

    return {
      likesCountMap,
      likedSet,
    };
  }

  /**
   * 사용자 찜 목록 정보 조회 (커서 기반)
   * @param {string} userId
   * @param {number} pageSize
   * @param {Object} cursor
   * @returns {Promise<{entries:Array, nextCursor:Object|null, hasNext:boolean}>}
   */
  async getUserLikedEntries(userId, pageSize, cursor = null) {
    if (!userId) {
      const err = new Error("userId가 필요합니다.");
      err.code = "BAD_REQUEST";
      throw err;
    }

    let query = db
      .collection(MISSION_LIKES_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .orderBy(FieldPath.documentId());

    if (cursor && cursor.docId && cursor.createdAtMillis) {
      const startTimestamp = Timestamp.fromMillis(cursor.createdAtMillis);
      query = query.startAfter(startTimestamp, cursor.docId);
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const docs = snapshot.docs;
    const hasNext = docs.length > pageSize;
    const docsToProcess = hasNext ? docs.slice(0, pageSize) : docs;

    const entries = docsToProcess.map((doc) => {
      const data = doc.data();
      return {
        docId: doc.id,
        missionId: data.missionId,
        likedAt: data.createdAt,
      };
    });

    let nextCursor = null;
    if (hasNext) {
      const lastDoc = docs[docs.length - 1];
      const lastCreatedAt = lastDoc.get("createdAt");
      nextCursor = {
        docId: lastDoc.id,
        createdAtMillis: lastCreatedAt?.toMillis?.() || null,
      };
    }

    return {
      entries,
      nextCursor,
      hasNext,
    };
  }
}

module.exports = new MissionLikeService();

