import { ArrowDown, CheckCircle2, LockKeyhole, ShieldCheck, UserCheck } from "lucide-react"
import { emails } from "@/lib/sentinel-data"
import { getAuditEvents, getPendingApprovals } from "@/lib/server/store"
import { Terminal3Status } from "@/components/terminal3-status"

const workflow = [
  { label: "User request", icon: UserCheck },
  { label: "AI agent", icon: ShieldCheck },
  { label: "Terminal3 verification", icon: LockKeyhole },
  { label: "Permission check", icon: CheckCircle2 },
  { label: "Approval + audit", icon: ArrowDown },
]

export async function WorkflowBoard() {
  const [approvals, auditEvents] = await Promise.all([getPendingApprovals(), getAuditEvents()])

  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="grid gap-12 border-y-2 border-black py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-serif text-5xl uppercase tracking-tight md:text-7xl">Protected action flow</h2>
          <div className="mt-10 grid gap-0">
            {workflow.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="group flex items-center gap-5 border-t-2 border-black py-5 last:border-b-2">
                  <span className="font-mono text-sm">{String(index + 1).padStart(2, "0")}</span>
                  <Icon className="h-7 w-7 transition-transform group-hover:rotate-12" />
                  <span className="font-mono text-lg uppercase">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-8">
          <Terminal3Status />
          <div className="grid grid-cols-3 border-2 border-black text-center font-mono uppercase">
            <div className="p-5">
              <div className="font-serif text-5xl">{emails.length}</div>
              <div className="mt-2 text-xs">emails</div>
            </div>
            <div className="border-x-2 border-black p-5">
              <div className="font-serif text-5xl">{approvals.length}</div>
              <div className="mt-2 text-xs">approvals</div>
            </div>
            <div className="p-5">
              <div className="font-serif text-5xl">{auditEvents.length}</div>
              <div className="mt-2 text-xs">proofs</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
