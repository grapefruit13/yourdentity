/**
 * Firebase Auth - 카카오 소셜 로그인 (OpenID Connect)
 */
import { FirebaseError } from "firebase/app";
import {
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  onAuthStateChanged,
  User,
  getIdToken,
  getAdditionalUserInfo,
  reauthenticateWithPopup,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { FIREBASE_AUTH_ERROR_CODES } from "@/constants/auth/_firebase-error-codes";
import { AUTH_MESSAGE } from "@/constants/auth/_message";
import { auth, functions } from "@/lib/firebase";
import { ErrorResponse, Result } from "@/types/shared/response";
import { debug } from "@/utils/shared/debugger";
import { post, del } from "./axios";

/**
 * @description 카카오 OAuth 제공업체 생성
 */
export const createKakaoProvider = () => {
  const provider = new OAuthProvider("oidc.kakao");

  // Kakao OpenID Connect 스코프 설정
  // - name: 이름(카카오 동의항목에서 name 필수 설정 필요)
  // - email: 이메일
  // - phone: 전화번호(표준 클레임 phone_number)
  // kakao developers에서 동의항목으로 설정한 필드들 추가(이름, 이메일, 번호, 성별, 생일, 출생 연도)
  provider.addScope("name");
  provider.addScope("account_email");
  provider.addScope("phone_number");
  provider.addScope("gender");
  provider.addScope("birthday");
  provider.addScope("birthyear");

  return provider;
};

/**
 * @description 네트워크 관련 Firebase 에러인지 확인
 */
const isNetworkError = (code: string): boolean => {
  return (
    code === FIREBASE_AUTH_ERROR_CODES.NETWORK_REQUEST_FAILED ||
    code === FIREBASE_AUTH_ERROR_CODES.INTERNAL_ERROR ||
    code === FIREBASE_AUTH_ERROR_CODES.TIMEOUT
  );
};

/**
 * @description 사용자 취소 관련 에러인지 확인
 */
const isCancelledError = (code: string): boolean => {
  return (
    code === FIREBASE_AUTH_ERROR_CODES.POPUP_CLOSED_BY_USER ||
    code === FIREBASE_AUTH_ERROR_CODES.CANCELLED_POPUP_REQUEST
  );
};

/**
 * @description Firebase 에러를 ErrorResponse로 변환 (일반 인증)
 */
const handleFirebaseAuthError = (error: FirebaseError): ErrorResponse => {
  const { code } = error;

  // 네트워크 관련 에러
  if (isNetworkError(code)) {
    return {
      status: 503,
      message: AUTH_MESSAGE.ERROR.NETWORK_ERROR,
    };
  }

  // 요청 제한 에러
  if (code === FIREBASE_AUTH_ERROR_CODES.TOO_MANY_REQUESTS) {
    return {
      status: 429,
      message: AUTH_MESSAGE.ERROR.TOO_MANY_REQUESTS,
    };
  }

  // 기타 인증 에러
  return {
    status: 401,
    message: AUTH_MESSAGE.LOGIN.INVALID_CREDENTIALS,
  };
};

/**
 * @description 카카오 로그인 전용 Firebase 에러를 ErrorResponse로 변환
 */
const handleKakaoAuthError = (error: FirebaseError): ErrorResponse => {
  const { code } = error;

  // 사용자 취소 관련 에러
  if (isCancelledError(code)) {
    return {
      status: 400,
      message: AUTH_MESSAGE.KAKAO.CANCELLED,
    };
  }

  // 팝업 차단 에러
  if (code === FIREBASE_AUTH_ERROR_CODES.POPUP_BLOCKED) {
    return {
      status: 400,
      message: AUTH_MESSAGE.KAKAO.POPUP_BLOCKED,
    };
  }

  // 네트워크 관련 에러
  if (isNetworkError(code)) {
    return {
      status: 503,
      message: AUTH_MESSAGE.KAKAO.NETWORK_ERROR,
    };
  }

  // 다른 인증 수단으로 이미 존재하는 계정
  if (
    code === FIREBASE_AUTH_ERROR_CODES.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL
  ) {
    return {
      status: 409,
      message: AUTH_MESSAGE.KAKAO.ACCOUNT_EXISTS,
    };
  }

  // 기타 인증 에러
  return {
    status: 401,
    message: AUTH_MESSAGE.KAKAO.FAILURE,
  };
};

/**
 * @description 카카오 로그인 - Popup 방식(test)
 */
export const signInWithKakao = async (): Promise<{
  isNewUser: boolean;
  kakaoAccessToken?: string;
}> => {
  try {
    const provider = createKakaoProvider();
    const result = await signInWithPopup(auth, provider);

    // null 체크 및 검증
    if (!result || !result.user) {
      const invalidResultError: ErrorResponse = {
        status: 500,
        message: AUTH_MESSAGE.KAKAO.FAILURE,
      };
      throw invalidResultError;
    }

    const additionalInfo = getAdditionalUserInfo(result);
    const isNewUser = additionalInfo?.isNewUser ?? false;
    const credential = OAuthProvider.credentialFromResult(result);
    const kakaoAccessToken = credential?.accessToken;

    debug.log(AUTH_MESSAGE.KAKAO.SUCCESS, result.user);
    return { isNewUser, kakaoAccessToken };
  } catch (error) {
    debug.warn("카카오 로그인 실패:", error);
    // TEMP
    alert("KAKAO ERROR:" + JSON.stringify(error));

    if (error instanceof FirebaseError) {
      alert("firebase Error:" + JSON.stringify(error));
      throw handleKakaoAuthError(error);
    }

    // 알 수 없는 에러
    const unknownError: ErrorResponse = {
      status: 500,
      message: AUTH_MESSAGE.ERROR.UNKNOWN_ERROR,
    };
    throw unknownError;
  }
};

/**
 * @description 이메일 회원가입
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    debug.log("이메일 회원가입 성공:", userCredential.user);
    return userCredential;
  } catch (err) {
    debug.warn("이메일 회원가입 실패");
    throw err;
  }
};

/**
 * @description 이메일 로그인
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<Result<UserCredential>> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    debug.log("이메일 로그인 성공:", userCredential.user);
    return { data: userCredential, status: 200 };
  } catch (error) {
    if (error instanceof FirebaseError) {
      throw handleFirebaseAuthError(error);
    }
    const unknownError: ErrorResponse = {
      status: 500,
      message: AUTH_MESSAGE.ERROR.UNKNOWN_ERROR,
    };
    throw unknownError;
  }
};

/**
 * @description 현재 로그인된 사용자 확인
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * @description 로그아웃
 * Firebase 로그아웃 백엔드 Refresh Token 무효화
 */
export const signOut = async (): Promise<void> => {
  try {
    // 1. 백엔드 API 호출 (Refresh Token 무효화)
    const token = await getFirebaseIdToken();
    if (token) {
      await post("auth/logout");
    }

    // 2. Firebase 로그아웃 (localStorage 자동 삭제)
    await auth.signOut();
  } catch {
    debug.warn("로그아웃 실패");
    // 에러가 나도 로컬 로그아웃은 진행
    await auth.signOut();
  }
};

/**
 * @description Auth 상태 변경 리스너
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * @description authorization header에 필요한 firebase 토큰 얻기
 */
export const getFirebaseIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await getIdToken(user);
  }
  return null;
};

