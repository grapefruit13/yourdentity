const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const {TERM_TYPES, CURRENT_VERSIONS, REQUIRED_TERMS} = require("../schemas/userTermsSchema");

/**
 * 약관 동의 관리 서비스
 * Root Collection: user_terms/{recordId}
 * 
 * ⚠️ FirestoreService 미사용 이유:
 * - Batch 작업 필요 (한 번에 여러 약관 레코드 생성)
 * - 복잡한 쿼리 (where + orderBy + 중복 제거)
 * - 히스토리 관리 (타입별 최신 레코드 필터링)
 * → Guidelines 예외 조항에 따라 직접 Firestore 접근 허용
 */
class TermsService {
  constructor() {
    this.db = admin.firestore();
    this.collectionName = "user_terms";
  }

  /**
   * 약관 동의 레코드 생성
   * @param {string} userId - 사용자 UID
   * @param {Array<{type: string, agreed: boolean, version?: string}>} terms - 약관 배열
   * @returns {Promise<Array<string>>} 생성된 레코드 ID 배열
   */
  async createTermConsents(userId, terms) {
    if (!userId || !terms || terms.length === 0) {
      throw new Error("userId와 terms는 필수입니다.");
    }

    const batch = this.db.batch();
    const recordIds = [];

    for (const term of terms) {
      const {type, agreed, version} = term;

      // 유효성 검증
      if (!Object.values(TERM_TYPES).includes(type)) {
        throw new Error(`유효하지 않은 약관 타입: ${type}`);
      }

      // 버전 기본값 설정
      const termVersion = version || CURRENT_VERSIONS[type];

      // 새 레코드 생성
      const recordRef = this.db.collection(this.collectionName).doc();
      const recordData = {
        userId,
        type,
        version: termVersion,
        agreed,
        agreedAt: agreed ? FieldValue.serverTimestamp() : null,
        createdAt: FieldValue.serverTimestamp(),
      };

      batch.set(recordRef, recordData);
      recordIds.push(recordRef.id);
    }

    await batch.commit();
    return recordIds;
  }

  /**
   * 사용자의 최신 약관 동의 상태 조회
   * @param {string} userId - 사용자 UID
   * @returns {Promise<Array<Object>>} 약관 동의 레코드 배열
   */
  async getUserLatestTerms(userId) {
    if (!userId) {
      throw new Error("userId는 필수입니다.");
    }

    const snapshot = await this.db
        .collection(this.collectionName)
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    if (snapshot.empty) {
      return [];
    }

    // 타입별로 최신 레코드만 추출
    const termMap = new Map();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const key = `${data.type}_${data.version}`;

      if (!termMap.has(key)) {
        termMap.set(key, {id: doc.id, ...data});
      }
    });

    return Array.from(termMap.values());
  }

  /**
   * 필수 약관 동의 여부 확인
   * @param {string} userId - 사용자 UID
   * @returns {Promise<boolean>} 필수 약관 모두 동의 시 true
   */
  async checkRequiredTermsAgreed(userId) {
    const latestTerms = await this.getUserLatestTerms(userId);

    const agreedTypes = latestTerms
        .filter((term) => term.agreed)
        .map((term) => term.type);

    return REQUIRED_TERMS.every((requiredType) =>
      agreedTypes.includes(requiredType),
    );
  }

  /**
   * 특정 약관 동의 상태 업데이트 (새 레코드 생성)
   * @param {string} userId - 사용자 UID
   * @param {string} type - 약관 타입
   * @param {boolean} agreed - 동의 여부
   * @param {string} [version] - 약관 버전 (생략 시 현재 버전 사용)
   * @returns {Promise<string>} 생성된 레코드 ID
   */
  async updateTermConsent(userId, type, agreed, version) {
    const [recordId] = await this.createTermConsents(userId, [
      {type, agreed, version},
    ]);
    return recordId;
  }

  /**
   * 사용자의 모든 약관 동의 히스토리 조회
   * @param {string} userId - 사용자 UID
   * @returns {Promise<Array<Object>>} 약관 동의 히스토리 배열
   */
  async getUserTermHistory(userId) {
    if (!userId) {
      throw new Error("userId는 필수입니다.");
    }

    const snapshot = await this.db
        .collection(this.collectionName)
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
  }
}

module.exports = TermsService;

