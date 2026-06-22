import { ChatConsole } from "@/components/chat-console"
import { PageShell } from "@/components/page-shell"

export default function ChatPage() {
  return (
    <PageShell
      title={
        <>
          Agent
          <br />
          Chat
        </>
      }
      intro="Talk naturally to SentinelMail. Every command is routed to a scoped agent, evaluated by Terminal3 policy, and returned with a proof object."
    >
      <ChatConsole />
    </PageShell>
  )
}

