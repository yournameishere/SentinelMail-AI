export type AgentId = "inbox" | "summary" | "reply" | "send" | "calendar"

export type AgentStatus = "active" | "reviewing" | "waiting-approval" | "standby"

export type AgentCapability =
  | "email.read"
  | "email.classify"
  | "email.summarize"
  | "email.draft"
  | "email.send"
  | "calendar.create"
  | "audit.write"

export interface SentinelAgent {
  id: AgentId
  name: string
  shortName: string
  did: string
  status: AgentStatus
  summary: string
  permissions: AgentCapability[]
  cannot: AgentCapability[]
  requiresApproval: AgentCapability[]
  lastAction: string
}

export interface EmailItem {
  id: string
  from: string
  subject: string
  preview: string
  category: "Urgent" | "Work" | "Finance" | "Personal" | "Spam"
  risk: "low" | "medium" | "high"
  receivedAt: string
  unread?: boolean
}

export interface DraftItem {
  id: string
  recipient: string
  subject: string
  body: string
  agentId: AgentId
  confidence: number
  status: "ready" | "needs-review" | "approved"
}

export interface ApprovalItem {
  id: string
  title: string
  target: string
  agentId: AgentId
  action: AgentCapability
  risk: "low" | "medium" | "high"
  requestedAt: string
  payload: Record<string, string>
}

export interface AuditEvent {
  id: string
  time: string
  agentId: AgentId
  action: string
  status: "success" | "blocked" | "pending" | "signed"
  proof: string
}

export interface ChatTurn {
  id: string
  role: "user" | "assistant"
  content: string
}

export const terminal3DidDisplay = "did:t3n:6cc3...f1e"

export const agents: SentinelAgent[] = [
  {
    id: "inbox",
    name: "Inbox Agent",
    shortName: "Inbox",
    did: "did:t3n:1000000000000000000000000000000000000001",
    status: "active",
    summary: "Reads mailbox metadata, classifies threads, and flags spoofing signals.",
    permissions: ["email.read", "email.classify", "audit.write"],
    cannot: ["email.send", "calendar.create"],
    requiresApproval: [],
    lastAction: "Fetched 32 messages and isolated 4 priority threads",
  },
  {
    id: "summary",
    name: "Summary Agent",
    shortName: "Summary",
    did: "did:t3n:1000000000000000000000000000000000000002",
    status: "reviewing",
    summary: "Condenses long threads into action items without exposing raw sensitive data.",
    permissions: ["email.read", "email.summarize", "audit.write"],
    cannot: ["email.send", "calendar.create"],
    requiresApproval: [],
    lastAction: "Generated the morning executive digest",
  },
  {
    id: "reply",
    name: "Reply Agent",
    shortName: "Reply",
    did: "did:t3n:1000000000000000000000000000000000000003",
    status: "active",
    summary: "Drafts polished responses from thread context and user writing preferences.",
    permissions: ["email.read", "email.draft", "audit.write"],
    cannot: ["email.send"],
    requiresApproval: [],
    lastAction: "Prepared a meeting follow-up draft for John",
  },
  {
    id: "send",
    name: "Send Agent",
    shortName: "Send",
    did: "did:t3n:1000000000000000000000000000000000000004",
    status: "waiting-approval",
    summary: "Executes outbound mail only after Terminal3 identity checks and human approval.",
    permissions: ["email.send", "audit.write"],
    cannot: ["email.read", "calendar.create"],
    requiresApproval: ["email.send"],
    lastAction: "Waiting on approval for client meeting confirmation",
  },
  {
    id: "calendar",
    name: "Calendar Agent",
    shortName: "Calendar",
    did: "did:t3n:1000000000000000000000000000000000000005",
    status: "standby",
    summary: "Creates meetings from approved mail tasks and records scheduling proof.",
    permissions: ["calendar.create", "audit.write"],
    cannot: ["email.send"],
    requiresApproval: ["calendar.create"],
    lastAction: "Reserved tentative 10:00 AM slot for tomorrow",
  },
]

export const emails: EmailItem[] = [
  {
    id: "em-101",
    from: "John Carter",
    subject: "Can we move the contract review?",
    preview: "Could we meet tomorrow at 10 AM to finalize the procurement language?",
    category: "Urgent",
    risk: "low",
    receivedAt: "08:42",
    unread: true,
  },
  {
    id: "em-102",
    from: "AWS Billing",
    subject: "Invoice due tomorrow",
    preview: "Your June infrastructure invoice is ready and payment is due tomorrow.",
    category: "Finance",
    risk: "medium",
    receivedAt: "08:16",
    unread: true,
  },
  {
    id: "em-103",
    from: "Amazon Logistics",
    subject: "Shipment delayed",
    preview: "A delivery exception moved the expected arrival window to Friday.",
    category: "Personal",
    risk: "low",
    receivedAt: "07:58",
  },
  {
    id: "em-104",
    from: "Security Review",
    subject: "Unusual sign-in detected",
    preview: "A sign-in from a new location was blocked. Review before taking action.",
    category: "Work",
    risk: "high",
    receivedAt: "07:24",
    unread: true,
  },
  {
    id: "em-105",
    from: "Random Rewards",
    subject: "Claim your urgent prize now",
    preview: "A suspicious promotion asks for payment information before checkout.",
    category: "Spam",
    risk: "high",
    receivedAt: "06:51",
  },
]

export const drafts: DraftItem[] = [
  {
    id: "dr-201",
    recipient: "john@client.example",
    subject: "Contract review meeting",
    body: "Hi John,\n\nTomorrow at 10 AM works for me. I will bring the final procurement notes and a clean version of the contract for review.\n\nRegards,\nRichard",
    agentId: "reply",
    confidence: 94,
    status: "ready",
  },
  {
    id: "dr-202",
    recipient: "billing@aws.example",
    subject: "Invoice acknowledgement",
    body: "Thanks for the notice. I have queued the invoice for finance review and will confirm once it is approved.",
    agentId: "reply",
    confidence: 88,
    status: "needs-review",
  },
]

