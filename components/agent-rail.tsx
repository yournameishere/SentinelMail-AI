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
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 border-b border-white/20 pb-8 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <div className="flex items-end gap-4">
            <h2 className="font-serif text-5xl font-black uppercase leading-none md:text-7xl">Agent monitor</h2>
            <Lock className="hidden h-12 w-12 text-[#FF4D00] md:block" />
          </div>
          <p className="max-w-3xl font-mono text-sm leading-7 text-white/68">
            Each agent owns a narrow permission set. Send and calendar agents can execute only after approval and proof
            generation.
          </p>
        </div>

      <div className="divide-y divide-white/15">
        {agents.map((agent, index) => {
          const Icon = icons[agent.id]
          return (
            <div
              key={agent.id}
              className="group grid gap-5 py-8 transition-colors hover:bg-white/5 md:grid-cols-[64px_minmax(0,1.1fr)_minmax(0,0.9fr)_170px]"
            >
              <div className="font-mono text-[#FF4D00]">({String(index + 1).padStart(2, "0")})</div>
              <div>
                <div className="flex items-center gap-3">
                  <Icon className="h-7 w-7 text-[#FF4D00]" />
                  <h3 className="font-serif text-3xl uppercase leading-none md:text-5xl">{agent.name}</h3>
                </div>
                <p className="mt-3 max-w-2xl font-mono text-sm leading-7 text-white/65">{agent.summary}</p>
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
      </div>
    </section>
  )
}
