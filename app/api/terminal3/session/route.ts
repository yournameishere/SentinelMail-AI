import { NextResponse } from "next/server"
import { getTerminal3Session, policyMatrix } from "@/lib/terminal3/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get("force") === "1"
  const session = await getTerminal3Session(force)
  return NextResponse.json({
    session,
    policyMatrix: policyMatrix(),
  })
}
