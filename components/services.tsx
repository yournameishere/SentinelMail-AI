import { Bot, CalendarCheck, FileSignature, MailCheck, Send, Sparkles } from "lucide-react"
import Link from "next/link"

const capabilities = [
  {
    title: "Read and classify",
    body: "Inbox Agent reads mailbox context, classifies risk, and prepares summaries without permission to draft or send.",
    tags: ["read", "classify", "risk"],
    icon: MailCheck,
  },
  {
    title: "Draft with memory",
    body: "Reply Agent turns operator intent into polished replies, while keeping final delivery outside its capability scope.",
    tags: ["draft", "tone", "no-send"],
    icon: Sparkles,
  },
  {
    title: "Execute behind approval",
    body: "Send and Calendar agents pause at the approval center, then return Terminal3 proof when the action is approved or blocked.",
    tags: ["approve", "send", "calendar"],
    icon: Send,
  },
  {
    title: "Audit every decision",
    body: "Audit Ledger records action hash, signature, proof kind, session mode, agent DID, and operator decision.",
    tags: ["hash", "signature", "ledger"],
    icon: FileSignature,
  },
]

export function Services() {
  return (
    <section className="bg-black px-4 py-24 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border-b border-white/20 pb-12 lg:grid-cols-[0.8fr_1fr]">
          <h2 className="font-serif text-5xl font-black uppercase leading-none md:text-7xl">
            Separated agent lanes
          </h2>
          <p className="max-w-2xl font-mono text-sm leading-7 text-white/70">
            SentinelMail keeps inbox reading, drafting, sending, calendar actions, and audit review in separate flows.
            The UI mirrors that separation so the operator can see exactly which agent is acting and which permission is
            being used.
          </p>
        </div>

        <div className="divide-y divide-white/15">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon
            return (
              <article
                key={capability.title}
                className="grid gap-6 py-8 md:grid-cols-[70px_64px_1fr_260px] md:items-start"
              >
                <div className="font-mono text-sm text-[#FF4D00]">{String(index + 1).padStart(2, "0")}</div>
                <Icon className="h-10 w-10 text-[#FF4D00]" />
                <div>
                  <h3 className="font-serif text-4xl uppercase leading-none md:text-5xl">{capability.title}</h3>
                  <p className="mt-4 max-w-3xl font-mono text-sm leading-7 text-white/68">{capability.body}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {capability.tags.map((tag) => (
                    <span key={tag} className="border border-white/25 px-3 py-1 font-mono text-xs uppercase text-white/75">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 font-mono text-sm uppercase text-white/75">
            <Bot className="h-5 w-5 text-[#FF4D00]" />
            Agent monitor and approval console are live app pages, not static mockups.
          </div>
          <Link
            href="/agents"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF4D00] px-6 font-mono text-xs uppercase text-black transition-colors hover:bg-white"
          >
            View agents
            <CalendarCheck className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
