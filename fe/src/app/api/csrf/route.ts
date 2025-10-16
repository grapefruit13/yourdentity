import { NextRequest, NextResponse } from "next/server";

/**
 * @description CSRF 토큰 발급 API (Double-submit cookie 패턴)
 * GET /api/csrf
 */
export function GET(request: NextRequest) {
  // 1) 클라이언트에서 제공한 토큰을 사용하거나 새로 생성
  const headerToken = request.headers.get("x-csrf-token") ?? "";
  const token =
    headerToken && headerToken.length >= 32
      ? headerToken
      : (() => {
          const arr = new Uint8Array(32);
          crypto.getRandomValues(arr);
          return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join(
            ""
          );
        })();

  const res = NextResponse.json({ success: true, token });

  // 2) Double-submit cookie 설정 (읽기 가능, SameSite=Lax)
  res.cookies.set("csrf_token", token, {
    httpOnly: false, // JavaScript에서 읽을 수 있어야 함
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1시간
  });

  return res;
}
