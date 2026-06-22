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
      <div className="grid gap-10 border-y-2 border-black py-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="space-y-5">
            {turns.map((turn) => (
              <div key={turn.id} className="grid grid-cols-[42px_1fr] gap-4 border-b border-black/25 pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[#FF4D00]">
                  {turn.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <p className="whitespace-pre-line font-mono text-sm leading-relaxed">{turn.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="mt-8 flex flex-col gap-4 md:flex-row">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              aria-label="SentinelMail command"
              className="min-h-28 flex-1 resize-none border-2 border-black bg-transparent p-4 font-mono text-sm outline-none placeholder:text-black/50 focus:bg-black focus:text-[#FF4D00]"
              placeholder="Ask SentinelMail to summarize, draft, send, schedule, or audit..."
            />
            <button
              type="submit"
              disabled={loading}
              className="flex min-w-48 items-center justify-center gap-3 rounded-full bg-black px-8 py-4 font-mono text-xs uppercase text-[#FF4D00] transition-transform hover:scale-105 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUpRight className="h-5 w-5" />}
              Run agent
            </button>
          </form>
        </div>

        <aside className="border-l-2 border-black pl-6">
          <div className="flex items-center gap-3 font-mono text-xs uppercase">
            <ShieldCheck className="h-5 w-5" />
            Latest Terminal3 proof
          </div>
          {lastProof ? (
            <div className="mt-6 space-y-4 font-mono text-xs uppercase">
              <p>Mode: {lastProof.terminal3Mode}</p>
              <p>Proof: {lastProof.proofKind}</p>
              <p>Authorized: {lastProof.authorized ? "yes" : "waiting"}</p>
              <p>Approval: {lastProof.needsApproval ? "required" : "not required"}</p>
              <p className="break-all">Hash: {lastProof.actionHash}</p>
              <p className="break-all">Signature: {lastProof.signature}</p>
              <p className="leading-relaxed normal-case">{lastProof.reason}</p>
            </div>
          ) : (
            <p className="mt-6 font-mono text-sm leading-relaxed">
              Run a command to see DID scope, policy decision, approval state, action hash, and signed ledger proof.
            </p>
          )}
          {error ? <p className="mt-6 font-mono text-xs uppercase text-red-700">{error}</p> : null}
        </aside>
      </div>
    </section>
  )
}
