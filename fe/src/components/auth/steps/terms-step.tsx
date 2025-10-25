"use client";

import { useState } from "react";
import ButtonBase from "@/components/shared/base/button-base";
import { Checkbox } from "@/components/shared/checkbox";
import { Typography } from "@/components/shared/typography";
import { useSignup } from "@/contexts/auth/signup-context";

/**
 * @description 약관동의 스텝
 */
const TermsStep = () => {
  const { dispatch } = useSignup();
  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 4 });
  };

  type Terms = {
    age: boolean;
    usage: boolean;
    privacy: boolean;
  };

  const [termsAgreed, setTermsAgreed] = useState<Terms>({
    age: false,
    usage: false,
    privacy: false,
  });

  // 모든 하위 체크박스가 체크되었는지 확인
  const isAllChecked =
    termsAgreed.age && termsAgreed.usage && termsAgreed.privacy;

  /**
   * @description '모두 동의하기' 체크박스 핸들러
   * @param checked - 모두 동의하기 여부
   */
  const handleAllAgree = (checked: boolean) => {
    setTermsAgreed({
      age: checked,
      usage: checked,
      privacy: checked,
    });
  };

  /**
   * @description 개별 체크박스 핸들러
   * @param key - 체크박스 키
   * @param checked - 체크 여부
   */
  const handleIndividualCheck = (key: keyof Terms, checked: boolean) => {
    setTermsAgreed((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const isNextAvailable = isAllChecked;

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex w-full flex-col gap-7">
        <Typography font="noto" variant="title5">
          유스-잇 약관에 동의해주세요
        </Typography>
        {/* 약관동의 체크박스 */}
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={isAllChecked} onCheckedChange={handleAllAgree} />
            <Typography font="noto" variant="body1M" className="text-gray-900">
              모두 동의하기
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={termsAgreed.age}
              onCheckedChange={(checked) =>
                handleIndividualCheck("age", checked as boolean)
              }
            />
            <Typography font="noto" variant="body2M" className="text-gray-900">
              [필수] 만 14세 이상입니다.
            </Typography>
          </div>
          <div className="flex w-full items-center gap-2">
            <Checkbox
              checked={termsAgreed.usage}
              onCheckedChange={(checked) =>
                handleIndividualCheck("usage", checked as boolean)
              }
            />
            <div className="flex w-full items-center justify-between">
              <Typography
                font="noto"
                variant="body2M"
                className="text-gray-900"
              >
                [필수] 유스잇 이용약관 동의
              </Typography>
              <ButtonBase>
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-primary-600 underline"
                >
                  보기
                </Typography>
              </ButtonBase>
            </div>
          </div>
          <div className="flex w-full items-center gap-2">
            <Checkbox
              checked={termsAgreed.privacy}
              onCheckedChange={(checked) =>
                handleIndividualCheck("privacy", checked as boolean)
              }
            />
            <div className="flex w-full items-center justify-between">
              <Typography
                font="noto"
                variant="body2M"
                className="text-gray-900"
              >
                [필수] 개인정보 수집 및 이용 동의
              </Typography>
              <ButtonBase>
                <Typography
                  font="noto"
                  variant="body2M"
                  className="text-primary-600 underline"
                >
                  보기
                </Typography>
              </ButtonBase>
            </div>
          </div>
        </div>
      </div>
      <ButtonBase
        onClick={handleNext}
        disabled={!isNextAvailable}
        className="bg-primary-600 w-full justify-center rounded-lg py-2 hover:cursor-pointer disabled:opacity-50"
      >
        <Typography font="noto" variant="body1B" className="text-white">
          다음
        </Typography>
      </ButtonBase>
    </div>
  );
};

export default TermsStep;
