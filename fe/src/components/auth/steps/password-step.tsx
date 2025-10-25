"use client";

import ButtonBase from "@/components/shared/base/button-base";
import Input from "@/components/shared/input";
import { Typography } from "@/components/shared/typography";
import { useSignup } from "@/contexts/auth/signup-context";

const PasswordStep = () => {
  const { dispatch } = useSignup();
  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 3 });
  };
  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex w-full flex-col gap-10">
        <div className="flex w-full flex-col gap-7">
          <div className="flex flex-col gap-5">
            <div className="flex w-full flex-col gap-1">
              <Typography font="noto" variant="title5">
                비밀번호 설정
              </Typography>
              <Typography
                font="noto"
                variant="body2R"
                className="text-gray-600"
              >
                최소 6자 이상의 대소문자, 숫자, 특수문자를 <br /> 조합해서
                사용하세요.
              </Typography>
            </div>
            <div className="bg-primary-50 mx-auto flex w-full items-center justify-center gap-2 rounded py-3">
              <Typography
                font="noto"
                variant="label1B"
                className="text-gray-500"
              >
                아이디
              </Typography>
              <Typography
                font="noto"
                variant="label1B"
                className="text-gray-700"
              >
                yourdentity@gmail.com
              </Typography>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Typography font="noto" variant="body2M">
              비밀번호
            </Typography>
            <Input type="password" placeholder="비밀번호를 입력하세요" />
          </div>
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

export default PasswordStep;
