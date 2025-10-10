/**
 * Firebase Auth - 카카오 소셜 로그인 (OpenID Connect)
 */
import {
  OAuthProvider,
  signInWithPopup,
  UserCredential,
  onAuthStateChanged,
  User,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

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
 * @description 현재 로그인된 사용자 확인
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * @description 로그아웃
 */
export const signOut = async (): Promise<void> => {
  await auth.signOut();
  // TODO: 로그아웃 시 getFirebaseIdToken 시 null로만 옴. 카카오 로그아웃 기능도 필요
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
