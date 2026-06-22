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
      <div className="mx-auto grid max-w-7xl gap-10 border-y border-black py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="font-mono text-xs uppercase text-black/55">Live control path</div>
              <h2 className="mt-2 font-serif text-4xl font-black uppercase leading-none md:text-6xl">
                Protected action flow
              </h2>
            </div>
            <p className="max-w-md font-mono text-sm leading-7 text-black/70">
              Every protected request moves through identity, policy, approval, and audit before execution.
            </p>
          </div>

          <div className="mt-8 divide-y divide-black/20 border-y border-black/30">
            {workflow.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="group grid grid-cols-[44px_44px_1fr] items-center gap-4 py-5">
                  <span className="font-mono text-sm text-black/55">{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[#FF4D00]">
                    <Icon className="h-5 w-5 transition-transform group-hover:rotate-6" />
                  </span>
                  <span className="font-mono text-sm uppercase md:text-base">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="space-y-8">
          <Terminal3Status />
          <div className="grid grid-cols-3 divide-x divide-black/20 border-y border-black/30 text-center font-mono uppercase">
            <div className="py-5">
              <div className="font-serif text-4xl leading-none">{emails.length}</div>
              <div className="mt-2 text-[11px] text-black/60">emails</div>
            </div>
            <div className="py-5">
              <div className="font-serif text-4xl leading-none">{approvals.length}</div>
              <div className="mt-2 text-[11px] text-black/60">approvals</div>
            </div>
            <div className="py-5">
              <div className="font-serif text-4xl leading-none">{auditEvents.length}</div>
              <div className="mt-2 text-[11px] text-black/60">proofs</div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
