import { AlertTriangle, Mail, Shield } from "lucide-react"
import { emails, riskTone } from "@/lib/sentinel-data"

export function EmailList() {
  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="border-t-2 border-black">
        {emails.map((email, index) => (
          <article
            key={email.id}
            className="grid gap-5 border-b-2 border-black py-7 transition-colors hover:bg-black hover:text-[#FF4D00] md:grid-cols-[70px_1fr_180px_120px]"
          >
            <div className="font-mono text-sm">({String(index + 1).padStart(2, "0")})</div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Mail className="h-5 w-5" />
                <h2 className="font-serif text-3xl uppercase leading-none md:text-5xl">{email.subject}</h2>
              </div>
              <p className="mt-3 font-mono text-sm">{email.from}</p>
              <p className="mt-3 max-w-3xl font-mono text-sm opacity-75">{email.preview}</p>
            </div>
            <div className="font-mono text-xs uppercase">
              <div>{email.category}</div>
              <div className={`mt-2 flex items-center gap-2 ${riskTone(email.risk)}`}>
                {email.risk === "high" ? <AlertTriangle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {email.risk} risk
              </div>
            </div>
            <div className="font-mono text-sm uppercase">{email.receivedAt}</div>
          </article>
        ))}
      </div>
    </section>
  )
}

