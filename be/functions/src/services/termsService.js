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
   * 카카오 약관 API 호출 (타임아웃 10초, 실패 시 자동 재시도)
   * @param {string} accessToken - 카카오 액세스 토큰
   * @param {number} maxRetries - 총 시도 횟수 (기본 2회)
   * @private
   */
  async _fetchKakaoTerms(accessToken, maxRetries = 2) {
    const termsUrl = "https://kapi.kakao.com/v2/user/service_terms";
    const timeout = 10000; // 10초 타임아웃
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        console.log(`[TermsService] 카카오 약관 API 호출 시도 ${attempt}/${maxRetries}`);

        const response = await fetch(termsUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 성공
        if (response.ok) {
          console.log(`[TermsService] 카카오 약관 API 성공 (${attempt}번째 시도)`);
          return response;
        }

        // 401/403은 토큰 활성화 지연 가능성 → 재시도
        if ((response.status === 401 || response.status === 403) && attempt < maxRetries) {
          const retryDelay = 1500;
          console.warn(`[TermsService] 카카오 약관 API ${response.status}, ${retryDelay}ms 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        // 그 외 에러는 기본값 반환 (약관 실패해도 가입 진행)
        console.warn(`[TermsService] 약관 조회 실패: ${response.status} (기본값 반환)`);
        return null;

      } catch (fetchError) {
        // 타임아웃
        if (fetchError.name === "AbortError") {
          if (attempt < maxRetries) {
            console.warn(`[TermsService] 약관 API 타임아웃, 재시도 ${attempt}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
          console.warn(`[TermsService] 약관 API 타임아웃 (모든 재시도 소진, 기본값 반환)`);
          return null;
        }

        // 네트워크 에러 등
        if (attempt < maxRetries) {
          console.warn(`[TermsService] 약관 API 네트워크 에러, 재시도 ${attempt}/${maxRetries}:`, fetchError.message);
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }

        console.warn(`[TermsService] 약관 API 호출 실패 (모든 재시도 소진, 기본값 반환):`, fetchError.message);
        return null;
      }
    }
  }

  /**
   * 실제 카카오 API에서 약관 정보 조회
   * @param {string} accessToken
   */
  async fetchKakaoTerms(accessToken) {
    const termsRes = await this._fetchKakaoTerms(accessToken);

    // API 호출 실패 시 기본값 반환
    if (!termsRes) {
      return {
        serviceVersion: null,
        privacyVersion: null,
        age14Agreed: false,
        pushAgreed: false,
        termsAgreedAt: null
      };
    }

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

  /**
   * 사용자 약관 정보 업데이트
   * @param {string} uid
   * @param {Object} termsData
   */
  async updateUserTerms(uid, termsData) {
    const {serviceVersion, privacyVersion, age14Agreed, pushAgreed, termsAgreedAt} = termsData;

    const update = {};

    // 약관 정보가 있으면 추가
    if (serviceVersion || privacyVersion || age14Agreed || pushAgreed) {
      if (serviceVersion) update.serviceTermsVersion = serviceVersion;
      if (privacyVersion) update.privacyTermsVersion = privacyVersion;
      update.age14TermsAgreed = !!age14Agreed;
      update.pushTermsAgreed = !!pushAgreed;
      
      // 만 14세 동의가 없는 경우 모니터링 로그 (카카오 정책 변경 감지)
      if (!age14Agreed) {
        console.warn(`⚠️ [TermsService] 만 14세 동의 없음 (uid: ${uid}) - 카카오 정책 확인 필요`);
      }
      if (termsAgreedAt) {
        update.termsAgreedAt = Timestamp.fromDate(new Date(termsAgreedAt));
      } else {
        update.termsAgreedAt = FieldValue.serverTimestamp();
      }
    } else {
      // 약관 정보가 없으면 기본값으로 초기화 (최초 동기화 시)
      console.log(`[TermsService] 약관 정보 없음, 기본값으로 초기화 (uid: ${uid})`);
      update.serviceTermsVersion = null;
      update.privacyTermsVersion = null;
      update.age14TermsAgreed = false;
      update.pushTermsAgreed = false;
      update.termsAgreedAt = null;
    }

    await this.firestoreService.update(uid, update);
    return {success: true};
  }
}

module.exports = TermsService;
