import { AdkIntegration } from "@/components/adk-integration"
import { PageShell } from "@/components/page-shell"

export default function AdkPage() {
  return (
    <PageShell
      title={
        <>
          Terminal3
          <br />
          ADK
        </>
      }
      intro="A judge-focused view of how SentinelMail uses Terminal3 Agent Auth SDK primitives for identity, tenant namespace setup, protected action signing, permissions, approvals, and audit."
    >
      <AdkIntegration />
    </PageShell>
  )
}

