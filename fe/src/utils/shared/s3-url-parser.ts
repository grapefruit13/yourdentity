/**
 * @description S3 pre-signed URL 파싱 유틸리티
 * S3 pre-signed URL에서 만료 시간을 파싱하여 캐시 만료 시간을 설정
 */

import type { TGETHomeRes } from "@/types/generated/home-types";

/**
 * S3 pre-signed URL에서 만료 시간 파싱
 * @param url - S3 pre-signed URL
 * @returns 만료 시간 (밀리초) 또는 null
 */
export const parseS3UrlExpiry = (url: string): number | null => {
  try {
    // URL이 문자열이 아니거나 비어있는 경우
    if (!url || typeof url !== "string") {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ parseS3UrlExpiry: URL이 유효하지 않습니다.", url);
      }
      return null;
    }

    // S3 URL이 아닌 경우 null 반환
    if (!url.includes("amazonaws.com") || !url.includes("X-Amz-")) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ parseS3UrlExpiry: S3 URL이 아닙니다.", {
          hasAmazonaws: url.includes("amazonaws.com"),
          hasXAmz: url.includes("X-Amz-"),
          urlLength: url.length,
        });
      }
      return null;
    }

    // URL 인코딩 문제 해결: 이미 디코딩된 URL인지 확인
    let decodedUrl = url;
    try {
      // URL이 인코딩되어 있으면 디코딩 시도
      if (url.includes("%")) {
        decodedUrl = decodeURIComponent(url);
      }
    } catch {
      // 디코딩 실패 시 원본 URL 사용
      decodedUrl = url;
    }

    const urlObj = new URL(decodedUrl);
    const expires = urlObj.searchParams.get("X-Amz-Expires");
    const dateStr = urlObj.searchParams.get("X-Amz-Date");

    if (!expires || !dateStr) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ parseS3UrlExpiry: 만료 파라미터를 찾을 수 없습니다.", {
          hasExpires: !!expires,
          hasDateStr: !!dateStr,
          url: decodedUrl.substring(0, 100) + "...",
        });
      }
      return null;
    }

    // X-Amz-Date 형식: 20251106T234240Z
    // YYYYMMDDTHHMMSSZ
    if (dateStr.length < 15) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ parseS3UrlExpiry: 날짜 형식이 올바르지 않습니다.", {
          dateStr,
          length: dateStr.length,
        });
      }
      return null;
    }

    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 0-based
    const day = parseInt(dateStr.substring(6, 8), 10);
    const hour = parseInt(dateStr.substring(9, 11), 10);
    const minute = parseInt(dateStr.substring(11, 13), 10);
    const second = parseInt(dateStr.substring(13, 15), 10);

    const createdAt = new Date(
      Date.UTC(year, month, day, hour, minute, second)
    );
    const expiresInSeconds = parseInt(expires, 10);

    if (isNaN(expiresInSeconds) || isNaN(createdAt.getTime())) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ parseS3UrlExpiry: 날짜 파싱 실패", {
          expires,
          expiresInSeconds,
          dateStr,
          createdAt: createdAt.getTime(),
        });
      }
      return null;
    }

    // 만료 시간 = 생성 시간 + 유효 기간
    const expiresAt = new Date(createdAt.getTime() + expiresInSeconds * 1000);

    if (process.env.NODE_ENV === "development") {
      console.log("✅ parseS3UrlExpiry 성공:", {
        createdAt: createdAt.toISOString(),
        expiresInSeconds,
        expiresAt: expiresAt.toISOString(),
      });
    }

    return expiresAt.getTime();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ parseS3UrlExpiry 에러:", error, {
        url: url?.substring(0, 100),
      });
    }
    return null;
  }
};

/**
 * S3 pre-signed URL이 만료되었는지 확인
 * @param url - S3 pre-signed URL
 * @returns 만료 여부 (true: 만료됨, false: 유효함, null: S3 URL이 아님)
 */
export const isS3UrlExpired = (url: string): boolean | null => {
  const expiryTime = parseS3UrlExpiry(url);
  if (expiryTime === null) return null;
  return Date.now() >= expiryTime;
};

/**
 * 홈 데이터에서 가장 짧은 만료 시간 찾기
 * 모든 이미지 URL의 만료 시간을 확인하여 가장 짧은 만료 시간 반환
 * @param homeData - 홈 데이터
 * @returns 가장 짧은 만료 시간 (밀리초) 또는 null
 */
export const findEarliestExpiry = (homeData: TGETHomeRes): number | null => {
  const expiryTimes: number[] = [];

  // backgroundImage URL 확인
  homeData.backgroundImage?.forEach((img, index) => {
    if (img.url) {
      const expiry = parseS3UrlExpiry(img.url);
      if (expiry) {
        expiryTimes.push(expiry);
      } else if (process.env.NODE_ENV === "development") {
        console.warn(
          `⚠️ findEarliestExpiry: backgroundImage[${index}] URL 파싱 실패`,
          { url: img.url?.substring(0, 100) }
        );
      }
    }
  });

  // content의 image URL 확인
  homeData.content?.forEach((item, index) => {
    if (item.type === "image" && item.url) {
      const expiry = parseS3UrlExpiry(item.url);
      if (expiry) {
        expiryTimes.push(expiry);
      } else if (process.env.NODE_ENV === "development") {
        console.warn(
          `⚠️ findEarliestExpiry: content[${index}] image URL 파싱 실패`,
          { url: item.url?.substring(0, 100) }
        );
      }
    }
  });

  if (expiryTimes.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ findEarliestExpiry: 파싱 가능한 S3 URL이 없습니다.", {
        backgroundImageCount: homeData.backgroundImage?.length || 0,
        contentImageCount:
          homeData.content?.filter((item) => item.type === "image").length || 0,
      });
    }
    return null;
  }

  // 가장 짧은 만료 시간 반환 (가장 먼저 만료되는 URL)
  const earliestExpiry = Math.min(...expiryTimes);
  if (process.env.NODE_ENV === "development") {
    console.log("✅ findEarliestExpiry 성공:", {
      earliestExpiry: new Date(earliestExpiry).toISOString(),
      totalUrls: expiryTimes.length,
    });
  }
  return earliestExpiry;
};

/**
 * 홈 데이터에 만료된 S3 URL이 있는지 확인
 * @param homeData - 홈 데이터
 * @returns 만료된 URL이 있으면 true, 없으면 false
 */
export const hasExpiredS3Urls = (homeData: TGETHomeRes): boolean => {
  // backgroundImage URL 확인
  const hasExpiredBackground = homeData.backgroundImage?.some((img) => {
    if (!img.url) return false;
    const expired = isS3UrlExpired(img.url);
    return expired === true;
  });

  if (hasExpiredBackground) return true;

  // content의 image URL 확인
  const hasExpiredContent = homeData.content?.some((item) => {
    if (item.type !== "image" || !item.url) return false;
    const expired = isS3UrlExpired(item.url);
    return expired === true;
  });

  return hasExpiredContent === true;
};
