import { FileText } from "lucide-react"
import { drafts, getAgent } from "@/lib/sentinel-data"

export function DraftList() {
  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8">
        {drafts.map((draft) => {
          const agent = getAgent(draft.agentId)
          return (
            <article key={draft.id} className="border-y border-black/30 py-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3 font-mono text-xs uppercase text-black/60">
                    <FileText className="h-5 w-5 text-[#FF4D00]" />
                    {agent.name} · {draft.confidence}% confidence · {draft.status.replace("-", " ")}
                  </div>
                  <h2 className="mt-4 font-serif text-4xl uppercase leading-none md:text-5xl">{draft.subject}</h2>
                  <p className="mt-3 break-all font-mono text-sm uppercase text-black/70">To {draft.recipient}</p>
                </div>
                <a
                  href="/approvals"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-black px-6 text-center font-mono text-xs uppercase text-[#FF4D00] transition-colors hover:bg-[#FF4D00] hover:text-black"
                >
                  Request send
                </a>
              </div>
              <pre className="mt-8 whitespace-pre-wrap border-l border-black/30 pl-6 font-mono text-sm leading-7 text-black/75">
                {draft.body}
              </pre>
            </article>
          )
        })}
      </div>
    </section>
  )
}
