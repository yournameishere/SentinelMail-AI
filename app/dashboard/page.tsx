import { AgentRail } from "@/components/agent-rail"
import { EmailList } from "@/components/email-list"
import { PageShell } from "@/components/page-shell"
import { WorkflowBoard } from "@/components/workflow-board"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <PageShell
      title={
        <>
          Mission
          <br />
          Control
        </>
      }
      intro="A live operations view for trusted email agents: inbox summary, protected action flow, agent health, and Terminal3 verification status."
    >
      <WorkflowBoard />
      <AgentRail />
      <section className="px-4 pb-10 pt-24 md:px-8">
        <h2 className="font-serif text-[11vw] font-black uppercase leading-none md:text-[7vw]">Priority Inbox</h2>
        <p className="mt-5 max-w-3xl font-mono text-sm leading-relaxed">
          Inbox Agent can read and classify messages, but cannot draft or send. Higher-risk messages are highlighted
          before reply or approval workflows begin.
        </p>
      </section>
      <EmailList />
    </PageShell>
  )
}
