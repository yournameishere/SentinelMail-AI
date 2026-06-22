"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden bg-background px-4 pb-16 pt-28 text-black md:px-8 md:pt-32">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <motion.div
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="min-w-0 max-w-5xl"
        >
          <h1 className="max-w-full text-balance font-serif text-4xl font-black uppercase leading-[0.9] text-black min-[420px]:text-5xl sm:text-6xl md:text-8xl lg:text-[7.25rem] xl:text-[8.35rem]">
            <span className="block">SentinelMail</span>
            <span className="block">AI</span>
          </h1>
          <p className="mt-7 max-w-3xl text-pretty font-mono text-sm leading-7 text-black/75 md:text-base">
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
      </div>
    </section>
  )
}
