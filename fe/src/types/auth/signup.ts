// types/auth/signup.ts
export interface SignupFormData {
  // 1단계: 이메일
  email: string;

  // 2단계: 비밀번호
  password: string;
  confirmPassword: string;

  // 3단계: 약관동의
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;

  // 4단계: 회원정보 (선택)
  name?: string;
  gender?: "male" | "female";
  birthYear?: number;
  profileImageUrl?: string;

  // 5단계: 닉네임
  nickname: string;
}

export type SignupStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface SignupState {
  currentStep: SignupStep;
  formData: SignupFormData;
  isLoading: boolean;
  errors: Partial<Record<keyof SignupFormData, string>>;
}
