"use client"

export function Footer() {
  return (
    <footer className="bg-background pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-serif text-[10vw] leading-none font-black uppercase mb-8 text-black">Trust the Agent</h2>
          <a
            href="/chat"
            className="px-12 py-4 bg-black text-white rounded-full font-mono text-xl uppercase hover:scale-105 transition-transform"
          >
            Run a protected command
          </a>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mt-20 border-t-2 border-black pt-8 gap-4">
          <div className="font-mono font-bold uppercase text-sm text-black">© 2026 SentinelMail AI</div>
          <div className="flex gap-8">
            {["Dashboard", "Approvals", "Agents", "Audit"].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase()}`}
                className="font-mono font-bold uppercase text-sm hover:underline decoration-2 text-black"
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
