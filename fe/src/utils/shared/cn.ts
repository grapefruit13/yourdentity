import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @description classname 병합 함수
 * @param inputs 클래스 값 배열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
