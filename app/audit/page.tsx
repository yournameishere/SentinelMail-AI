import { AuditLedger } from "@/components/audit-ledger"
import { PageShell } from "@/components/page-shell"

export const dynamic = "force-dynamic"

export default function AuditPage() {
  return (
    <PageShell
      title={
        <>
          Audit
          <br />
          Ledger
        </>
      }
      intro="Tamper-aware activity stream showing which agent acted, when it acted, whether it was blocked or signed, and which proof is attached."
    >
      <AuditLedger />
    </PageShell>
  )
}