/**
 * @description 이메일 중복 체크 (회원가입 전 검증)
 * 백엔드 Callable Function 호출
 */
export const checkEmailAvailability = async (
  email: string
): Promise<{
  available: boolean;
  existingProvider?: string;
  existingAuthType?: string;
}> => {
  try {
    const checkEmail = httpsCallable<
      { email: string },
      {
        available: boolean;
        existingProvider?: string;
        existingAuthType?: string;
      }
    >(functions, "checkEmailAvailability");

    const result = await checkEmail({ email });
    return result.data;
  } catch (error) {
    debug.warn("이메일 중복 체크 실패");
    throw error;
  }
};

/**
 * @description 회원 탈퇴
 * 1. 카카오 재인증으로 새로운 액세스 토큰 발급
 * 2. 백엔드 API 호출 (카카오 연결 해제 + Firestore 가명처리)
 * 3. Firebase Auth 사용자 삭제
 */
export const deleteUserAccount = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      const notLoggedInError: ErrorResponse = {
        status: 401,
        message: "로그인된 사용자가 없습니다",
      };
      throw notLoggedInError;
    }

    // 카카오 로그인 사용자인지 확인
    const isKakaoUser = user.providerData.some(
      (provider) => provider.providerId === "oidc.kakao"
    );

    let kakaoAccessToken: string | undefined;

    // 카카오 사용자인 경우 재인증으로 새로운 액세스 토큰 발급
    if (isKakaoUser) {
      try {
        const provider = createKakaoProvider();
        const result = await reauthenticateWithPopup(user, provider);
        const credential = OAuthProvider.credentialFromResult(result);
        kakaoAccessToken = credential?.accessToken;

        if (!kakaoAccessToken) {
          const tokenError: ErrorResponse = {
            status: 500,
            message: "카카오 액세스 토큰을 가져올 수 없습니다",
          };
          throw tokenError;
        }

        debug.log("카카오 재인증 성공, 액세스 토큰 발급 완료");
      } catch (reauthError) {
        debug.warn("카카오 재인증 실패:", reauthError);

        if (reauthError instanceof FirebaseError) {
          throw handleKakaoAuthError(reauthError);
        }

        throw reauthError;
      }
    }

    // 백엔드 API 호출 (카카오 연결 해제 + Firestore 가명처리 + Auth 사용자 삭제)
    await del("auth/delete-account", {
      data: kakaoAccessToken ? { kakaoAccessToken } : undefined,
    });

    debug.log("백엔드 탈퇴 처리 완료");

    // 주의: 백엔드에서 이미 Firebase Auth 사용자를 삭제함
    // 프론트에서는 로컬 세션만 정리
    await auth.signOut();

    debug.log("회원 탈퇴 완료 (로컬 세션 정리)");
  } catch (error) {
    debug.warn("회원 탈퇴 실패:", error);
    throw error;
  }
};
