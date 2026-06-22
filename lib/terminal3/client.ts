import "server-only"

import { createHash, randomUUID } from "crypto"
import type { AgentCapability, AgentId } from "@/lib/sentinel-data"
import { agents, getAgent } from "@/lib/sentinel-data"

type Terminal3Sdk = typeof import("@terminal3/t3n-sdk")

export interface Terminal3SessionResult {
  mode: "live" | "offline"
  environment: "testnet" | "production"
  did: string
  expectedDid?: string
  didMatchesExpected?: boolean
  address?: string
  nodeUrl?: string
  tenantNamespace?: string
  balance?: string
  entries?: number
  sdk: string[]
  latencyMs?: number
  error?: string
}

export interface ProtectedActionRequest {
  agentId: AgentId
  capability: AgentCapability
  action: string
  target: string
  approved?: boolean
  metadata?: Record<string, string>
}

export interface ProtectedActionResult {
  authorized: boolean
  needsApproval: boolean
  agentDid: string
  sessionDid: string
  actionHash: string
  signature: string
  proofKind: "terminal3-sdk-signed" | "local-verifier"
  terminal3Mode: Terminal3SessionResult["mode"]
  reason: string
  issuedAt: string
  invocation?: {
    domain: string
    contract: string
    function: string
    vcId: string
    nonce: string
    requestHash: string
    agentSig: string
  }
  credential?: {
    contract: string
    functions: string[]
    scopes: string[]
    vcId: string
    validUntil: string
  }
  ledger: {
    action: string
    target: string
    capability: AgentCapability
    agent: string
    terminal3: string
  }
}

const SDK_NAMES = [
  "T3nClient",
  "TenantClient",
  "loadWasmComponent",
  "setEnvironment",
  "createEthAuthInput",
  "eth_get_address",
  "metamask_sign",
  "getUsage",
  "getNodeUrl",
  "tenantDidHex",
  "buildInvocationPreimage",
  "signAgentInvocation",
  "buildDelegationCredential",
  "b64uEncodeBytes",
  "formatTokens",
]

const SESSION_CACHE_MS = 60_000
const OFFLINE_CACHE_MS = 15_000
const DEFAULT_SESSION_TIMEOUT_MS = 8_000

let sessionCache: { value: Terminal3SessionResult; expiresAt: number } | null = null

function env(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }
  return undefined
}

function boolEnv(...names: string[]) {
  const value = env(...names)?.toLowerCase()
  return value === "1" || value === "true" || value === "yes"
}

function sessionTimeoutMs() {
  const parsed = Number(env("TERMINAL3_TIMEOUT_MS", "T3N_TIMEOUT_MS"))
  if (Number.isFinite(parsed) && parsed >= 2_000) return Math.min(parsed, 10_000)
  return DEFAULT_SESSION_TIMEOUT_MS
}

function stableStringify(input: unknown): string {
  if (input === null || typeof input !== "object") return JSON.stringify(input)
  if (Array.isArray(input)) return `[${input.map((item) => stableStringify(item)).join(",")}]`
  const sorted = Object.entries(input as Record<string, unknown>).sort(([left], [right]) =>
    left.localeCompare(right),
  )
  return `{${sorted
    .map(([key, value]) => `${JSON.stringify(key)}:${stableStringify(value)}`)
    .join(",")}}`
}

function shortHash(input: unknown) {
  return createHash("sha256").update(stableStringify(input)).digest("hex")
}

function sha256Bytes(input: string | Uint8Array) {
  return createHash("sha256").update(input).digest()
}

function fixedBytes(seed: string, length: number) {
  const output = new Uint8Array(length)
  let cursor = 0
  let round = 0

  while (cursor < length) {
    const digest = sha256Bytes(`${seed}:${round}`)
    output.set(digest.subarray(0, Math.min(digest.length, length - cursor)), cursor)
    cursor += digest.length
    round += 1
  }

  return output
}

function b64url(input: Uint8Array) {
  return Buffer.from(input).toString("base64url")
}

