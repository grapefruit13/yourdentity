import { NextResponse } from "next/server";

/**
 * @description CSRF 토큰 발급 API
 * GET /api/csrf
 */
export function GET() {
  // 클라이언트에서 생성한 토큰을 검증용으로 사용
  // 서버는 클라이언트가 생성한 토큰을 헤더로 받아 검증
  return NextResponse.json({
    message: "CSRF 토큰은 클라이언트에서 생성하여 사용합니다.",
  });
}
