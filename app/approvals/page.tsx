import { ApprovalConsole } from "@/components/approval-console"
import { PageShell } from "@/components/page-shell"

export default function ApprovalsPage() {
  return (
    <PageShell
      title={
        <>
          Approval
          <br />
          Center
        </>
      }
      intro="State-changing actions stop here. Approve or block each request and SentinelMail will return a Terminal3-backed policy decision, action hash, signature, and ledger copy."
    >
      <ApprovalConsole />
    </PageShell>
  )
}

