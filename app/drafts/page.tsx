import { DraftList } from "@/components/draft-list"
import { PageShell } from "@/components/page-shell"

export default function DraftsPage() {
  return (
    <PageShell
      title={
        <>
          AI
          <br />
          Drafts
        </>
      }
      intro="Reply Agent drafts polished responses from approved context. Drafting and sending are intentionally separated so outbound mail always passes the approval gate."
    >
      <DraftList />
    </PageShell>
  )
}

