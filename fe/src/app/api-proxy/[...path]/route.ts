import { NextRequest } from "next/server";

const API_BASE_URL =
  "http://127.0.0.1:5001/youthvoice-2025/asia-northeast3/api";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(req, params);
}
export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(req, params);
}
export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(req, params);
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(req, params);
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(req, params);
}

async function proxy(req: NextRequest, params: { path: string[] }) {
  try {
    const rawPath = params.path.join("/");
    const search = new URL(req.url).search;

    const targetUrl = `${API_BASE_URL}/${rawPath}${search}`;

    console.log(`[PROXY] ${req.method} ${req.url} -> ${targetUrl}`);

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Authorization: req.headers.get("authorization") ?? "",
        "content-type": req.headers.get("content-type") ?? "application/json",
        "user-agent": req.headers.get("user-agent") ?? "",
      },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.blob(),
    });

    if (!res.ok) {
      const text = await res
        .clone()
        .text()
        .catch(() => "");
      console.error(
        `[PROXY ERROR] ${req.method} ${targetUrl} -> ${res.status} ${res.statusText}\n${text}`
      );
    }

    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  } catch (e: any) {
    console.error("[PROXY ERROR]", e);
    return new Response(
      JSON.stringify({
        proxyError: true,
        message: e?.message ?? "Proxy failed",
        targetUrl: `${API_BASE_URL}/${params.path.join("/")}`,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
}