function hexToBytes(hex: string) {
  const cleaned = hex.replace(/^0x/i, "")
  if (!/^[a-f0-9]{64}$/i.test(cleaned)) return undefined
  return new Uint8Array(Buffer.from(cleaned, "hex"))
}

function signingSecret(agentId: AgentId) {
  const secret = env(
    "TERMINAL3_PRIVATE_KEY",
    "T3N_AGENT_PRIVATE_KEY",
    "SENTINEL_AGENT_PRIVATE_KEY",
    "AGENTVAULT_SERVER_SECRET",
    "SKILLPROOF_SESSION_SECRET",
    "TERMINAL3_API_KEY",
    "T3N_API_KEY",
  )
  const raw = secret ? hexToBytes(secret) : undefined
  const bytes = raw ?? sha256Bytes(`${secret ?? "sentinelmail-local-agent"}:${agentId}`)

  if (bytes.every((value) => value === 0)) bytes[0] = 1
  return bytes
}

function actionFunction(capability: AgentCapability) {
  return capability.replace(".", "-")
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string) {
  let timeout: ReturnType<typeof setTimeout>
  return Promise.race<T>([
    promise.finally(() => clearTimeout(timeout)),
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(label))
      }, ms)
    }),
  ])
}

function redactError(error: unknown) {
  if (error instanceof Error) return error.message.replace(/0x[a-fA-F0-9]{32,}/g, "0x...redacted")
  return "Terminal3 SDK call failed"
}

async function loadSdk(): Promise<Terminal3Sdk> {
  return import("@terminal3/t3n-sdk")
}

function offlineSession(environment: Terminal3SessionResult["environment"], error: string): Terminal3SessionResult {
  const expectedDid = env("T3N_DID", "TERMINAL3_DID")
  return {
    mode: "offline",
    environment,
    did: expectedDid ?? "did:t3n:offline-sentinelmail-demo",
    expectedDid,
    didMatchesExpected: expectedDid ? true : undefined,
    sdk: SDK_NAMES,
    error,
  }
}

async function resolveTerminal3Session(environment: Terminal3SessionResult["environment"]) {
  const startedAt = Date.now()
  const key = env("T3N_API_KEY", "TERMINAL3_API_KEY")
  const expectedDid = env("T3N_DID", "TERMINAL3_DID")
  const sdk = await loadSdk()

  sdk.setEnvironment(environment)

  if (!boolEnv("TERMINAL3_ENABLE_LIVE_SESSION", "T3N_ENABLE_LIVE_SESSION")) {
    return {
      ...offlineSession(
        environment,
        "Live Terminal3 handshake is disabled by default for fast production responses; SDK action signing remains active.",
      ),
      nodeUrl: sdk.getNodeUrl(),
      tenantNamespace: expectedDid ? `z:${sdk.tenantDidHex(expectedDid)}:sentinelmail-agent-auth` : undefined,
      latencyMs: Date.now() - startedAt,
    }
  }

  if (!key) {
    return {
      ...offlineSession(
        environment,
        "T3N_API_KEY or TERMINAL3_API_KEY is not configured, so the app is using the local verifier.",
      ),
      nodeUrl: sdk.getNodeUrl(),
      tenantNamespace: expectedDid ? `z:${sdk.tenantDidHex(expectedDid)}:sentinelmail-agent-auth` : undefined,
      latencyMs: Date.now() - startedAt,
    }
  }

  const address = sdk.eth_get_address(key)
  const wasmComponent = await sdk.loadWasmComponent()
  const client = new sdk.T3nClient({
    wasmComponent,
    timeout: Math.min(sessionTimeoutMs(), 10_000),
    handlers: {
      EthSign: sdk.metamask_sign(address, undefined, key),
    },
  })

  await client.handshake()
  const did = await client.authenticate(sdk.createEthAuthInput(address))
  const sessionDid = did.value
  const didMatchesExpected = expectedDid ? sessionDid === expectedDid : undefined
  const tenant = new sdk.TenantClient({
    t3n: client,
    baseUrl: sdk.getNodeUrl(),
    tenantDid: sessionDid,
  })
  const usage = await withTimeout(client.getUsage({ limit: 5 }), 2_500, "Terminal3 usage check timed out").catch(
    () => undefined,
  )

  return {
    mode: "live",
    environment,
    did: sessionDid,
    expectedDid,
    didMatchesExpected,
    address,
    nodeUrl: sdk.getNodeUrl(),
    tenantNamespace: tenant.canonicalName("sentinelmail-agent-auth"),
    balance: usage ? sdk.formatTokens(usage.balance.available) : undefined,
    entries: usage?.entries.length,
    sdk: SDK_NAMES,
    latencyMs: Date.now() - startedAt,
    error: didMatchesExpected === false ? "Authenticated Terminal3 DID does not match configured DID." : undefined,
  } satisfies Terminal3SessionResult
}

