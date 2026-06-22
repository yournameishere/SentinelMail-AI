"use client"

import { Menu, ShieldCheck, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Chat", href: "/chat" },
  { label: "Inbox", href: "/inbox" },
  { label: "Drafts", href: "/drafts" },
  { label: "Approvals", href: "/approvals" },
  { label: "Agents", href: "/agents" },
  { label: "Audit", href: "/audit" },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 border-b border-black/15 bg-background/95 pb-4 backdrop-blur-md">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[#FF4D00]">
            <ShieldCheck size={23} strokeWidth={2.5} />
          </span>
          <span className="truncate font-serif text-xl font-bold uppercase text-black md:text-2xl">
            SentinelMail AI
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 backdrop-blur-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-full px-3 py-2 font-mono text-[11px] uppercase transition-colors lg:px-4 ${
                pathname === item.href ? "bg-black text-[#FF4D00]" : "bg-transparent text-black/70 hover:bg-black hover:text-[#FF4D00]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/adk"
          className="hidden min-h-10 items-center rounded-full border border-black bg-black px-5 font-mono text-xs uppercase text-[#FF4D00] transition-colors hover:bg-[#FF4D00] hover:text-black md:inline-flex"
        >
          Terminal3 verified
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full bg-black p-3 text-[#FF4D00] md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="mx-auto mt-3 max-w-7xl border border-black bg-background p-3 shadow-[6px_6px_0_#000] md:hidden">
          <div className="grid gap-2">
            {[...navItems, { label: "Terminal3", href: "/adk" }].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border border-black px-4 py-3 font-mono text-sm uppercase transition-colors ${
                  pathname === item.href ? "bg-black text-[#FF4D00]" : "bg-transparent text-black"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  )
}
