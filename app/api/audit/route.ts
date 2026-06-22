import { NextResponse } from "next/server"
import { getAuditEvents } from "@/lib/server/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const events = await getAuditEvents()
  return NextResponse.json({ events })
}