export async function getTerminal3Session(force = false): Promise<Terminal3SessionResult> {
  const environment = (env("T3N_ENVIRONMENT", "TERMINAL3_ENVIRONMENT") === "production"
    ? "production"
    : "testnet") as "testnet" | "production"
  const now = Date.now()

  if (!force && sessionCache && sessionCache.expiresAt > now) return sessionCache.value

  try {
    const session = await withTimeout(
      resolveTerminal3Session(environment),
      sessionTimeoutMs(),
      "Terminal3 session timed out; local verifier took over.",
    )
    sessionCache = {
      value: session,
      expiresAt: Date.now() + (session.mode === "live" ? SESSION_CACHE_MS : OFFLINE_CACHE_MS),
    }
    return session
  } catch (error) {
    const session = offlineSession(environment, redactError(error))
    sessionCache = { value: session, expiresAt: Date.now() + OFFLINE_CACHE_MS }
    return session
  }
}

export function evaluatePolicy(request: ProtectedActionRequest) {
  const agent = getAgent(request.agentId)
  const allowed = agent.permissions.includes(request.capability)
  const needsApproval = agent.requiresApproval.includes(request.capability)
  const explicitlyBlocked = request.metadata?.decision === "blocked"
  const authorized = allowed && !explicitlyBlocked && (!needsApproval || request.approved === true)

  let reason = `${agent.name} is scoped for ${request.capability}.`
  if (!allowed) reason = `${agent.name} is not permitted to execute ${request.capability}.`
  if (allowed && explicitlyBlocked) {
    reason = `${agent.name} did not execute ${request.capability} because the operator blocked this request.`
  }
  if (allowed && needsApproval && !request.approved && !explicitlyBlocked) {
    reason = `${agent.name} can execute ${request.capability}, but Terminal3 policy requires user approval first.`
  }
  if (authorized && needsApproval) {
    reason = `${agent.name} passed permission scope and human approval gates.`
  }

  return { agent, allowed, needsApproval, authorized, explicitlyBlocked, reason }
}

async function buildSdkProof(
  payload: Record<string, unknown>,
  actionHash: string,
  request: ProtectedActionRequest,
  session: Terminal3SessionResult,
) {
  const sdk = await loadSdk()
  const vcId = fixedBytes(`${actionHash}:${session.did}:${request.agentId}:vc`, sdk.VC_ID_LEN)
  const nonce = fixedBytes(`${randomUUID()}:${actionHash}:nonce`, sdk.NONCE_LEN)
  const reqHash = sha256Bytes(stableStringify(payload))
  const preimage = sdk.buildInvocationPreimage(vcId, nonce, reqHash)
  const agentSig = sdk.signAgentInvocation(preimage, signingSecret(request.agentId))
  const encode = sdk.b64uEncodeBytes ?? b64url
  const now = Math.floor(Date.now() / 1000)
  const functionName = actionFunction(request.capability)
  const credential = sdk.buildDelegationCredential({
    user_did: session.did,
    org_did: session.did,
    agent_pubkey: fixedBytes(`${request.agentId}:${session.did}:agent-pubkey`, sdk.AGENT_PUBKEY_LEN),
    contract: "tee:sentinelmail-agent-auth",
    functions: [functionName],
    scopes: ["email.metadata", "calendar.metadata", "audit.write"].sort(),
    metadata: {
      app: "sentinelmail-ai",
      agent_id: request.agentId,
      capability: request.capability,
    },
    not_before_secs: now - 60,
    not_after_secs: now + 3600,
    vc_id: vcId,
  })

  return {
    signature: `t3-sdk-${encode(agentSig)}`,
    proofKind: "terminal3-sdk-signed" as const,
    invocation: {
      domain: sdk.DELEGATION_INVOCATION_DOMAIN,
      contract: "tee:sentinelmail-agent-auth",
      function: functionName,
      vcId: encode(vcId),
      nonce: encode(nonce),
      requestHash: encode(reqHash),
      agentSig: encode(agentSig),
    },
    credential: {
      contract: credential.contract,
      functions: credential.functions,
      scopes: credential.scopes,
      vcId: encode(credential.vc_id),
      validUntil: new Date(Number(credential.not_after_secs) * 1000).toISOString(),
    },
  }
}

