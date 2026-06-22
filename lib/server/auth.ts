import "server-only"

import { timingSafeEqual } from "crypto"

function env(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return undefined
}

function envBool(...names: string[]) {
  const value = env(...names)?.toLowerCase()
  return value === "1" || value === "true" || value === "yes"
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

function readToken(request: Request) {
  const authorization = request.headers.get("authorization")
  if (authorization?.toLowerCase().startsWith("bearer ")) return authorization.slice(7).trim()
  return request.headers.get("x-sentinel-operator-token")?.trim()
}

export function verifyOperatorWrite(request: Request) {
  const publicDemo = envBool("SENTINEL_PUBLIC_DEMO", "AGENTVAULT_ENABLE_PUBLIC_DEMO_SESSION")
  const required = envBool("SENTINEL_REQUIRE_OPERATOR_TOKEN", "AGENTVAULT_REQUIRE_OPERATOR_TOKEN")
  const secret = env("SENTINEL_OPERATOR_TOKEN", "AGENTVAULT_SERVER_SECRET", "SKILLPROOF_SESSION_SECRET")

  if (!required || publicDemo) {
    return {
      ok: true,
      mode: publicDemo ? "public-demo" : "unlocked-demo",
    } as const
  }

  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: "Operator-token enforcement is enabled, but no operator secret is configured.",
    } as const
  }

  const token = readToken(request)
  if (token && safeEqual(token, secret)) {
    return {
      ok: true,
      mode: "operator-token",
    } as const
  }

  return {
    ok: false,
    status: 401,
    error: "Operator token is required for this protected action.",
  } as const
}
