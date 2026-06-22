"use client"

import { useEffect, useState } from "react"
import { Check, Loader2, ShieldCheck, X } from "lucide-react"
import { getAgent, type ApprovalItem } from "@/lib/sentinel-data"

interface ApprovalResult {
  approval: ApprovalItem
  proof: {
    authorized: boolean
    needsApproval: boolean
    actionHash: string
    signature: string
    proofKind: "terminal3-sdk-signed" | "local-verifier"
    reason: string
    terminal3Mode: "live" | "offline"
    ledger: {
      terminal3: string
    }
  }
  status: "executed" | "blocked"
}

export function ApprovalConsole() {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [activeResult, setActiveResult] = useState<ApprovalResult | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10_000)

    async function loadApprovals() {
      try {
        const response = await fetch("/api/approvals", {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) throw new Error("Approval queue could not be loaded.")
        const data = (await response.json()) as { approvals: ApprovalItem[] }
        setItems(data.approvals)
      } catch {
        setError("Approval queue is unavailable. Refresh after the API recovers.")
      } finally {
        window.clearTimeout(timeout)
        setLoading(false)
      }
    }

    loadApprovals()

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  async function decide(item: ApprovalItem, approved: boolean) {
    setPendingId(item.id)
    setError(null)
    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 12_000)
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, approved }),
        signal: controller.signal,
      })
      window.clearTimeout(timeout)
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error ?? "Approval decision failed.")
      }
      const data = (await response.json()) as ApprovalResult
      setActiveResult(data)
      setItems((current) => current.filter((candidate) => candidate.id !== item.id))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Approval decision failed.")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="grid gap-10 border-y-2 border-black py-8 lg:grid-cols-[1fr_420px]">
        <div className="border-t-2 border-black">
          {error ? (
            <div className="border-b-2 border-black py-5 font-mono text-sm uppercase text-red-700">{error}</div>
          ) : null}
          {loading ? (
            <div className="flex items-center gap-3 border-b-2 border-black py-12 font-mono text-sm uppercase">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading approval queue
            </div>
          ) : items.length ? (
            items.map((item) => {
              const agent = getAgent(item.agentId)
              return (
                <article key={item.id} className="border-b-2 border-black py-7">
                  <div className="grid gap-5 md:grid-cols-[1fr_180px]">
                    <div>
                      <div className="font-mono text-xs uppercase">
                        {agent.name} · {item.action} · {item.risk} risk
                      </div>
                      <h2 className="mt-3 font-serif text-4xl uppercase tracking-tight md:text-6xl">{item.title}</h2>
                      <p className="mt-2 font-mono text-sm uppercase">{item.target}</p>
                      <div className="mt-5 grid gap-2 font-mono text-xs uppercase md:grid-cols-3">
                        {Object.entries(item.payload).map(([key, value]) => (
                          <div key={key} className="border-l-2 border-black pl-3">
                            <span className="block opacity-60">{key}</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-row gap-3 md:flex-col md:justify-center">
                      <button
                        type="button"
                        onClick={() => decide(item, true)}
                        disabled={pendingId === item.id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-5 py-3 font-mono text-xs uppercase text-[#FF4D00] transition-transform hover:scale-105 disabled:cursor-wait"
                      >
                        {pendingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => decide(item, false)}
                        disabled={pendingId === item.id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-black px-5 py-3 font-mono text-xs uppercase transition-colors hover:bg-black hover:text-[#FF4D00] disabled:cursor-wait"
                      >
                        <X className="h-4 w-4" />
                        Block
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          ) : (
            <div className="border-b-2 border-black py-12">
              <h2 className="font-serif text-5xl uppercase">Queue clear</h2>
              <p className="mt-4 max-w-xl font-mono text-sm">
                All pending state-changing actions have been resolved and moved into the audit flow.
              </p>
            </div>
          )}
        </div>

        <aside className="border-l-2 border-black pl-6">
          <div className="flex items-center gap-3 font-mono text-xs uppercase">
            <ShieldCheck className="h-5 w-5" />
            Execution proof
          </div>
          {activeResult ? (
            <div className="mt-6 space-y-4 font-mono text-xs uppercase">
              <p>Status: {activeResult.status}</p>
              <p>Mode: {activeResult.proof.terminal3Mode}</p>
              <p>Proof: {activeResult.proof.proofKind}</p>
              <p className="break-all">Hash: {activeResult.proof.actionHash}</p>
              <p className="break-all">Signature: {activeResult.proof.signature}</p>
              <p className="leading-relaxed normal-case">{activeResult.proof.reason}</p>
              <p className="leading-relaxed normal-case">{activeResult.proof.ledger.terminal3}</p>
            </div>
          ) : (
            <p className="mt-6 font-mono text-sm leading-relaxed">
              Approve or block an action to force the Send or Calendar agent through the Terminal3 policy path.
            </p>
          )}
        </aside>
      </div>
    </section>
  )
}
