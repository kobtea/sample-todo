import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── レートリミット（in-memory） ───────────────────────────
// 1 IP あたり 60リクエスト / 分

const RATE_LIMIT = 60;
const WINDOW_MS = 60 * 1000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

// ── Basic 認証（APP_PASSWORD 環境変数が設定された場合のみ有効） ──

function isAuthorized(request: NextRequest, password: string): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
  const [, pass] = decoded.split(":");
  return pass === password;
}

export function proxy(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";

  // レートリミット
  if (isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  // Basic 認証（APP_PASSWORD が設定されている場合）
  const password = process.env.APP_PASSWORD;
  if (password && !isAuthorized(request, password)) {
    return new NextResponse(null, {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Todo App"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
