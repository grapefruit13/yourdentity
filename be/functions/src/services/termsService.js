const {FieldValue, Timestamp} = require("firebase-admin/firestore");
const {admin} = require("../config/database");
const {TERMS_VERSIONS, TERMS_TAGS} = require("../constants/termsConstants");
const {KAKAO_API_TIMEOUT, KAKAO_API_RETRY_DELAY, KAKAO_API_MAX_RETRIES} = require("../constants/kakaoConstants");
const {fetchKakaoAPI} = require("../utils/kakaoApiHelper");
const FirestoreService = require("./firestoreService");

/**
 * 약관 관리 서비스
 * 약관 동의 저장 및 카카오 약관 동기화
 */
class TermsService {
  constructor() {
    this.firestoreService = new FirestoreService("users");
  }

  /**
   * 약관 데이터 검증 (필수 정보 확인)
   * @param {Object} termsData
   * @param {string} uid
   * @throws {Error} 약관 정보가 없으면 에러
   */
  validateTermsData(termsData, uid) {
    const {serviceVersion, privacyVersion, age14Agreed, pushAgreed} = termsData;
    
    if (!serviceVersion && !privacyVersion && !age14Agreed && !pushAgreed) {
      console.error(`[KAKAO_TERMS_EMPTY] uid=${uid} - 약관 정보 없음`);
      const e = new Error("카카오 약관 정보를 받아올 수 없습니다. 카카오 계정 설정에서 약관 동의를 확인해주세요.");
      e.code = "KAKAO_TERMS_MISSING";
      throw e;
    }
  }

  /**
   * 약관 데이터를 Firestore 업데이트 객체로 변환
   * @param {Object} termsData
   * @param {string} uid
   * @return {Object} Firestore 업데이트 객체
   */
  prepareTermsUpdate(termsData, uid) {
    const {serviceVersion, privacyVersion, age14Agreed, pushAgreed, termsAgreedAt} = termsData;
    
    const termsUpdate = {};
    if (serviceVersion) termsUpdate.serviceTermsVersion = serviceVersion;
    if (privacyVersion) termsUpdate.privacyTermsVersion = privacyVersion;
    termsUpdate.age14TermsAgreed = !!age14Agreed;
    termsUpdate.pushTermsAgreed = !!pushAgreed;
    
    if (termsAgreedAt) {
      termsUpdate.termsAgreedAt = Timestamp.fromDate(new Date(termsAgreedAt));
    } else {
      termsUpdate.termsAgreedAt = FieldValue.serverTimestamp();
    }
    
    console.log(`[KAKAO_TERMS_PARSED] uid=${uid}`, {
      hasService: !!serviceVersion,
      hasPrivacy: !!privacyVersion,
      age14: !!age14Agreed,
      push: !!pushAgreed,
    });
    
    return termsUpdate;
  }

  /**
   * 에뮬레이터 약관 파싱 (테스트용)
   * @param {string} uid
   */
  async parseEmulatorTerms(uid) {
    const userRecord = await admin.auth().getUser(uid);
    const customClaims = userRecord.customClaims || {};
    
    const mockTerms = customClaims.kakaoTerms || [];
    console.log(`[TermsService] 에뮬레이터: 약관 ${mockTerms.length}개 발견`);
    
    let serviceVersion = null;
    let privacyVersion = null;
    let age14Agreed = false;
    let pushAgreed = false;
    let termsAgreedAt = null;

    for (const term of mockTerms) {
      if (term.tag === TERMS_TAGS.SERVICE) {
        serviceVersion = TERMS_VERSIONS.SERVICE;
        if (term.agreed_at && (!termsAgreedAt || term.agreed_at > termsAgreedAt)) {
          termsAgreedAt = term.agreed_at;
        }
      }
      if (term.tag === TERMS_TAGS.PRIVACY) {
        privacyVersion = TERMS_VERSIONS.PRIVACY;
        if (term.agreed_at && (!termsAgreedAt || term.agreed_at > termsAgreedAt)) {
          termsAgreedAt = term.agreed_at;
        }
      }
      if (term.tag === TERMS_TAGS.AGE14) {
        age14Agreed = true;
        if (term.agreed_at && (!termsAgreedAt || term.agreed_at > termsAgreedAt)) {
          termsAgreedAt = term.agreed_at;
        }
      }
      if (term.tag === TERMS_TAGS.PUSH) {
        pushAgreed = true;
        if (term.agreed_at && (!termsAgreedAt || term.agreed_at > termsAgreedAt)) {
          termsAgreedAt = term.agreed_at;
        }
      }
    }

    return {
      serviceVersion,
      privacyVersion,
      age14Agreed,
      pushAgreed,
      termsAgreedAt
    };
  }