export const approvals: ApprovalItem[] = [
  {
    id: "ap-301",
    title: "Send meeting confirmation",
    target: "john@client.example",
    agentId: "send",
    action: "email.send",
    risk: "medium",
    requestedAt: "09:11",
    payload: {
      subject: "Contract review meeting",
      approval: "User approval required before the Send Agent can execute",
      terminal3: "Verify agent DID, permission scope, and signed action",
    },
  },
  {
    id: "ap-302",
    title: "Create calendar event",
    target: "Tomorrow 10:00 AM",
    agentId: "calendar",
    action: "calendar.create",
    risk: "low",
    requestedAt: "09:12",
    payload: {
      title: "Contract review with John",
      attendees: "john@client.example, richard@company.example",
      terminal3: "Calendar Agent can schedule only after explicit approval",
    },
  },
]

export const auditEvents: AuditEvent[] = [
  {
    id: "au-401",
    time: "09:00",
    agentId: "inbox",
    action: "Fetched 32 emails",
    status: "success",
    proof: "session DID verified",
  },
  {
    id: "au-402",
    time: "09:05",
    agentId: "summary",
    action: "Generated daily digest",
    status: "signed",
    proof: "Terminal3 action hash 0x81b4...19",
  },
  {
    id: "au-403",
    time: "09:10",
    agentId: "reply",
    action: "Drafted response to John",
    status: "success",
    proof: "reply-agent permission email.draft",
  },
  {
    id: "au-404",
    time: "09:11",
    agentId: "send",
    action: "Requested send approval",
    status: "pending",
    proof: "blocked until human approval",
  },
]

export const starterChat: ChatTurn[] = [
  {
    id: "ct-1",
    role: "assistant",
    content:
      "SentinelMail is ready. Ask for a digest, a draft reply, a send action, or an audit check.",
  },
]

export function getAgent(agentId: AgentId) {
  return agents.find((agent) => agent.id === agentId) ?? agents[0]
}

export function riskTone(risk: EmailItem["risk"] | ApprovalItem["risk"]) {
  if (risk === "high") return "text-red-500"
  if (risk === "medium") return "text-amber-600"
  return "text-emerald-600"
}

export function runSentinelCommand(message: string) {
  const normalized = message.toLowerCase()
  const wantsSend = normalized.includes("send") || normalized.includes("approve") || normalized.includes("mail it")
  const wantsCalendar =
    normalized.includes("schedule") || normalized.includes("calendar") || normalized.includes("meeting")
  const wantsDraft = normalized.includes("reply") || normalized.includes("draft")
  const wantsSummary = normalized.includes("summar") || normalized.includes("digest")

  if (wantsSend) {
    return {
      agentId: "send" as AgentId,
      title: "Approval required",
      response:
        "Send Agent is authorized for email.send, but Terminal3 policy requires human approval before execution. A protected action was created in Approval Center.",
      nextAction: "Approve Send to generate a signed action and audit row.",
      capability: "email.send" as AgentCapability,
    }
  }

  if (wantsCalendar) {
    return {
      agentId: "calendar" as AgentId,
      title: "Calendar hold prepared",
      response:
        "Calendar Agent prepared a tentative meeting for tomorrow at 10 AM. It needs approval because scheduling changes external state.",
      nextAction: "Approve the calendar action after checking attendees.",
      capability: "calendar.create" as AgentCapability,
    }
  }

  if (wantsDraft && wantsSummary) {
    return {
      agentId: "reply" as AgentId,
      title: "Digest and reply draft ready",
      response:
        "15 emails received. John needs a contract review tomorrow, AWS has an invoice due, one security alert was blocked, and the Reply Agent drafted a confirmation for John.",
      nextAction: "Review the draft. Sending remains blocked until the Send Agent receives approval.",
      capability: "email.draft" as AgentCapability,
    }
  }

  if (wantsDraft) {
    return {
      agentId: "reply" as AgentId,
      title: "Reply draft ready",
      response:
        "Drafted a professional reply to John confirming tomorrow at 10 AM and noting that the final procurement language will be ready.",
      nextAction: "The draft is ready but cannot be sent by the Reply Agent.",
      capability: "email.draft" as AgentCapability,
    }
  }

  if (wantsSummary) {
    return {
      agentId: "summary" as AgentId,
      title: "Daily digest generated",
      response:
        "15 emails received. 4 urgent items need attention: John wants to review the contract tomorrow, AWS has an invoice due, one security alert was blocked, and a shipment delay moved to Friday.",
      nextAction: "Review the John draft or open the Approval Center.",
      capability: "email.summarize" as AgentCapability,
    }
  }

  if (normalized.includes("audit") || normalized.includes("terminal3") || normalized.includes("identity")) {
    return {
      agentId: "send" as AgentId,
      title: "Terminal3 proof check",
      response:
        "The protected action path verifies the agent DID, checks scoped permissions, requires approval for state-changing work, and writes a signed audit row.",
      nextAction: "Open Agent Monitor or Audit Ledger for proof details.",
      capability: "audit.write" as AgentCapability,
    }
  }

  return {
    agentId: "inbox" as AgentId,
    title: "Inbox classified",
    response:
      "Inbox Agent classified the newest messages into Urgent, Work, Finance, Personal, and Spam. It can read and classify mail, but it cannot draft or send.",
    nextAction: "Ask for a summary, reply draft, or protected send action.",
    capability: "email.classify" as AgentCapability,
  }
}
