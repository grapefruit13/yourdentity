import SignupFlow from "@/components/auth/signup/signup-flow";
import { SignupProvider } from "@/contexts/auth/signup-context";

/**
 * @description 이메일 회원가입
 */
const page = () => {
  return (
    <SignupProvider>
      <SignupFlow />
    </SignupProvider>
  );
};

export default page;
