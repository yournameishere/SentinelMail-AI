import { Bot, Lock, Send, Sparkles, CalendarCheck } from "lucide-react"
import { agents } from "@/lib/sentinel-data"

const icons = {
  inbox: Bot,
  summary: Sparkles,
  reply: Bot,
  send: Send,
  calendar: CalendarCheck,
}

export function AgentRail() {
  return (
    <section className="bg-black px-4 py-24 text-white md:px-8">
      <div className="mb-14 flex items-end justify-between gap-8">
        <h2 className="font-serif text-[11vw] font-black uppercase leading-none md:text-[7vw]">Agent Monitor</h2>
        <Lock className="hidden h-20 w-20 text-[#FF4D00] md:block" />
      </div>

      <div className="border-t border-white/20">
        {agents.map((agent, index) => {
          const Icon = icons[agent.id]
          return (
            <div
              key={agent.id}
              className="group grid gap-5 border-b border-white/20 py-8 transition-colors hover:bg-white/5 md:grid-cols-[70px_1fr_1fr_180px]"
            >
              <div className="font-mono text-[#FF4D00]">({String(index + 1).padStart(2, "0")})</div>
              <div>
                <div className="flex items-center gap-3">
                  <Icon className="h-7 w-7 text-[#FF4D00]" />
                  <h3 className="font-serif text-4xl uppercase tracking-tight md:text-6xl">{agent.name}</h3>
                </div>
                <p className="mt-3 max-w-2xl font-mono text-sm text-white/65">{agent.summary}</p>
              </div>
              <div className="font-mono text-xs uppercase text-white/70">
                <div className="text-white">Can</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {agent.permissions.map((permission) => (
                    <span key={permission} className="border border-white/30 px-2 py-1">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              <div className="font-mono text-xs uppercase">
                <span className="text-[#FF4D00]">{agent.status.replace("-", " ")}</span>
                <p className="mt-3 text-white/60">{agent.lastAction}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

