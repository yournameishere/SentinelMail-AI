"use client"

import type React from "react"
import { useState } from "react"
import { ArrowUpRight, Bot, Loader2, ShieldCheck, User } from "lucide-react"
import { starterChat, type ChatTurn } from "@/lib/sentinel-data"

interface CommandResponse {
  command: {
    title: string
    response: string
    nextAction: string
  }
  proof: {
    authorized: boolean
    needsApproval: boolean
    actionHash: string
    signature: string
    proofKind: "terminal3-sdk-signed" | "local-verifier"
    reason: string
    terminal3Mode: "live" | "offline"
  }
}

export function ChatConsole() {
  const [turns, setTurns] = useState<ChatTurn[]>(starterChat)
  const [message, setMessage] = useState("Summarize today's emails and draft a reply to John")
  const [loading, setLoading] = useState(false)
  const [lastProof, setLastProof] = useState<CommandResponse["proof"] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)
    setMessage("")
    setTurns((current) => [...current, { id: crypto.randomUUID(), role: "user", content: trimmed }])

    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 12_000)
      const response = await fetch("/api/agent-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
        signal: controller.signal,
      })
      window.clearTimeout(timeout)
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error ?? "The command could not be processed.")
      }
      const data = (await response.json()) as CommandResponse
      setLastProof(data.proof)
      setTurns((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `${data.command.title}\n\n${data.command.response}\n\nNext: ${data.command.nextAction}`,
        },
      ])
    } catch (failure) {
      const detail = failure instanceof Error ? failure.message : "The command could not be processed."
      setError(detail)
      setTurns((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `${detail} Check the local server and try again.`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 border-y border-black py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="font-mono text-xs uppercase text-black/55">Command transcript</div>
              <h2 className="mt-2 font-serif text-4xl font-black uppercase leading-none md:text-5xl">
                Ask, verify, approve
              </h2>
            </div>
            <p className="max-w-md font-mono text-sm leading-7 text-black/70">
              Natural language requests are converted into scoped agent actions with policy output attached.
            </p>
          </div>

          <div className="divide-y divide-black/15 border-y border-black/25">
            {turns.map((turn) => (
              <div key={turn.id} className="grid grid-cols-[42px_1fr] gap-4 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[#FF4D00]">
                  {turn.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <p className="whitespace-pre-line font-mono text-sm leading-7 text-black/78">{turn.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              aria-label="SentinelMail command"
              className="min-h-28 resize-none border border-black bg-[#fffdf7] p-4 font-mono text-sm leading-6 outline-none placeholder:text-black/45 focus:bg-white"
              placeholder="Ask SentinelMail to summarize, draft, send, schedule, or audit..."
            />
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 min-w-44 items-center justify-center gap-3 rounded-full bg-black px-8 font-mono text-xs uppercase text-[#FF4D00] transition-colors hover:bg-[#FF4D00] hover:text-black disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUpRight className="h-5 w-5" />}
              Run agent
            </button>
          </form>
        </div>

        <aside className="border-t border-black/25 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="flex items-center gap-3 font-mono text-xs uppercase">
            <ShieldCheck className="h-5 w-5" />
            Latest Terminal3 proof
          </div>
          {lastProof ? (
            <div className="mt-6 space-y-4 font-mono text-xs uppercase text-black/75">
              <p>Mode: {lastProof.terminal3Mode}</p>
              <p>Proof: {lastProof.proofKind}</p>
              <p>Authorized: {lastProof.authorized ? "yes" : "waiting"}</p>
              <p>Approval: {lastProof.needsApproval ? "required" : "not required"}</p>
              <p className="break-all">Hash: {lastProof.actionHash}</p>
              <p className="break-all">Signature: {lastProof.signature}</p>
              <p className="leading-6 normal-case text-black">{lastProof.reason}</p>
            </div>
          ) : (
            <p className="mt-6 font-mono text-sm leading-7 text-black/70">
              Run a command to see DID scope, policy decision, approval state, action hash, and signed ledger proof.
            </p>
          )}
          {error ? <p className="mt-6 font-mono text-xs uppercase text-red-700">{error}</p> : null}
        </aside>
      </div>
    </section>
  )
}
