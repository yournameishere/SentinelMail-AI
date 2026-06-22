import { NextResponse } from "next/server"
import { runSentinelCommand } from "@/lib/sentinel-data"
import { recordProtectedActionAudit } from "@/lib/server/store"
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
  })
}
