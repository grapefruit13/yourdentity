"use client";

import { useSignup } from "@/contexts/auth/signup-context";
import EmailStep from "../steps/email-step";
import InfoStep from "../steps/info-step";
import PasswordStep from "../steps/password-step";
import TermsStep from "../steps/terms-step";

const STEP_COMPONENTS = {
  1: EmailStep,
  2: PasswordStep,
  3: TermsStep,
  4: InfoStep,
  5: EmailStep,
  6: EmailStep,
} as const;

const SignupFlow = () => {
  const { state } = useSignup();
  const CurrentStepComponent = STEP_COMPONENTS[state.currentStep];
  return (
    <div className="h-full w-full px-5 py-6">
      <CurrentStepComponent />
    </div>
  );
};

export default SignupFlow;
