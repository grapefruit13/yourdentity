const {FieldValue, Timestamp} = require("firebase-admin/firestore");
const {admin} = require("../config/database");
const FirestoreService = require("./firestoreService");
const NicknameService = require("./nicknameService");
const TermsService = require("./termsService");
const {isValidPhoneNumber, normalizeKoreanPhoneNumber, formatDate} = require("../utils/helpers");
const {AUTH_TYPES, SNS_PROVIDERS} = require("../constants/userConstants");
const fileService = require("./fileService");

/**
 * User Service (비즈니스 로직 계층)
 * Firebase Auth + Firestore 통합 관리
 */
class UserService {
  constructor() {
    this.firestoreService = new FirestoreService("users");
    this.nicknameService = new NicknameService();
    this.termsService = new TermsService();
  }

  /**
   * 온보딩 업데이트
   * - 허용 필드만 부분 업데이트
   * - 닉네임 중복 방지(트랜잭션)
   * @param {Object} params
   * @param {string} params.uid - 사용자 ID
   * @param {Object} params.payload - 업데이트할 데이터
   * @param {string} params.payload.nickname - 닉네임 (필수)
   * @param {string} [params.payload.profileImageUrl] - 프로필 이미지 URL (선택)
   * @param {string} [params.payload.bio] - 자기소개 (선택)
   * @return {Promise<{status:string}>}
   */
  async updateOnboarding({uid, payload}) {
    // 1) 현재 사용자 문서 조회
    const existing = await this.firestoreService.getById(uid);
    if (!existing) {
      const e = new Error("User document not found");
      e.code = "NOT_FOUND";
      throw e;
    }

    const restPayload = payload || {};

    // 2) 허용 필드 화이트리스트 적용
    const allowedFields = [
      "nickname",
      "profileImageUrl",
      "bio",
    ];
    const update = {};
    for (const key of allowedFields) {
      if (restPayload[key] !== undefined) update[key] = restPayload[key];
    }

    // 3) 필수 필드 체크
    if (!(typeof update.nickname === "string" && update.nickname.trim().length > 0)) {
      const e = new Error("REQUIRE_FIELDS_MISSING: nickname");
      e.code = "REQUIRE_FIELDS_MISSING";
      throw e;
    }

    // 4) 닉네임 설정
    const nickname = update.nickname;
    const setNickname = typeof nickname === "string" && nickname.trim().length > 0;

    if (setNickname) {
      await this.nicknameService.setNickname(nickname, uid, existing.nickname);
    }

    let newProfileImagePath = null;
    let newProfileImageUrl = update.profileImageUrl !== undefined ? update.profileImageUrl : null;
    let previousProfilePath = existing.profileImagePath || null;

    const requestedProfileUrl = typeof update.profileImageUrl === "string"
      ? update.profileImageUrl.trim()
      : null;

    if (requestedProfileUrl) {
      let profileFileDoc;
      try {
        profileFileDoc = await fileService.getFileByUrlForUser(requestedProfileUrl, uid);
      } catch (fileLookupError) {
        console.error("[USER][updateOnboarding] 프로필 파일 조회 실패", fileLookupError);
        throw fileLookupError;
      }

      const requestedProfilePath = profileFileDoc.filePath;

      if (previousProfilePath && requestedProfilePath === previousProfilePath) {
        newProfileImagePath = previousProfilePath;
        if (newProfileImageUrl === null) {
          newProfileImageUrl = existing.profileImageUrl || requestedProfileUrl;
        }
      } else {
        newProfileImagePath = profileFileDoc.filePath;
        if (newProfileImageUrl === null || newProfileImageUrl === requestedProfileUrl) {
          newProfileImageUrl = profileFileDoc.fileUrl || profileFileDoc.url || requestedProfileUrl;
        }

        try {
          await fileService.firestoreService.update(profileFileDoc.id, {
            profileOwner: uid,
            isUsed: true,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } catch (fileUpdateError) {
          console.error("[USER][updateOnboarding] 프로필 파일 메타데이터 업데이트 실패", fileUpdateError);
          throw fileUpdateError;
        }
      }
    }

    // 5) 온보딩 완료 처리
    const userUpdate = {
      ...update,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (newProfileImagePath) {
      userUpdate.profileImagePath = newProfileImagePath;
    }

    if (newProfileImageUrl !== null) {
      userUpdate.profileImageUrl = newProfileImageUrl;
    }

    // 사용자 문서 업데이트
    await this.firestoreService.update(uid, userUpdate);

    if (newProfileImagePath && previousProfilePath && previousProfilePath !== newProfileImagePath) {
      try {
        await fileService.deleteFile(previousProfilePath, uid);
      } catch (cleanupError) {
        console.warn("[USER][updateOnboarding] 이전 프로필 이미지 삭제 실패", cleanupError.message);
      }
    }

    return {success: true};
  }

  /**
   * 모든 사용자 조회
   * @return {Promise<Array<Object>>} 사용자 목록
   */
  async getAllUsers() {
    try {
      return await this.firestoreService.getAll();
    } catch (error) {
      console.error("사용자 목록 조회 에러:", error.message);
      const e = new Error("사용자 목록을 조회할 수 없습니다");
      e.code = "INTERNAL_ERROR";
      throw e;
    }
  }

  /**
   * 사용자 정보 조회
   * @param {string} uid - 사용자 ID
   * @return {Promise<Object|null>} 사용자 정보
   */
  async getUserById(uid) {
    try {
      return await this.firestoreService.getById(uid);
    } catch (error) {
      console.error("사용자 조회 에러:", error.message);
      const e = new Error("사용자를 조회할 수 없습니다");
      e.code = "INTERNAL_ERROR";
      throw e;
    }
  }

  /**
   * 마이페이지 정보 조회
   * @param {string} uid - 사용자 ID
   * @return {Promise<Object>} 마이페이지 정보
   */
  async getMyPage(uid) {
    try {
      const user = await this.firestoreService.getById(uid);
      if (!user) {
        const e = new Error("사용자를 찾을 수 없습니다");
        e.code = "NOT_FOUND";
        throw e;
      }

      return {
        activityParticipationCount: user.activityParticipationCount || 0,
        certificationPosts: user.certificationPosts || 0,
        rewardPoints: user.rewards || 0,
        name: user.name || "",
        profileImageUrl: user.profileImageUrl || "",
        bio: user.bio || "",
      };
    } catch (error) {
      console.error("마이페이지 조회 에러:", error.message);
      if (error.code === "NOT_FOUND") {
        throw error;
      }
      const e = new Error("마이페이지 정보를 조회할 수 없습니다");
      e.code = "INTERNAL_ERROR";
      throw e;
    }
  }

  /**
   * 사용자 정보 업데이트 (관리자용)
   * - 모든 필드 업데이트 가능
   * @param {string} uid - 사용자 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @return {Promise<Object>} 업데이트된 사용자 정보
   */
  async updateUser(uid, updateData) {
    try {
      const updatePayload = {
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      };

      return await this.firestoreService.update(uid, updatePayload);
    } catch (error) {
      console.error("사용자 업데이트 에러:", error.message);
      const e = new Error("사용자 정보를 업데이트할 수 없습니다");
      e.code = "INTERNAL_ERROR";
      throw e;
    }
  }

  /**
   * 사용자 삭제 (Firebase Auth + Firestore)
   * @param {string} uid
   * @return {Promise<void>}
   */
  async deleteUser(uid) {
    try {
      await admin.auth().deleteUser(uid);
      await this.firestoreService.delete(uid);
    } catch (error) {
      console.error("사용자 삭제 에러:", error.message);
      const e = new Error("사용자를 삭제할 수 없습니다");
      e.code = "INTERNAL_ERROR";
      throw e;
    }
  }

  /**
   * 카카오 OIDC userinfo + 서비스 약관 동기화
   * @param {string} uid
   * @param {string} accessToken
   */
  async syncKakaoProfile(uid, accessToken) {
    console.log(`[UserService] 카카오 프로필 동기화 시작 (uid: ${uid})`);
    
    const isEmulator = process.env.FUNCTIONS_EMULATOR === "true" || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;
    let userinfoJson;

    // 에뮬레이터 환경: Firebase Auth customClaims에서 더미 데이터 사용
    if (isEmulator && accessToken === "test") {
      const userRecord = await admin.auth().getUser(uid);
      const customClaims = userRecord.customClaims || {};
      
      userinfoJson = {
        name: customClaims.kakaoName || "테스트유저",
        gender: (customClaims.kakaoGender || "male").toLowerCase(),
        birthdate: customClaims.kakaoBirthdate || "2000-01-01",
        phone_number: customClaims.kakaoPhoneNumber || "01012345678",
        picture: customClaims.kakaoPicture || "",
      };
    } else {
      // 실제 환경: 카카오 API 호출
      const userinfoUrl = "https://kapi.kakao.com/v1/oidc/userinfo";
      const userinfoRes = await fetch(userinfoUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userinfoRes.ok) {
        const text = await userinfoRes.text();
        const e = new Error(`KAKAO_USERINFO_FAILED: ${userinfoRes.status} ${text}`);
        e.code = "KAKAO_USERINFO_FAILED";
        throw e;
      }

      userinfoJson = await userinfoRes.json();
    }

    const name = userinfoJson.name || "";
    const genderRaw = userinfoJson.gender || null; // "male" | "female" (소문자)
    const birthdateRaw = userinfoJson.birthdate || null; // YYYY-MM-DD 기대
    const phoneRaw = userinfoJson.phone_number || "";
    const profileImageUrl = userinfoJson.picture || "";

    // 기본 검증 (카카오 콘솔에서 필수 동의로 설정 가정)
    if (!genderRaw || !birthdateRaw || !phoneRaw) {
      const e = new Error("카카오에서 필수 정보를 받아올 수 없습니다");
      e.code = "REQUIRE_FIELDS_MISSING";
      throw e;
    }

    // gender 정규화 (소문자로 변환 및 검증)
    const genderNormalized = genderRaw?.toString().toLowerCase();
    const gender = genderNormalized === "male" || genderNormalized === "female" ? genderNormalized : null;
    if (!gender) {
      const e = new Error("카카오에서 받은 성별 정보가 유효하지 않습니다");
      e.code = "INVALID_INPUT";
      throw e;
    }

    // birthDate 정규화
    let birthDate;
    try {
      birthDate = formatDate(birthdateRaw);
    } catch (_) {
      const e = new Error("카카오에서 받은 생년월일 정보가 유효하지 않습니다");
      e.code = "INVALID_INPUT";
      throw e;
    }

    // 한국 번호 검증은 helper 내부에서 정규화 포함 수행
    if (!isValidPhoneNumber(String(phoneRaw))) {
      const e = new Error("카카오에서 받은 전화번호 정보가 유효하지 않습니다");
      e.code = "INVALID_INPUT";
      throw e;
    }
    // 저장은 정규화된 국내형으로
    const normalizedPhone = normalizeKoreanPhoneNumber(String(phoneRaw));

    // 2. 서비스 약관 동의 내역 조회
    console.log(`[UserService] 약관 동기화 호출`);
    await this.termsService.syncFromKakao(uid, accessToken);
    console.log(`[UserService] 약관 동기화 완료`);

    // 3. Firestore 업데이트 준비
    const update = {
      name: name || null,
      birthDate,
      gender,
      phoneNumber: normalizedPhone,
      profileImageUrl,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // 4. 문서 존재 여부 확인 후 upsert
    const existing = await this.firestoreService.getById(uid);
    if (!existing) {
      await this.firestoreService.create({
        nickname: "",
        authType: AUTH_TYPES.SNS,
        snsProvider: SNS_PROVIDERS.KAKAO,
        createdAt: FieldValue.serverTimestamp(),
        lastLogin: FieldValue.serverTimestamp(),
        ...update,
      }, uid);
    } else {
      await this.firestoreService.update(uid, update);
    }

    // 5. Notion에 사용자 동기화 (비동기로 실행, 실패해도 메인 프로세스에 영향 없음)
    const notionUserService = require("./notionUserService");
    notionUserService.syncSingleUserToNotion(uid)
      .then(result => {
        if (result.success) {
          console.log(`Notion 동기화 완료: ${uid}`);
        } else {
          console.warn(`Notion 동기화 실패: ${uid} - ${result.error || result.reason}`);
        }
      })
      .catch(error => {
        console.error(`Notion 동기화 오류: ${uid}`, error);
      });


    return {success: true};
  }

  /**
   * @param {Array<string>} postIds - 게시글 ID 목록
   * @param {Object} communityIdMap - postId를 communityId로 매핑
   * @return {Promise<Array>} 처리된 게시글 목록
   */
  async getPostsByIds(postIds, communityIdMap) {
    if (!postIds || postIds.length === 0) {
      return [];
    }

    // CommunityService 인스턴스 생성 (lazy loading으로 순환 참조 방지)
    const CommunityService = require("./communityService");
    const communityService = new CommunityService();

    // 커뮤니티 정보 조회
    const communities = await communityService.firestoreService.getCollection("communities");
    const communityMap = {};
    communities.forEach(community => {
      communityMap[community.id] = community;
    });


    const postsByCommunity = {};
    postIds.forEach(postId => {
      const communityId = communityIdMap[postId];
      if (communityId) {
        if (!postsByCommunity[communityId]) {
          postsByCommunity[communityId] = [];
        }
        postsByCommunity[communityId].push(postId);
      }
    });


    const {FieldPath} = require("firebase-admin/firestore");
    
    const communityPromises = Object.entries(postsByCommunity).map(async ([communityId, communityPostIds]) => {
      try {
        const postsService = new FirestoreService(`communities/${communityId}/posts`);
        
        // 10개씩 나누어서 처리 (Firestore in 쿼리 최대 10개 제한)
        const chunks = [];
        for (let i = 0; i < communityPostIds.length; i += 10) {
          chunks.push(communityPostIds.slice(i, i + 10));
        }

        const allPosts = [];
        for (const chunk of chunks) {
          const posts = await postsService.getWhereMultiple([
            { field: FieldPath.documentId(), operator: "in", value: chunk }
          ]);
          posts.forEach(post => {
            allPosts.push({
              ...post,
              communityId,
              community: communityMap[communityId] ? {
                id: communityId,
                name: communityMap[communityId].name,
              } : null,
            });
          });
        }
        return allPosts;
      } catch (error) {
        console.error(`Error fetching posts for community ${communityId}:`, error.message);
        return [];
      }
    });

    const postsArrays = await Promise.all(communityPromises);
    const allPostsFlat = postsArrays.flat();
    
    const postsMap = {};
    allPostsFlat.forEach(post => {
      postsMap[post.id] = post;
    });
    
    const allPosts = postIds
      .map(postId => postsMap[postId])
      .filter(post => post !== undefined);

    const processPost = (post) => {
      const { authorId: _, ...postWithoutAuthorId } = post;
      const createdAtDate = post.createdAt?.toDate?.() || post.createdAt;
      const processedPost = {
        ...postWithoutAuthorId,
        createdAt: createdAtDate?.toISOString?.() || post.createdAt,
        updatedAt: post.updatedAt?.toDate?.()?.toISOString?.() || post.updatedAt,
        scheduledDate: post.scheduledDate?.toDate?.()?.toISOString?.() || post.scheduledDate,
        timeAgo: createdAtDate ? communityService.getTimeAgo(new Date(createdAtDate)) : "",
        communityPath: `communities/${post.communityId}`,
        rewardGiven: post.rewardGiven || false,
        reportsCount: post.reportsCount || 0,
        viewCount: post.viewCount || 0,
      };

      processedPost.preview = post.preview || communityService.createPreview(post);
      delete processedPost.content;
      delete processedPost.media;
      delete processedPost.communityId;

      return processedPost;
    };

    return allPosts.map(processPost);
  }

  /**
   * 사용자 서브컬렉션에서 게시글 조회 (공통 헬퍼)
   * @param {string} userId - 사용자 ID
   * @param {string} subCollectionName - 서브컬렉션 이름 (authoredPosts, likedPosts, commentedPosts)
   * @param {string} orderBy - 정렬 필드
   * @param {Object} options - 조회 옵션
   * @param {string} errorMessage - 에러 메시지
   * @return {Promise<Object>} 게시글 목록과 페이지네이션
   */
  async getMyPostsFromSubCollection(userId, subCollectionName, orderBy, options = {}, errorMessage) {
    try {
      const { page = 0, size = 10 } = options;

      const postsService = new FirestoreService(`users/${userId}/${subCollectionName}`);
      const result = await postsService.getWithPagination({
        page: parseInt(page),
        size: parseInt(size),
        orderBy,
        orderDirection: "desc",
      });

      const postIds = [];
      const communityIdMap = {};
      result.content.forEach(({postId, communityId}) => {
        if (postId && communityId) {
          postIds.push(postId);
          communityIdMap[postId] = communityId;
        }
      });

      if (postIds.length === 0) {
        return {
          content: [],
          pagination: result.pageable || {
            pageNumber: page,
            pageSize: size,
            totalElements: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
            isFirst: true,
            isLast: true,
          },
        };
      }

      const posts = await this.getPostsByIds(postIds, communityIdMap);

      return {
        content: posts,
        pagination: result.pageable || {},
      };
    } catch (error) {
      console.error(`${errorMessage} error:`, error.message);
      if (error.code) {
        throw error;
      }
      const wrapped = new Error(errorMessage);
      wrapped.code = "INTERNAL_ERROR";
      throw wrapped;
    }
  }

  /**
   * 내가 작성한 게시글 조회
   * @param {string} userId - 사용자 ID
   * @param {Object} options - 조회 옵션
   * @return {Promise<Object>} 게시글 목록과 페이지네이션
   */
  async getMyAuthoredPosts(userId, options = {}) {
    return this.getMyPostsFromSubCollection(
      userId,
      "authoredPosts",
      "createdAt",
      options,
      "내가 작성한 게시글 조회에 실패했습니다"
    );
  }

  /**
   * 내가 좋아요한 게시글 조회
   * @param {string} userId - 사용자 ID
   * @param {Object} options - 조회 옵션
   * @return {Promise<Object>} 게시글 목록과 페이지네이션
   */
  async getMyLikedPosts(userId, options = {}) {
    return this.getMyPostsFromSubCollection(
      userId,
      "likedPosts",
      "lastLikedAt",
      options,
      "내가 좋아요한 게시글 조회에 실패했습니다"
    );
  }

  /**
   * 내가 댓글 단 게시글 조회
   * @param {string} userId - 사용자 ID
   * @param {Object} options - 조회 옵션
   * @return {Promise<Object>} 게시글 목록과 페이지네이션
   */
  async getMyCommentedPosts(userId, options = {}) {
    return this.getMyPostsFromSubCollection(
      userId,
      "commentedPosts",
      "lastCommentedAt",
      options,
      "내가 댓글 단 게시글 조회에 실패했습니다"
    );
  }

  /**
   * 내가 참여 중인 커뮤니티 조회 (postType별 그룹화)
   * @param {string} userId - 사용자 ID
   * @return {Promise<Object>} postType별로 그룹화된 커뮤니티 목록
   */
  async getMyParticipatingCommunities(userId) {
    try {
     
      const tempService = new FirestoreService("temp");
      
      let allMembers = [];
      let currentPage = 0;
      const pageSize = 100;
      let hasMore = true;

      while (hasMore) {
        try {
          const pageResult = await tempService.getCollectionGroup("members", {
            where: [
              { field: "userId", operator: "==", value: userId }
            ],
            size: pageSize,
            page: currentPage,
            orderBy: "joinedAt",
            orderDirection: "desc"
          });

          allMembers = allMembers.concat(pageResult.content || []);
          hasMore = pageResult.pageable?.hasNext || false;
          currentPage++;

          if (currentPage >= 10) {
            break;
          }
        } catch (error) {
          
          if (error.code === 9 || error.message.includes("FAILED_PRECONDITION") || error.message.includes("AggregateQuery")) {

            const fallbackResult = await tempService.getCollectionGroupWithoutCount("members", {
              where: [
                { field: "userId", operator: "==", value: userId }
              ],
              size: 1000, 
              orderBy: "joinedAt",
              orderDirection: "desc"
            });
            allMembers = fallbackResult.content || [];
            hasMore = false;
          } else {
            throw error;
          }
          break;
        }
      }

      const membersResult = {
        content: allMembers,
        pageable: {}
      };

      const communityIds = [...new Set(
        membersResult.content
          .map(member => member.communityId)
          .filter(id => id) 
      )];

      if (communityIds.length === 0) {
        return {
          "routine": { "label": "한끗 루틴", "items": [] },
          "gathering": { "label": "월간 소모임", "items": [] },
          "tmi": { "label": "TMI", "items": [] }
        };
      }

      const chunkedIds = [];
      for (let i = 0; i < communityIds.length; i += 10) {
        chunkedIds.push(communityIds.slice(i, i + 10));
      }

      const communitiesChunked = await Promise.all(
        chunkedIds.map(chunk =>
          this.firestoreService.getCollectionWhereIn("communities", "id", chunk)
        )
      );

      const communities = communitiesChunked.flat();
      
      const PROGRAM_TYPE_ALIASES = {
        ROUTINE: ["ROUTINE", "한끗루틴", "한끗 루틴", "루틴"],
        GATHERING: ["GATHERING", "월간 소모임", "월간소모임", "소모임"],
        TMI: ["TMI", "티엠아이"],
      };

      const normalizeProgramType = (value) => {
        if (!value || typeof value !== "string") {
          return null;
        }
        const trimmed = value.trim();
        const upper = trimmed.toUpperCase();

        for (const [programType, aliases] of Object.entries(PROGRAM_TYPE_ALIASES)) {
          if (aliases.some((alias) => {
            if (typeof alias !== "string") return false;
            const aliasTrimmed = alias.trim();
            return aliasTrimmed === trimmed || aliasTrimmed.toUpperCase() === upper;
          })) {
            return programType;
          }
        }

        return null;
      };

      const legacyPostTypeToProgramType = {
        ROUTINE_CERT: "ROUTINE",
        ROUTINE_REVIEW: "ROUTINE",
        GATHERING_CERT: "GATHERING",
        GATHERING_REVIEW: "GATHERING",
        TMI_CERT: "TMI",
        TMI_REVIEW: "TMI",
        TMI: "TMI",
        ROUTINE: "ROUTINE",
        GATHERING: "GATHERING",
      };

      const programTypeMapping = {
        ROUTINE: { key: "routine", label: "한끗 루틴" },
        GATHERING: { key: "gathering", label: "월간 소모임" },
        TMI: { key: "tmi", label: "TMI" },
      };

      const grouped = {
        "routine": { "label": "한끗 루틴", "items": [] },
        "gathering": { "label": "월간 소모임", "items": [] },
        "tmi": { "label": "TMI", "items": [] }
      };

      communities.forEach(community => {
        let programType = normalizeProgramType(community.programType);
        if (!programType && community.postType && legacyPostTypeToProgramType[community.postType]) {
          programType = legacyPostTypeToProgramType[community.postType];
        }

        if (programType && programTypeMapping[programType]) {
          const typeInfo = programTypeMapping[programType];
          grouped[typeInfo.key].items.push({
            id: community.id,
            name: community.name
          });
        }
      });

      return grouped;
    } catch (error) {
      console.error("내가 참여 중인 커뮤니티 조회 에러:", error.message);
      if (error.code) {
        throw error;
      }
      const e = new Error("내가 참여 중인 커뮤니티 조회에 실패했습니다");
      e.code = "INTERNAL_ERROR";
      throw e;
    }
  }
}

module.exports = UserService;