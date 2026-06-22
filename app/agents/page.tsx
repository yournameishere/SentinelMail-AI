import { AgentRail } from "@/components/agent-rail"
import { PageShell } from "@/components/page-shell"

export default function AgentsPage() {
  return (
    <PageShell
      title={
        <>
          Agent
          <br />
          Monitor
        </>
      }
      intro="Each agent owns a separate Terminal3-style identity, scope, denial list, and approval requirement. This keeps inbox reading, drafting, sending, scheduling, and auditing separate."
      inverse
    >
      <AgentRail />
    </PageShell>
  )
}

