import { NextRequest, NextResponse } from "next/server";

/**
 * @note SGIS 도메인 변경 안내 (2025-11-20)
 * - 기존: sgisapi.kostat.go.kr
 * - 변경: sgisapi.mods.go.kr (2025-11-20부터 적용)
 * 서비스 공식 오픈일이 11/20 이후이므로 새 도메인을 기본값으로 사용합니다.
 * 환경 변수 NEXT_PUBLIC_SGIS_API_DOMAIN으로 도메인을 설정할 수 있습니다.
 */
const SGIS_API_DOMAIN =
  process.env.NEXT_PUBLIC_SGIS_API_DOMAIN || "sgisapi.mods.go.kr";
const SGIS_API_BASE_URL = `https://${SGIS_API_DOMAIN}/OpenAPI3`;
const SGIS_AUTH_URL = `${SGIS_API_BASE_URL}/auth/authentication.json`;
const SGIS_ADDR_STAGE_URL = `${SGIS_API_BASE_URL}/addr/stage.json`;

// 액세스 토큰 캐시 (서버 사이드)
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * SGIS API 액세스 토큰 발급
 */
async function getAccessToken(): Promise<string> {
  const serviceId = process.env.NEXT_PUBLIC_SGIS_SERVICE_ID;
  const secureKey = process.env.NEXT_PUBLIC_SGIS_SECURE_KEY;

  if (!serviceId || !secureKey) {
    throw new Error("SGIS API 인증 정보가 설정되지 않았습니다.");
  }

  // 캐시된 토큰이 있고 아직 유효하면 재사용
  if (cachedAccessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  try {
    const response = await fetch(
      `${SGIS_AUTH_URL}?consumer_key=${serviceId}&consumer_secret=${secureKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SGIS 인증 실패: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.errCd !== 0) {
      throw new Error(`SGIS 인증 오류: ${data.errMsg || "알 수 없는 오류"}`);
    }

    const accessToken = data.result.accessToken;

    // 토큰 캐시 (23시간 후 만료로 설정)
    cachedAccessToken = accessToken;
    tokenExpiresAt = Date.now() + 23 * 60 * 60 * 1000; // 23시간

    return accessToken;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SGIS API] 액세스 토큰 발급 실패:", error);
    throw error;
  }
}

/**
 * 시도 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sidoCode = searchParams.get("sidoCode");

    const accessToken = await getAccessToken();

    const url = new URL(SGIS_ADDR_STAGE_URL);
    url.searchParams.append("accessToken", accessToken);
    if (sidoCode) {
      url.searchParams.append("cd", sidoCode);
    }
    url.searchParams.append("pg_yn", "0"); // 경계 미포함

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `SGIS 주소 조회 실패: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.errCd !== 0) {
      return NextResponse.json(
        { error: `SGIS 주소 조회 오류: ${data.errMsg || "알 수 없는 오류"}` },
        { status: 500 }
      );
    }

    // 응답 형식 변환
    interface SgisAddressItem {
      cd: string;
      addr_name: string;
      full_addr: string;
    }
    const result = (data.result || []).map((item: SgisAddressItem) => ({
      code: item.cd,
      name: item.addr_name,
      fullName: item.full_addr,
    }));

    return NextResponse.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[SGIS API] 주소 조회 실패:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
