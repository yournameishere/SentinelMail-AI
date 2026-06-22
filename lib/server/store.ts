import "server-only"

import { MongoClient, type Collection, type Db } from "mongodb"
import {
  approvals as seedApprovals,
  auditEvents as seedAuditEvents,
  getAgent,
  type AgentCapability,
  type AgentId,
  type ApprovalItem,
  type AuditEvent,
} from "@/lib/sentinel-data"
import type { ProtectedActionResult } from "@/lib/terminal3/client"

export type ApprovalDecision = "pending" | "approved" | "blocked"

export type StoredApproval = ApprovalItem & {
  decision: ApprovalDecision
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  proof?: Pick<
    ProtectedActionResult,
    "actionHash" | "signature" | "terminal3Mode" | "proofKind" | "authorized" | "reason"
  >
}

export type StoredAuditEvent = AuditEvent & {
  createdAt: string
  actionHash?: string
  signature?: string
  terminal3Mode?: ProtectedActionResult["terminal3Mode"]
  proofKind?: ProtectedActionResult["proofKind"]
  target?: string
  capability?: AgentCapability
  agentDid?: string
  sessionDid?: string
}

let mongoClientPromise: Promise<MongoClient> | null = null
let seedDatabasePromise: Promise<void> | null = null

let memoryApprovals: StoredApproval[] = seedApprovals.map((approval) => ({
  ...approval,
  decision: "pending",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

let memoryAuditEvents: StoredAuditEvent[] = seedAuditEvents.map((event, index) => ({
  ...event,
  createdAt: new Date(Date.now() - (seedAuditEvents.length - index) * 60_000).toISOString(),
}))

function normalizeAuditStatus(status: unknown): AuditEvent["status"] {
  if (status === "success" || status === "signed" || status === "pending" || status === "blocked") return status
  if (status === "approved" || status === "allowed") return "signed"
  if (status === "denied") return "blocked"
  return "success"
}

function displayTime(event: { time?: unknown; createdAt?: unknown }) {
  if (typeof event.time === "string" && event.time.trim()) return event.time
  if (typeof event.createdAt === "string") {
    const parsed = new Date(event.createdAt)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    }
  }
  return "--:--"
}

function normalizeAuditEvent(event: StoredAuditEvent): StoredAuditEvent {
  return {
    ...event,
    time: displayTime(event),
    status: normalizeAuditStatus(event.status),
    proof: event.proof || event.actionHash || "proof recorded",
    createdAt: event.createdAt || new Date().toISOString(),
  }
}

function mongoUri() {
  return process.env.MONGODB_URI?.trim()
}

async function getDb(): Promise<Db | null> {
  const uri = mongoUri()
  if (!uri) return null

  mongoClientPromise ??= new MongoClient(uri, {
    connectTimeoutMS: 3_000,
    serverSelectionTimeoutMS: 3_000,
    maxPoolSize: 5,
  }).connect()
  const client = await mongoClientPromise
  return client.db(process.env.MONGODB_DB?.trim() || "sentinelmail_ai")
}

async function withCollection<T>(
  name: string,
  run: (collection: Collection) => Promise<T>,
): Promise<T | undefined> {
  try {
    const db = await getDb()
    if (!db) return undefined
    await seedDatabase(db)
    return await run(db.collection(name))
  } catch {
    mongoClientPromise = null
    return undefined
  }
}

async function seedDatabase(db: Db) {
  seedDatabasePromise ??= seedDatabaseOnce(db)
  try {
    return await seedDatabasePromise
  } catch (error) {
    seedDatabasePromise = null
    throw error
  }
}

async function seedDatabaseOnce(db: Db) {
  const approvals = db.collection("approvals")
  const audits = db.collection("audit_events")
  const now = new Date().toISOString()

  await Promise.all([
    approvals.createIndex({ id: 1 }, { unique: true }),
    approvals.createIndex({ decision: 1, updatedAt: -1 }),
    audits.createIndex({ id: 1 }, { unique: true }),
    audits.createIndex({ createdAt: -1 }),
  ]).catch(() => undefined)

  await Promise.all(
    seedApprovals.map((approval) =>
      approvals.updateOne(
        { id: approval.id },
        {
          $setOnInsert: {
            ...approval,
            decision: "pending",
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      ),
    ),
  )

  await Promise.all(
    seedAuditEvents.map((event, index) =>
      audits.updateOne(
        { id: event.id },
        {
          $setOnInsert: {
            ...event,
            createdAt: new Date(Date.now() - (seedAuditEvents.length - index) * 60_000).toISOString(),
          },
        },
        { upsert: true },
      ),
    ),
  )
}

export async function createPendingApproval(input: {
  title: string
  target: string
  agentId: AgentId
  action: AgentCapability
  risk: ApprovalItem["risk"]
  payload: Record<string, string>
}) {
  const now = new Date()
  const approval: StoredApproval = {
    id: `ap-${now.getTime()}-${Math.random().toString(16).slice(2, 8)}`,
    title: input.title,
    target: input.target,
    agentId: input.agentId,
    action: input.action,
    risk: input.risk,
    requestedAt: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    payload: input.payload,
    decision: "pending",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  const inserted = await withCollection<StoredApproval>("approvals", async (collection) => {
    await collection.insertOne(approval)
    return approval
  })

  if (inserted) return inserted

  memoryApprovals = [...memoryApprovals, approval]
  return approval
}

export async function getPendingApprovals() {
  const stored = await withCollection<StoredApproval[]>("approvals", async (collection) =>
    collection
      .find({ decision: "pending" })
      .sort({ createdAt: 1 })
      .project({ _id: 0 })
      .toArray() as Promise<StoredApproval[]>,
  )

  return stored ?? memoryApprovals.filter((approval) => approval.decision === "pending")
}

export async function getApprovalById(id: string) {
  const stored = await withCollection<StoredApproval | null>("approvals", async (collection) =>
    collection.findOne({ id }, { projection: { _id: 0 } }) as Promise<StoredApproval | null>,
  )

  return stored ?? memoryApprovals.find((approval) => approval.id === id) ?? null
}

export async function resolveApproval(
  id: string,
  decision: Exclude<ApprovalDecision, "pending">,
  proof: ProtectedActionResult,
) {
  const resolvedAt = new Date().toISOString()
  const proofSnapshot: StoredApproval["proof"] = {
    actionHash: proof.actionHash,
    signature: proof.signature,
    terminal3Mode: proof.terminal3Mode,
    proofKind: proof.proofKind,
    authorized: proof.authorized,
    reason: proof.reason,
  }

  const stored = await withCollection<StoredApproval | null>("approvals", async (collection) => {
    await collection.updateOne(
      { id },
      {
        $set: {
          decision,
          resolvedAt,
          updatedAt: resolvedAt,
          proof: proofSnapshot,
        },
      },
    )
    return collection.findOne({ id }, { projection: { _id: 0 } }) as Promise<StoredApproval | null>
  })

  if (stored !== undefined) return stored

  memoryApprovals = memoryApprovals.map((approval) =>
    approval.id === id
      ? {
          ...approval,
          decision,
          resolvedAt,
          updatedAt: resolvedAt,
          proof: proofSnapshot,
        }
      : approval,
  )
  return memoryApprovals.find((approval) => approval.id === id) ?? null
}

export async function getAuditEvents(limit = 50) {
  const stored = await withCollection<StoredAuditEvent[]>("audit_events", async (collection) =>
    collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .project({ _id: 0 })
      .toArray() as Promise<StoredAuditEvent[]>,
  )

  return (stored ?? memoryAuditEvents.toSorted((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, limit)).map(
    normalizeAuditEvent,
  )
}

export async function recordProtectedActionAudit(
  action: {
    agentId: AgentId
    title: string
    target: string
    capability: AgentCapability
  },
  proof: ProtectedActionResult,
) {
  const now = new Date()
  const agent = getAgent(action.agentId)
  const event: StoredAuditEvent = {
    id: `au-${now.getTime()}-${Math.random().toString(16).slice(2, 8)}`,
    time: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    agentId: action.agentId,
    action: action.title,
    status: proof.authorized ? "signed" : proof.needsApproval ? "pending" : "blocked",
    proof: `${proof.proofKind} ${proof.actionHash.slice(0, 10)}...`,
    createdAt: now.toISOString(),
    actionHash: proof.actionHash,
    signature: proof.signature,
    terminal3Mode: proof.terminal3Mode,
    proofKind: proof.proofKind,
    target: action.target,
    capability: action.capability,
    agentDid: agent.did,
    sessionDid: proof.sessionDid,
  }

  const inserted = await withCollection<StoredAuditEvent>("audit_events", async (collection) => {
    await collection.insertOne(event)
    return event
  })

  if (inserted) return inserted

  memoryAuditEvents = [event, ...memoryAuditEvents]
  return event
}
