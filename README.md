# SentinelMail AI

SentinelMail AI is a trusted multi-agent email secretary built for the Terminal3 Agent Auth SDK challenge. It demonstrates how an AI email workflow can stay accountable: every sensitive action is tied to an agent identity, scoped capability, approval decision, Terminal3 proof envelope, and audit event.

## What The App Does

- Classifies a priority inbox into urgent, work, finance, personal, and spam.
- Generates daily digests and reply drafts through agents that cannot send mail.
- Routes email send and calendar scheduling through an Approval Center.
- Runs protected actions through Terminal3 SDK session and signing helpers.
- Records protected decisions in a MongoDB-backed audit ledger with local fallback.
- Shows agent DIDs, permission scopes, denial lists, approval gates, and proof state.

## Terminal3 SDK Integration

The SDK integration lives in `frontend/lib/terminal3/client.ts` and uses `@terminal3/t3n-sdk`.

Implemented SDK surfaces:

- `setEnvironment()` for testnet/production selection.
- `loadWasmComponent()` for Terminal3 WASM crypto setup.
- `eth_get_address()`, `metamask_sign()`, and `createEthAuthInput()` for ETH auth.
- `T3nClient` handshake/authentication with bounded request timeout.
- `TenantClient`, `getNodeUrl()`, `tenantDidHex()`, `getUsage()`, and `formatTokens()`.
- `buildInvocationPreimage()` and `signAgentInvocation()` for protected action signatures.
- `buildDelegationCredential()` and `b64uEncodeBytes()` for contract-ready envelopes.

If Terminal3 live authentication is unavailable, the app falls back quickly to a labelled local verifier instead of hanging. Protected actions still return an action hash and proof object, and the UI clearly shows whether the proof came from a live Terminal3 session or fallback mode.

## Pages

- `/` - animated product entry.
- `/dashboard` - operations view with Terminal3 status, protected flow, agent rail, and inbox.
- `/chat` - command console for summary, draft, send, schedule, and audit requests.
- `/inbox` - classified email stream.
- `/drafts` - generated reply drafts.
- `/approvals` - approve/block protected actions.
- `/agents` - agent identity and permission monitor.
- `/audit` - persisted action ledger.
- `/adk` - judge-focused Terminal3 SDK integration view.

## Data And Security

- Approval and audit data use MongoDB when `MONGODB_URI` is configured.
- Local memory fallback keeps the demo usable without a database.
- Approval writes support operator-token enforcement with `SENTINEL_REQUIRE_OPERATOR_TOKEN=true`.
- Public demo mode can be enabled with `SENTINEL_PUBLIC_DEMO=true`.
- Security headers are configured in `frontend/next.config.mjs`.
- Vercel Analytics is opt-in with `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true`.

## Local Setup

```bash
cd frontend
npm install
npm run lint
npm run build
npm run start -- --port 3008 --hostname 127.0.0.1
```

Open `http://127.0.0.1:3008`.

## Environment Variables

Required for live Terminal3 mode:

```bash
T3N_ENVIRONMENT=testnet
T3N_API_KEY=
T3N_DID=
```

Supported aliases:

```bash
TERMINAL3_ENVIRONMENT=testnet
TERMINAL3_API_KEY=
TERMINAL3_DID=
TERMINAL3_PRIVATE_KEY=
TERMINAL3_ENABLE_LIVE_SESSION=false
```

Optional production variables:

```bash
MONGODB_URI=
MONGODB_DB=sentinelmail_ai
SENTINEL_REQUIRE_OPERATOR_TOKEN=true
SENTINEL_OPERATOR_TOKEN=
SENTINEL_PUBLIC_DEMO=false
NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=false
TERMINAL3_TIMEOUT_MS=8000
```

`TERMINAL3_ENABLE_LIVE_SESSION` is off by default so production responses never hang on an upstream handshake. The app still uses Terminal3 SDK signing helpers for protected action proofs. Turn it on when the deployed Terminal3 sandbox is responding consistently.

## Verification

Current verification commands:

```bash
cd frontend
npm run lint
npm run build
npm audit --omit=dev
$env:SMOKE_BASE_URL="http://127.0.0.1:3008"; npm run test:smoke
```

Latest local verification passed:

- TypeScript no-emit check.
- Production Next build on Next `16.2.9`.
- Production dependency audit with `0` vulnerabilities.
- Playwright smoke test across `/`, `/dashboard`, `/chat`, `/approvals`, `/audit`, `/adk`.
- API checks for `/api/terminal3/session`, `/api/approvals`, and `/api/audit`.
- Chat command interaction returning a Terminal3 proof panel.
- Desktop and mobile screenshot checks.

 