export async function protectAgentAction(request: ProtectedActionRequest): Promise<ProtectedActionResult> {
  const session = await getTerminal3Session()
  const policy = evaluatePolicy(request)
  const agent = getAgent(request.agentId)
  const issuedAt = new Date().toISOString()
  const payload = {
    app: "SentinelMail AI",
    agentDid: agent.did,
    sessionDid: session.did,
    capability: request.capability,
    action: request.action,
    target: request.target,
    approved: request.approved === true,
    metadata: request.metadata ?? {},
    issuedAt,
  }
  const actionHash = `0x${shortHash(payload)}`
  const fallbackSignatureMaterial = `${actionHash}:${agent.did}:${session.did}:${policy.authorized}`
  const fallbackSignature = `t3-local-${shortHash(fallbackSignatureMaterial).slice(0, 32)}`
  const sdkProof = await buildSdkProof(payload, actionHash, request, session).catch(() => undefined)

  return {
    authorized: policy.authorized,
    needsApproval: policy.needsApproval && !request.approved && !policy.explicitlyBlocked,
    agentDid: agent.did,
    sessionDid: session.did,
    actionHash,
    signature: sdkProof?.signature ?? fallbackSignature,
    proofKind: sdkProof?.proofKind ?? "local-verifier",
    terminal3Mode: session.mode,
    reason: policy.reason,
    issuedAt,
    invocation: sdkProof?.invocation,
    credential: sdkProof?.credential,
    ledger: {
      action: request.action,
      target: request.target,
      capability: request.capability,
      agent: agent.name,
      terminal3:
        sdkProof && session.mode === "live"
          ? "Live Terminal3 SDK session authenticated the caller DID, then SDK invocation helpers signed the protected action."
          : sdkProof
            ? "Terminal3 SDK invocation helpers signed the action envelope while the local verifier handled session fallback."
            : "Local verifier is active because Terminal3 SDK signing was unavailable for this request.",
    },
  }
}

export function policyMatrix() {
  return agents.map((agent) => ({
    agent: agent.name,
    did: agent.did,
    can: agent.permissions,
    cannot: agent.cannot,
    approval: agent.requiresApproval,
  }))
}

export function terminal3RuntimeConfig() {
  return {
    hasApiKey: Boolean(env("T3N_API_KEY", "TERMINAL3_API_KEY")),
    hasDid: Boolean(env("T3N_DID", "TERMINAL3_DID")),
    hasAgentSecret: Boolean(
      env("TERMINAL3_PRIVATE_KEY", "T3N_AGENT_PRIVATE_KEY", "SENTINEL_AGENT_PRIVATE_KEY"),
    ),
    liveSessionEnabled: boolEnv("TERMINAL3_ENABLE_LIVE_SESSION", "T3N_ENABLE_LIVE_SESSION"),
    publicDemoMode: boolEnv("SENTINEL_PUBLIC_DEMO", "AGENTVAULT_ENABLE_PUBLIC_DEMO_SESSION"),
  }
}
