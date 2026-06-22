"use client"

export function Footer() {
  return (
    <footer className="bg-background px-4 pb-10 pt-20 text-black md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border-y border-black py-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-serif text-5xl font-black uppercase leading-none md:text-7xl">Trust the agent</h2>
            <p className="mt-5 max-w-2xl font-mono text-sm leading-7 text-black/70">
              Run protected email commands through scoped agents, approval gates, and Terminal3-backed proof.
            </p>
          </div>
          <a
            href="/chat"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 font-mono text-xs uppercase text-[#FF4D00] transition-colors hover:bg-[#FF4D00] hover:text-black"
          >
            Run a protected command
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="font-mono text-sm uppercase text-black/70">© 2026 SentinelMail AI</div>
          <div className="flex flex-wrap gap-5">
            {["Dashboard", "Approvals", "Agents", "Audit"].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase()}`}
                className="font-mono text-sm uppercase text-black transition-colors hover:text-[#FF4D00]"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
