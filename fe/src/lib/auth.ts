/**
 * Firebase Auth - 카카오 소셜 로그인 (OpenID Connect)
 */
import {
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  onAuthStateChanged,
  User,
  getIdToken,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/lib/firebase";

/**
 * @description 카카오 OAuth 제공업체 생성
 */
export const createKakaoProvider = () => {
  const provider = new OAuthProvider("oidc.kakao");

  // Kakao OpenID Connect 표준 스코프 (추후 이름, 출생년도 추가 예정)
  provider.addScope("openid");

  return provider;
};

/**
 * @description 카카오 로그인 - Popup 방식(test)
 */
export const signInWithKakao = async (): Promise<UserCredential> => {
  const provider = createKakaoProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
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

    console.log("이메일 회원가입 성공:", userCredential.user);
    return userCredential;
  } catch (error) {
    console.error("이메일 회원가입 실패:", error);
    throw error;
  }
};

/**
 * @description 이메일 로그인
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("이메일 로그인 성공:", userCredential.user);
    return userCredential;
  } catch (error) {
    console.error("이메일 로그인 실패:", error);
    throw error;
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
 * Firebase 로그아웃 + 백엔드 Refresh Token 무효화
 */
export const signOut = async (): Promise<void> => {
  try {
    // 1. 백엔드 API 호출 (Refresh Token 무효화)
    const token = await getFirebaseIdToken();
    if (token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // 2. Firebase 로그아웃 (localStorage 자동 삭제)
    await auth.signOut();
  } catch (error) {
    console.error("로그아웃 실패:", error);
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
    console.error("이메일 중복 체크 실패:", error);
    throw error;
  }
};
