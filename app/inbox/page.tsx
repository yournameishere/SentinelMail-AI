import { EmailList } from "@/components/email-list"
import { PageShell } from "@/components/page-shell"

export default function InboxPage() {
  return (
    <PageShell
      title={
        <>
          Secure
          <br />
          Inbox
        </>
      }
      intro="Classified email stream with risk scoring. The Inbox Agent has read and classify permissions only, so it cannot mutate mail or send responses."
    >
      <EmailList />
    </PageShell>
  )
}

