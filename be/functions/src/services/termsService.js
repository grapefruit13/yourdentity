const {FieldValue, Timestamp} = require("firebase-admin/firestore");
const {admin} = require("../config/database");
const {TERMS_VERSIONS, TERMS_TAGS} = require("../constants/termsConstants");
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
   * 카카오 약관 동기화 (전체 프로세스)
   * @param {string} uid
   * @param {string} accessToken
   */
  async syncFromKakao(uid, accessToken) {
    const isEmulator = process.env.FUNCTIONS_EMULATOR === "true" || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;
    
    let termsData;
    if (isEmulator && accessToken === "test") {
      termsData = await this.parseEmulatorTerms(uid);
    } else {
      termsData = await this.fetchKakaoTerms(accessToken);
    }

    return this.updateUserTerms(uid, termsData);
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
   * 실제 카카오 API에서 약관 정보 조회
   * @param {string} accessToken
   */
  async fetchKakaoTerms(accessToken) {
    const termsUrl = "https://kapi.kakao.com/v2/user/service_terms";
    const termsRes = await fetch(termsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!termsRes.ok) {
      console.warn(`[TermsService] 약관 조회 실패: ${termsRes.status}`);
      return {
        serviceVersion: null,
        privacyVersion: null,
        age14Version: null,
        pushAgreed: false,
        termsAgreedAt: null
      };
    }

    const termsJson = await termsRes.json();
    const allowedTerms = termsJson.allowed_service_terms || [];
    
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

  /**
   * 사용자 약관 정보 업데이트
   * @param {string} uid
   * @param {Object} termsData
   */
  async updateUserTerms(uid, termsData) {
    const {serviceVersion, privacyVersion, age14Agreed, pushAgreed, termsAgreedAt} = termsData;

    const update = {};

    // 약관 정보 추가
    if (serviceVersion || privacyVersion || age14Agreed || pushAgreed) {
      if (serviceVersion) update.serviceTermsVersion = serviceVersion;
      if (privacyVersion) update.privacyTermsVersion = privacyVersion;
      update.age14TermsAgreed = !!age14Agreed;
      update.pushTermsAgreed = !!pushAgreed;
      if (termsAgreedAt) {
        update.termsAgreedAt = Timestamp.fromDate(new Date(termsAgreedAt));
      } else {
        update.termsAgreedAt = FieldValue.serverTimestamp();
      }
    }

    await this.firestoreService.update(uid, update);
    return {success: true};
  }
}

module.exports = TermsService;
