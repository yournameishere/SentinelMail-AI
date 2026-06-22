import { CheckCircle2, Clock3, FileSignature, ShieldX } from "lucide-react"
import { getAgent } from "@/lib/sentinel-data"
import { getAuditEvents } from "@/lib/server/store"

const statusIcons = {
  success: CheckCircle2,
  signed: FileSignature,
  pending: Clock3,
  blocked: ShieldX,
}

export async function AuditLedger() {
  const auditEvents = await getAuditEvents()

  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="border-t-2 border-black">
        {auditEvents.map((event) => {
          const agent = getAgent(event.agentId)
          const Icon = statusIcons[event.status] ?? FileSignature
          return (
            <article
              key={event.id}
              className="grid gap-5 border-b-2 border-black py-7 md:grid-cols-[100px_1fr_180px_1fr]"
            >
              <div className="font-mono text-sm uppercase">{event.time}</div>
              <div>
                <div className="font-serif text-4xl uppercase tracking-tight">{event.action}</div>
                <p className="mt-2 font-mono text-xs uppercase opacity-70">{agent.did}</p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase">
                <Icon className="h-5 w-5" />
                {event.status}
              </div>
              <div className="font-mono text-sm">{event.proof}</div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
