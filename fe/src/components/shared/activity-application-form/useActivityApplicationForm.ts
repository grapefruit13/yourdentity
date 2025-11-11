"use client";

import { useState, useCallback } from "react";
import type { ActivityApplicationFormData } from "./types";

/**
 * @description 활동 신청 폼 상태 관리 hook
 */
export const useActivityApplicationForm = (
  initialData?: Partial<ActivityApplicationFormData>
) => {
  const [formData, setFormData] = useState<ActivityApplicationFormData>({
    canAttendEvents: false,
    nickname: "",
    phoneNumber: "",
    region: null,
    currentSituation: "",
    applicationSource: "",
    applicationMotivation: "",
    customMotivation: "",
    agreedToTerms: false,
    ...initialData,
  });

  // 모달/바텀시트 상태
  const [showNicknameConfirm, setShowNicknameConfirm] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [showSituationPicker, setShowSituationPicker] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showMotivationPicker, setShowMotivationPicker] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);

  // 지역 선택 상태
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(
    null
  );

  // 폼 데이터 업데이트
  const updateFormData = useCallback(
    (updates: Partial<ActivityApplicationFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // 닉네임 변경
  const handleNicknameChange = useCallback(
    (value: string) => {
      updateFormData({ nickname: value });
    },
    [updateFormData]
  );

  // 휴대폰 번호 변경
  const handlePhoneChange = useCallback(
    (value: string) => {
      // 숫자만 저장 (하이픈 제거)
      const numbersOnly = value.replace(/[^0-9]/g, "");
      updateFormData({ phoneNumber: numbersOnly });
    },
    [updateFormData]
  );

  // 지역 선택
  const handleRegionSelect = useCallback(
    (city: string, district: string) => {
      updateFormData({ region: { city, district } });
      setShowRegionPicker(false);
    },
    [updateFormData]
  );

  // 현재 상황 선택
  const handleSituationSelect = useCallback(
    (value: string) => {
      updateFormData({ currentSituation: value });
      setShowSituationPicker(false);
    },
    [updateFormData]
  );

  // 참여 경로 선택
  const handleSourceSelect = useCallback(
    (value: string) => {
      updateFormData({ applicationSource: value });
      setShowSourcePicker(false);
    },
    [updateFormData]
  );

  // 참여 동기 선택
  const handleMotivationSelect = useCallback(
    (value: string) => {
      if (value === "직접 입력하기") {
        updateFormData({ applicationMotivation: "직접 입력하기" });
        setShowMotivationPicker(false);
      } else {
        updateFormData({ applicationMotivation: value });
        setShowMotivationPicker(false);
      }
    },
    [updateFormData]
  );

  // 직접 입력한 동기 변경
  const handleCustomMotivationChange = useCallback(
    (value: string) => {
      updateFormData({ customMotivation: value });
    },
    [updateFormData]
  );

  return {
    formData,
    updateFormData,
    // Handlers
    handleNicknameChange,
    handlePhoneChange,
    handleRegionSelect,
    handleSituationSelect,
    handleSourceSelect,
    handleMotivationSelect,
    handleCustomMotivationChange,
    // Picker states
    showNicknameConfirm,
    setShowNicknameConfirm,
    showRegionPicker,
    setShowRegionPicker,
    showSituationPicker,
    setShowSituationPicker,
    showSourcePicker,
    setShowSourcePicker,
    showMotivationPicker,
    setShowMotivationPicker,
    showTermsSheet,
    setShowTermsSheet,
    // Region picker state
    selectedRegionCode,
    setSelectedRegionCode,
  };
};
