import React from "react";
import ButtonBase from "@/components/shared/base/button-base";
import Input from "@/components/shared/input";
import { Typography } from "@/components/shared/typography";
import { useSignup } from "@/contexts/auth/signup-context";

/**
 * @description 회원정보 입력 스텝
 */
const InfoStep = () => {
  const { state, dispatch } = useSignup();
  const { gender } = state.formData;

  const handleGenderChange = (selectedGender: "male" | "female") => {
    dispatch({
      type: "UPDATE_FORM_DATA",
      payload: { gender: selectedGender },
    });
  };

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 5 });
  };

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex h-fit w-full flex-col gap-10">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-1">
            <Typography font="noto" variant="title5">
              회원정보 입력 (선택)
            </Typography>
          </div>
          <div className="flex flex-col gap-3">
            <Typography font="noto" variant="body2M">
              이름(실명)
            </Typography>
            <Input type="text" placeholder="이름을 입력해주세요." />
          </div>
          <div className="flex flex-col gap-3">
            <Typography font="noto" variant="body2M">
              성별
            </Typography>
            <div className="flex w-full items-center gap-2">
              <ButtonBase
                onClick={() => handleGenderChange("male")}
                className={`w-full justify-center rounded-lg py-1.5 ${
                  gender === "male"
                    ? "bg-primary-600"
                    : "border border-gray-300 bg-white"
                }`}
              >
                <Typography
                  font="noto"
                  variant="body2M"
                  className={gender === "male" ? "text-white" : "text-gray-700"}
                >
                  남자
                </Typography>
              </ButtonBase>
              <ButtonBase
                onClick={() => handleGenderChange("female")}
                className={`w-full justify-center rounded-lg py-1.5 ${
                  gender === "female"
                    ? "bg-primary-600"
                    : "border border-gray-300 bg-white"
                }`}
              >
                <Typography
                  font="noto"
                  variant="body2M"
                  className={
                    gender === "female" ? "text-white" : "text-gray-700"
                  }
                >
                  여자
                </Typography>
              </ButtonBase>
            </div>
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

export default InfoStep;
