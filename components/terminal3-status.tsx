"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, ShieldAlert, ShieldCheck } from "lucide-react"

interface Terminal3SessionPayload {
  session: {
    mode: "live" | "offline"
    environment: string
    did: string
    expectedDid?: string
    nodeUrl?: string
    tenantNamespace?: string
    balance?: string
    entries?: number
    sdk: string[]
    latencyMs?: number
    error?: string
  }
}

export function Terminal3Status({ compact = false }: { compact?: boolean }) {
  const [payload, setPayload] = useState<Terminal3SessionPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 9_000)

    fetch("/api/terminal3/session", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        if (alive) setPayload(data)
      })
      .catch(() => {
        if (alive) setPayload(null)
      })
      .finally(() => {
        window.clearTimeout(timeout)
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3 border-y border-black/25 py-4 font-mono text-sm uppercase">
        <Loader2 className="h-5 w-5 animate-spin" />
        Terminal3 session check
      </div>
    )
  }

  const session = payload?.session
  const live = session?.mode === "live"

  if (compact) {
    return (
      <div className="flex items-center gap-2 font-mono text-xs uppercase">
        {live ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
        {live ? "Live Terminal3 SDK" : "Local verifier"}
      </div>
    )
  }

  return (
    <div className="border-y border-black/30 py-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3 font-mono text-xs uppercase">
            {live ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            {live ? "Live Terminal3 ADK session" : "Terminal3 local verifier"}
          </div>
          <p className="mt-3 max-w-3xl font-mono text-sm leading-7 text-black/70">
            {live
              ? "The server authenticated with T3nClient, read the DID from the encrypted session, and loaded tenant context."
              : "The app is production-wired for T3nClient and falls back to local proof until deployment env vars are configured."}
          </p>
        </div>

        <div className="grid gap-2 font-mono text-xs uppercase text-black/70 md:min-w-80">
          <span>Environment: {session?.environment ?? "testnet"}</span>
          <span className="break-all">DID: {session?.did ?? "unavailable"}</span>
          <span className="break-all">Namespace: {session?.tenantNamespace ?? "z:tenant:sentinelmail-agent-auth"}</span>
          <span>Credits: {session?.balance ?? "configure T3N_API_KEY for live usage"}</span>
          <span>Latency: {session?.latencyMs ? `${session.latencyMs}ms` : "bounded fallback"}</span>
        </div>
      </div>

      {session?.error ? <p className="mt-4 font-mono text-xs uppercase opacity-70">{session.error}</p> : null}
    </div>
  )
}
