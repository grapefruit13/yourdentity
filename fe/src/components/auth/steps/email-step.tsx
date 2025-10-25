import ButtonBase from "@/components/shared/base/button-base";
import Input from "@/components/shared/input";
import { Typography } from "@/components/shared/typography";
import { useSignup } from "@/contexts/auth/signup-context";

const EmailStep = () => {
  const { dispatch } = useSignup();
  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 2 });
  };

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex h-fit w-full flex-col gap-10">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-1">
            <Typography font="noto" variant="title5">
              이메일 입력
            </Typography>
            <Typography font="noto" variant="body2R" className="text-gray-600">
              로그인 시 사용할 이메일을 입력해주세요.
            </Typography>
          </div>
          <div className="flex flex-col gap-3">
            <Typography font="noto" variant="body2M">
              아이디(이메일)
            </Typography>
            <Input type="email" placeholder="이메일을 입력하세요." />
          </div>
        </div>
        <div className="mx-auto flex items-center gap-1">
          <Typography font="noto" variant="label1M" className="text-gray-400">
            이미 계정이 있으신가요?
          </Typography>
          <ButtonBase>
            <Typography
              font="noto"
              variant="label1M"
              className="text-gray-400 underline"
            >
              로그인
            </Typography>
          </ButtonBase>
        </div>
      </div>
      <ButtonBase
        onClick={handleNext}
        className="bg-primary-600 w-full justify-center rounded-lg py-2 hover:cursor-pointer"
      >
        <Typography font="noto" variant="body1B" className="text-white">
          다음
        </Typography>
      </ButtonBase>
    </div>
  );
};

export default EmailStep;
