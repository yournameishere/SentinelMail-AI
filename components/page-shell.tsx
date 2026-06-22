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
      <section className="px-4 pb-10 pt-32 md:px-8">
        <h1 className="font-serif text-[13vw] leading-[0.84] uppercase tracking-tighter md:text-[8vw]">{title}</h1>
        {intro ? <p className="mt-8 max-w-3xl font-mono text-sm leading-relaxed md:text-base">{intro}</p> : null}
      </section>
      {children}
      <Footer />
    </main>
  )
}
