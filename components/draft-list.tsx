import { FileText } from "lucide-react"
import { drafts, getAgent } from "@/lib/sentinel-data"

export function DraftList() {
  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="grid gap-8">
        {drafts.map((draft) => {
          const agent = getAgent(draft.agentId)
          return (
            <article key={draft.id} className="border-y-2 border-black py-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3 font-mono text-xs uppercase">
                    <FileText className="h-5 w-5" />
                    {agent.name} · {draft.confidence}% confidence · {draft.status.replace("-", " ")}
                  </div>
                  <h2 className="mt-4 font-serif text-4xl uppercase tracking-tight md:text-6xl">{draft.subject}</h2>
                  <p className="mt-2 font-mono text-sm uppercase">To {draft.recipient}</p>
                </div>
                <a
                  href="/approvals"
                  className="rounded-full bg-black px-6 py-3 text-center font-mono text-xs uppercase text-[#FF4D00] transition-transform hover:scale-105"
                >
                  Request send
                </a>
              </div>
              <pre className="mt-8 whitespace-pre-wrap border-l-2 border-black pl-6 font-mono text-sm leading-relaxed">
                {draft.body}
              </pre>
            </article>
          )
        })}
      </div>
    </section>
  )
}

