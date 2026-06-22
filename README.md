# SentinelMail AI Frontend

SentinelMail AI is a trusted multi-agent email secretary built for the Terminal3 Agent Auth SDK challenge. The app shows how an AI assistant can handle inbox workflows without becoming an anonymous black box: every protected action is connected to an agent identity, scoped permission, approval decision, Terminal3 proof envelope, and audit trail.

## Live Links

- Production app: https://frontend-2we8s01gm-nikkus-projects-d0d225f5.vercel.app
- Production alias: https://frontend-gamma-ten-34.vercel.app
- Terminal3: https://www.terminal3.io/
- Terminal3 Agent Developer Kit: https://www.terminal3.io/products/agent-developer-kit
- Terminal3 docs: https://docs.terminal3.io/developers/adk/overview/what-is-adk
- Hackathon: https://dorahacks.io/hackathon/t3adkdevchallenge/detail

## What The App Does

SentinelMail AI turns email automation into a controlled, auditable workflow:

- Reads and classifies a priority inbox.
- Detects urgent, finance, personal, work, and spam messages.
- Generates daily email digests.
- Drafts professional replies without allowing the drafting agent to send.
- Creates protected send and calendar requests.
- Requires approval before state-changing work executes.
- Produces Terminal3 SDK-backed proof objects for protected actions.
- Stores approval and audit history with MongoDB when configured.
- Falls back to an in-memory demo store when MongoDB is not available.

## Why It Is Useful

Most AI email assistants are risky because they can act without clear ownership. SentinelMail AI is designed for teams that need automation but still need control:

- Founders can delegate inbox triage while keeping send actions gated.
- Managers can review outbound messages before agents execute them.
- Finance teams can flag invoice emails without exposing send permissions.
- Security teams can audit which agent performed each action.
- Enterprises can prove that sensitive workflows used scoped authorization.

## Core Idea

Instead of one all-powerful agent, SentinelMail uses specialized agents with limited permissions.

```text
User command
  -> Scoped AI agent
  -> Terminal3 SDK proof path
  -> Permission check
  -> Human approval when needed
  -> Action result
  -> Audit ledger
```

## Agents

| Agent | Can Do | Cannot Do | Approval Required |
| --- | --- | --- | --- |
| Inbox Agent | Read and classify mail | Send mail, create calendar events | No |
| Summary Agent | Read and summarize threads | Send mail, create calendar events | No |
| Reply Agent | Read mail and draft replies | Send mail | No |
| Send Agent | Send outbound email | Read inbox, create calendar events | Yes |
| Calendar Agent | Create calendar events | Send mail | Yes |

## Terminal3 SDK Usage

The Terminal3 integration lives in `lib/terminal3/client.ts`.

SDK surfaces used:

- `setEnvironment()`
- `loadWasmComponent()`
- `eth_get_address()`
- `metamask_sign()`
- `createEthAuthInput()`
- `T3nClient`
- `TenantClient`
- `getNodeUrl()`
- `tenantDidHex()`
- `getUsage()`
- `formatTokens()`
- `buildInvocationPreimage()`
- `signAgentInvocation()`
- `buildDelegationCredential()`
- `b64uEncodeBytes()`

The app keeps API responses fast by default. Live Terminal3 handshakes are controlled by `TERMINAL3_ENABLE_LIVE_SESSION=true`; protected action signing still uses Terminal3 SDK helpers even when the live handshake is disabled.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Animated product entry and overview |
| `/dashboard` | Mission control view with protected action flow |
| `/chat` | Natural-language agent command console |
| `/inbox` | Classified priority inbox |
| `/drafts` | AI-generated reply drafts |
| `/approvals` | Approve or block protected send/calendar work |
| `/agents` | Agent identity and permission monitor |
| `/audit` | Persistent proof and action ledger |
| `/adk` | Terminal3 SDK integration page for judges |

## Main User Flow

1. User asks SentinelMail to summarize mail, draft a reply, send an email, or schedule a meeting.
2. The app selects the correct scoped agent.
3. The server builds a protected action payload.
4. Terminal3 SDK helpers sign the invocation envelope.
5. The policy layer checks whether the agent has the required capability.
6. If the action changes external state, Approval Center requires human approval.
7. The decision and proof are written to the audit ledger.

## Tech Stack

- Next.js `16.2.9`
- React `19.2.0`
- TypeScript
- Tailwind CSS
- Framer Motion
- Terminal3 SDK
- MongoDB
- Playwright smoke testing
- Vercel hosting

## Project Structure

```text
frontend/
  app/
    api/
      agent-command/
      approvals/
      audit/
      terminal3/session/
    dashboard/
    chat/
    approvals/
    audit/
    adk/
  components/
  lib/
    server/
      auth.ts
      store.ts
    terminal3/
      client.ts
    sentinel-data.ts
  public/
    icon.svg
    apple-icon.svg
  scripts/
    smoke-test.cjs
```

## Environment Variables

Terminal3:

```bash
T3N_ENVIRONMENT=testnet
T3N_API_KEY=
T3N_DID=

TERMINAL3_ENVIRONMENT=testnet
TERMINAL3_API_KEY=
TERMINAL3_DID=
TERMINAL3_PRIVATE_KEY=
TERMINAL3_ENABLE_LIVE_SESSION=false
TERMINAL3_TIMEOUT_MS=8000
```

Persistence and security:

```bash
MONGODB_URI=
MONGODB_DB=sentinelmail_ai
SENTINEL_REQUIRE_OPERATOR_TOKEN=false
SENTINEL_OPERATOR_TOKEN=
SENTINEL_PUBLIC_DEMO=true
NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=false
```

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

## Production Build

```bash
npm run lint
npm run build
npm run start -- --port 3009 --hostname 127.0.0.1
```

Open:

```text
http://127.0.0.1:3009
```

## Smoke Test

PowerShell:

```powershell
$env:SMOKE_BASE_URL="http://127.0.0.1:3009"
npm run test:smoke
```

Production:

```powershell
$env:SMOKE_BASE_URL="https://frontend-2we8s01gm-nikkus-projects-d0d225f5.vercel.app"
npm run test:smoke
```

The smoke test checks:

- Core page rendering.
- Page titles and real app content.
- Framework error overlays.
- API responsiveness.
- Chat command execution.
- Terminal3 proof panel rendering.
- Console and request health.

## Deployment

This app deploys as a single Next.js project on Vercel. The API routes are included in the same deployment, so a separate Render backend is not required unless the backend is split into an independent service later.

Vercel settings:

- Root directory: `frontend`
- Install command: `npm install`
- Build command: `npm run build`
- Output: Next.js default

## Current Verification Status

The latest checked build passed:

- `npm run lint`
- `npm run build`
- `npm audit --omit=dev`
- local Playwright smoke test
- deployed Vercel smoke test

## Production Notes

- `TERMINAL3_ENABLE_LIVE_SESSION` is off by default to avoid upstream handshake delays in production.
- Terminal3 SDK signing helpers still run for protected action proofs.
- Set `SENTINEL_REQUIRE_OPERATOR_TOKEN=true` for private production deployments.
- Keep real API keys in Vercel environment variables, not in source control.
- Demo inbox and draft data are static by design for the hackathon flow.
