import { NextResponse } from "next/server"
import { verifyOperatorWrite } from "@/lib/server/auth"
import { getApprovalById, getPendingApprovals, recordProtectedActionAudit, resolveApproval } from "@/lib/server/store"
import { protectAgentAction } from "@/lib/terminal3/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const approvals = await getPendingApprovals()
  return NextResponse.json({ approvals })
}

export async function POST(request: Request) {
  const auth = verifyOperatorWrite(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = (await request.json().catch(() => ({}))) as { id?: string; approved?: boolean }
  const approval = body.id ? await getApprovalById(body.id) : null

  if (!approval) {
    return NextResponse.json({ error: "Approval item not found" }, { status: 404 })
  }

  if (approval.decision !== "pending") {
    return NextResponse.json({ error: "Approval item is already resolved", approval }, { status: 409 })
  }

  const decision = body.approved === true ? "approved" : "blocked"
  const proof = await protectAgentAction({
    agentId: approval.agentId,
    capability: approval.action,
    action: approval.title,
    target: approval.target,
    approved: body.approved === true,
    metadata: {
      ...approval.payload,
      decision,
    },
  })
  const resolved = await resolveApproval(approval.id, decision, proof)
  await recordProtectedActionAudit(
    {
      agentId: approval.agentId,
      title: `${decision === "approved" ? "Approved" : "Blocked"}: ${approval.title}`,
      target: approval.target,
      capability: approval.action,
    },
    proof,
  )

  return NextResponse.json({
    approval: resolved ?? approval,
    proof,
    status: proof.authorized ? "executed" : "blocked",
    authMode: auth.mode,
  })
}
