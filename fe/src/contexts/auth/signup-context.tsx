"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { SignupState, SignupFormData, SignupStep } from "@/types/auth/signup";

type SignupAction =
  | { type: "SET_STEP"; payload: SignupStep }
  | { type: "UPDATE_FORM_DATA"; payload: Partial<SignupFormData> }
  | {
      type: "SET_ERRORS";
      payload: Partial<Record<keyof SignupFormData, string>>;
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

const initialState: SignupState = {
  currentStep: 1,
  formData: {
    email: "",
    password: "",
    confirmPassword: "",
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
    gender: "male", // 기본값으로 남자 설정
    nickname: "",
  },
  isLoading: false,
  errors: {},
};

const signupReducer = (
  state: SignupState,
  action: SignupAction
): SignupState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "UPDATE_FORM_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        errors: {}, // 폼 데이터 업데이트시 에러 초기화
      };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

const SignupContext = createContext<{
  state: SignupState;
  dispatch: React.Dispatch<SignupAction>;
} | null>(null);

export const SignupProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(signupReducer, initialState);

  return (
    <SignupContext.Provider value={{ state, dispatch }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error("useSignup must be used within SignupProvider");
  }
  return context;
};
