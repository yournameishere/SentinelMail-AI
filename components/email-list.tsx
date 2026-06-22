import { AlertTriangle, Mail, Shield } from "lucide-react"
import { emails, riskTone } from "@/lib/sentinel-data"

export function EmailList() {
  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="mx-auto max-w-7xl divide-y divide-black/20 border-y border-black/25">
        {emails.map((email, index) => (
          <article
            key={email.id}
            className="grid gap-5 py-6 transition-colors hover:bg-[#fffdf7] md:grid-cols-[64px_minmax(0,1fr)_180px_110px]"
          >
            <div className="font-mono text-sm text-black/55">({String(index + 1).padStart(2, "0")})</div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Mail className="h-5 w-5 text-[#FF4D00]" />
                <h2 className="font-serif text-3xl uppercase leading-none md:text-4xl">{email.subject}</h2>
              </div>
              <p className="mt-3 break-all font-mono text-sm text-black/65">{email.from}</p>
              <p className="mt-3 max-w-3xl font-mono text-sm leading-7 text-black/70">{email.preview}</p>
            </div>
            <div className="font-mono text-xs uppercase text-black/70">
              <div>{email.category}</div>
              <div className={`mt-2 flex items-center gap-2 ${riskTone(email.risk)}`}>
                {email.risk === "high" ? <AlertTriangle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {email.risk} risk
              </div>
            </div>
            <div className="font-mono text-sm uppercase text-black/60">{email.receivedAt}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
