import { NextResponse } from "next/server"
import { runSentinelCommand } from "@/lib/sentinel-data"
import { createPendingApproval, recordProtectedActionAudit } from "@/lib/server/store"
import { protectAgentAction } from "@/lib/terminal3/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { message?: string }
  const message = body.message?.trim()

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const command = runSentinelCommand(message)
  const proof = await protectAgentAction({
    agentId: command.agentId,
    capability: command.capability,
    action: command.title,
    target: message,
    approved: command.capability !== "email.send" && command.capability !== "calendar.create",
    metadata: {
      surface: "chat",
      nextAction: command.nextAction,
    },
  })
  const queuedApproval = proof.needsApproval
    ? await createPendingApproval({
        title:
          command.capability === "calendar.create"
            ? "Approve calendar action"
            : "Approve protected send",
        target: message,
        agentId: command.agentId,
        action: command.capability,
        risk: command.capability === "email.send" ? "medium" : "low",
        payload: {
          request: message,
          terminal3: "Verify agent DID, permission scope, approval, and signed action",
          proof: proof.actionHash,
        },
      })
    : null
  await recordProtectedActionAudit(
    {
      agentId: command.agentId,
      title: command.title,
      target: message,
      capability: command.capability,
    },
    proof,
  )

  return NextResponse.json({
    command,
    proof,
    queuedApproval,
  })
}
