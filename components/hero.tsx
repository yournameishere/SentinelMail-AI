"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, LockKeyhole, MailCheck, ShieldCheck } from "lucide-react"
import Link from "next/link"

const lanes = [
  { label: "Inbox intake", detail: "Classifies messages without send access", icon: MailCheck },
  { label: "Agent policy", detail: "Routes work through scoped DID permissions", icon: ShieldCheck },
  { label: "Approval gate", detail: "Stops state-changing actions for review", icon: LockKeyhole },
  { label: "Signed ledger", detail: "Writes hash, signature, and decision proof", icon: CheckCircle2 },
]

export function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden bg-background px-4 pb-16 pt-28 text-black md:px-8 md:pt-32">
      <div className="mx-auto grid w-full max-w-7xl min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_460px]">
        <motion.div
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="min-w-0 max-w-4xl"
        >
          <h1 className="max-w-[820px] font-serif text-4xl font-black uppercase leading-[0.92] text-black min-[420px]:text-5xl sm:text-6xl md:text-8xl lg:text-[6.45rem] xl:text-[7.25rem]">
            <span className="block">SentinelMail</span>
            <span className="block">AI</span>
          </h1>
          <p className="mt-7 max-w-2xl font-mono text-sm leading-7 text-black/75 md:text-base">
            A trusted email command center where AI agents can summarize, draft, schedule, and prepare sends only after
            Terminal3 identity, permissions, approvals, and signed action proofs line up.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-6 font-mono text-xs uppercase text-[#FF4D00] transition-colors hover:bg-[#FF4D00] hover:text-black sm:w-auto"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/approvals"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-black px-6 font-mono text-xs uppercase text-black transition-colors hover:bg-black hover:text-[#FF4D00] sm:w-auto"
            >
              Review approvals
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.7, ease: "easeOut" }}
          className="relative min-w-0 border-y border-black py-5"
          aria-label="SentinelMail protected workflow"
        >
          <div className="mb-5 flex items-center justify-between font-mono text-xs uppercase text-black/65">
            <span>Protected workflow</span>
            <span>Terminal3 ADK</span>
          </div>

          <div className="grid gap-0">
            {lanes.map((lane, index) => {
              const Icon = lane.icon
              return (
                <motion.div
                  key={lane.label}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.26 + index * 0.08, duration: 0.45, ease: "easeOut" }}
                  className="grid grid-cols-[42px_1fr] gap-4 border-t border-black/25 py-4 first:border-t-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[#FF4D00]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-mono text-sm uppercase">{lane.label}</div>
                    <p className="mt-1 font-mono text-xs leading-5 text-black/65">{lane.detail}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-5 border-t border-black pt-5">
            <div className="font-serif text-3xl uppercase leading-none md:text-4xl">No agent acts alone.</div>
            <p className="mt-3 font-mono text-xs leading-5 text-black/65">
              Send and calendar actions are held until the operator approves the Terminal3-scoped decision.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
