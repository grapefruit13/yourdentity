/**
 * @description 공유 옵션 상수 정의
 */

import { debug } from "@/shared/utils/debugger";

export interface ShareOptionConfig {
  name: string;
  iconType: "facebook" | "twitter" | "whatsapp" | "line" | "email";
  action: () => void;
}

export interface AdditionalShareOption {
  name: string;
  icon: string;
}

/**
 * @description 주요 공유 옵션 설정
 */
export const mainShareOptionsConfig: ShareOptionConfig[] = [
  {
    name: "Facebook",
    iconType: "facebook",
    action: () => debug.log("Facebook 공유"),
  },
  {
    name: "X (Twitter)",
    iconType: "twitter",
    action: () => debug.log("X 공유"),
  },
  {
    name: "WhatsApp",
    iconType: "whatsapp",
    action: () => debug.log("WhatsApp 공유"),
  },
  {
    name: "Line",
    iconType: "line",
    action: () => debug.log("Line 공유"),
  },
  {
    name: "Email",
    iconType: "email",
    action: () => debug.log("Email 공유"),
  },
];

/**
 * @description 추가 공유 옵션들
 */
export const additionalShareOptions: AdditionalShareOption[] = [
  { name: "Instagram", icon: "📷" },
  { name: "Slack", icon: "💬" },
  { name: "Blogger", icon: "📝" },
  { name: "Reddit", icon: "🔗" },
  { name: "More", icon: "⋯" },
];
