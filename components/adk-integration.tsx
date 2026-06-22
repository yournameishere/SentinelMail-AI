import { Code2, Database, FileSignature, KeyRound, Network, ShieldCheck } from "lucide-react"
import { Terminal3Status } from "@/components/terminal3-status"

const sdkSteps = [
  {
    icon: KeyRound,
    title: "Authenticated session",
    detail: "Server route loads WASM crypto, derives the wallet address from T3N_API_KEY, handshakes, and authenticates.",
  },
  {
    icon: ShieldCheck,
    title: "Read DID from session",
    detail: "The tenant DID is never derived in app code. It is read from T3nClient.authenticate() and reused by TenantClient.",
  },
  {
    icon: Database,
    title: "Tenant namespace",
    detail: "The app prepares z:<tenant>:sentinelmail-agent-auth as the private agent-auth namespace for maps/contracts.",
  },
  {
    icon: Network,
    title: "Scoped agent authorization",
    detail: "Each agent has a capability list. Send and Calendar actions require approval before they execute.",
  },
  {
    icon: FileSignature,
    title: "Signed protected actions",
    detail: "Approvals produce action hashes, SDK invocation signatures, agent DID, session DID, status, and audit copy.",
  },
  {
    icon: Code2,
    title: "Delegation-ready envelope",
    detail: "The server helper builds invocation preimages and delegation credential bodies that can be submitted to a Terminal3 contract.",
  },
]

export function AdkIntegration() {
  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Terminal3Status />

      <div className="mt-12 divide-y divide-black/20 border-y border-black/25">
        {sdkSteps.map((step, index) => {
          const Icon = step.icon
          return (
            <article
              key={step.title}
              className="grid gap-5 py-7 md:grid-cols-[70px_70px_minmax(0,1fr)]"
            >
              <div className="font-mono text-sm text-black/55">({String(index + 1).padStart(2, "0")})</div>
              <Icon className="h-9 w-9 text-[#FF4D00]" />
              <div>
                <h2 className="font-serif text-3xl uppercase leading-none md:text-5xl">{step.title}</h2>
                <p className="mt-4 max-w-3xl font-mono text-sm leading-7 text-black/70">{step.detail}</p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-14 grid gap-8 border-y border-black py-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-4xl uppercase leading-none">SDK functions used</h2>
          <p className="mt-5 break-words font-mono text-sm leading-7 text-black/70">
            `T3nClient`, `TenantClient`, `setEnvironment`, `loadWasmComponent`, `eth_get_address`, `metamask_sign`,
            `createEthAuthInput`, `getNodeUrl`, `tenantDidHex`, `buildInvocationPreimage`, `signAgentInvocation`,
            `buildDelegationCredential`, `b64uEncodeBytes`, `formatTokens`.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-4xl uppercase leading-none">Protected demo path</h2>
          <p className="mt-5 font-mono text-sm leading-7 text-black/70">
            Chat creates protected actions, Approval Center executes state-changing requests, Agent Monitor proves
            scoped authorization, and Audit Ledger records the signed trail.
          </p>
        </div>
      </div>
      </div>
    </section>
  )
}
