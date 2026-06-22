"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowDown, KeyRound, MailCheck, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Terminal3Status } from "./terminal3-status"

export function Hero() {
  const { scrollYProgress } = useScroll()
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360])

  return (
    <section className="relative min-h-screen bg-background flex flex-col justify-center overflow-hidden pt-24">
      <div className="container mx-auto px-4 relative z-10">
        <motion.h1
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="font-serif text-[15vw] leading-[0.83] font-black uppercase tracking-tighter text-black text-center mix-blend-normal"
        >
          Sentinel
          <br />
          Mail
        </motion.h1>

        <div className="mt-8 grid gap-8 border-t-2 border-black pt-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="font-mono text-lg md:text-xl font-bold uppercase">
            <MailCheck className="inline mr-2 mb-1" />
            Trusted AI Email Agent
            <p className="mt-3 max-w-xl font-mono text-sm font-normal leading-relaxed normal-case">
              Multi-agent inbox, reply, send, and calendar workflows with Terminal3 identity checks before any protected
              action executes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-black px-6 py-3 font-mono text-xs uppercase text-[#FF4D00] transition-transform hover:scale-105"
              >
                Open dashboard
              </Link>
              <Link
                href="/approvals"
                className="rounded-full border-2 border-black px-6 py-3 font-mono text-xs uppercase text-black transition-colors hover:bg-black hover:text-[#FF4D00]"
              >
                Approve send
              </Link>
            </div>
          </div>

          <motion.div
            style={{ rotate }}
            className="hidden md:flex items-center justify-center w-32 h-32 bg-black rounded-full relative"
          >
            <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
              <svg viewBox="0 0 100 100" width="100" height="100" className="w-full h-full fill-white">
                <path id="curve" d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="transparent" />
                <text className="text-[12px] font-mono font-bold uppercase tracking-widest">
                  <textPath href="#curve">Verify Agent • Sign Action •</textPath>
                </text>
              </svg>
            </div>
            <ArrowDown className="text-white w-8 h-8" />
          </motion.div>

          <div className="font-mono text-lg md:text-xl font-bold uppercase lg:text-right">
            <ShieldCheck className="inline mr-2 mb-1" />
            Terminal3 verified <br />
            DID scoped permissions
            <p className="mt-3 font-mono text-sm font-normal leading-relaxed normal-case lg:ml-auto lg:max-w-md">
              The Send Agent cannot read mail. The Reply Agent cannot send. Every action leaves an audit proof.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.7, ease: "circOut" }}
          className="mt-12"
        >
          <div className="grid gap-4 border-y-2 border-black py-5 md:grid-cols-3">
            {[
              ["Identity", "T3nClient session DID is read from the encrypted Terminal3 handshake."],
              ["Permissions", "Each agent has a scoped capability list and approval requirements."],
              ["Audit", "Signed action hashes bind agent, target, approval, and timestamp."],
            ].map(([title, body]) => (
              <div key={title} className="border-black md:border-r md:last:border-r-0 md:pr-5">
                <div className="flex items-center gap-2 font-mono text-xs uppercase">
                  <KeyRound className="h-4 w-4" />
                  {title}
                </div>
                <p className="mt-3 font-mono text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <Terminal3Status />
        </motion.div>
      </div>
    </section>
  )
}
