import type { ReactNode } from "react"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

interface PageShellProps {
  title: ReactNode
  intro?: string
  children: ReactNode
  inverse?: boolean
}

export function PageShell({ title, intro, children, inverse = false }: PageShellProps) {
  return (
    <main className={`min-h-screen ${inverse ? "bg-black text-white" : "bg-background text-black"}`}>
      <Navbar />
      <section className="px-4 pb-12 pt-32 md:px-8">
        <div className="mx-auto max-w-7xl border-b border-current/25 pb-10">
          <div className="mb-5 font-mono text-xs uppercase opacity-60">SentinelMail workspace</div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.55fr)] lg:items-end">
            <h1 className="font-serif text-5xl font-black uppercase leading-[0.92] sm:text-6xl md:text-7xl lg:text-8xl">
              {title}
            </h1>
            {intro ? (
              <p className="max-w-2xl font-mono text-sm leading-7 opacity-72 md:text-base">{intro}</p>
            ) : null}
          </div>
        </div>
      </section>
      {children}
      <Footer />
    </main>
  )
}