  /**
   * 카카오 약관 API 호출 (타임아웃 설정, 실패 시 에러 throw)
   * @param {string} accessToken - 카카오 액세스 토큰
   * @param {number} maxRetries - 시도 횟수 (기본 1회, 재시도 없음)
   * @private
   */
  async _fetchKakaoTerms(accessToken, maxRetries = KAKAO_API_MAX_RETRIES) {
    const termsUrl = "https://kapi.kakao.com/v2/user/service_terms";
    
    return fetchKakaoAPI(termsUrl, accessToken, {
      maxRetries,
      retryDelay: KAKAO_API_RETRY_DELAY,
      timeout: KAKAO_API_TIMEOUT,
      throwOnError: true,
      serviceName: "TermsService",
    });
  }

  /**
   * 실제 카카오 API에서 약관 정보 조회
   * @param {string} accessToken
   */
  async fetchKakaoTerms(accessToken) {
    const termsRes = await this._fetchKakaoTerms(accessToken);
    const termsJson = await termsRes.json();
    const allowedTerms = termsJson.service_terms || [];
    
    // 카카오 API 응답 구조 확인용 로그 (디버깅)
    console.log(`[TermsService] 카카오 약관 API 응답 - 약관 개수: ${allowedTerms.length}`);
    if (allowedTerms.length > 0) {
      console.log('[TermsService] 첫 번째 약관 구조:', JSON.stringify(allowedTerms[0]));
    }
    
    let serviceVersion = null;
    let privacyVersion = null;
    let age14Agreed = false;
    let pushAgreed = false;
    let termsAgreedAt = null;

    // 카카오 태그 매핑으로 약관 동의 여부 확인
    for (const term of allowedTerms) {
      if (term.tag === TERMS_TAGS.SERVICE) {
        serviceVersion = TERMS_VERSIONS.SERVICE;
        if (term.agreed_at && (!termsAgreedAt || term.agreed_at > termsAgreedAt)) {
          termsAgreedAt = term.agreed_at;
        }
      }
      if (term.tag === TERMS_TAGS.PRIVACY) {
        privacyVersion = TERMS_VERSIONS.PRIVACY;
        if (term.agreed_at && (!termsAgreedAt || term.agreed_at > termsAgreedAt)) {
          termsAgreedAt = term.agreed_at;
        }
      }
      if (term.tag === TERMS_TAGS.AGE14) {
        age14Agreed = true;
        if (term.agreed_at && (!termsAgreedAt || term.agreed_at > termsAgreedAt)) {
          termsAgreedAt = term.agreed_at;
        }
      }
      if (term.tag === TERMS_TAGS.PUSH) {
        pushAgreed = true;
        if (term.agreed_at && (!termsAgreedAt || term.agreed_at > termsAgreedAt)) {
          termsAgreedAt = term.agreed_at;
        }
      }
    }

    return {
      serviceVersion,
      privacyVersion,
      age14Agreed,
      pushAgreed,
      termsAgreedAt
    };
  }

}

module.exports = TermsService;
