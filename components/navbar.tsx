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
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-[#FF4D00]">
            <ShieldCheck size={23} strokeWidth={2.5} />
          </span>
          <span className="rounded-full bg-black px-3 py-2 font-serif text-xl font-bold uppercase tracking-tighter text-white md:text-2xl">
            SentinelMail AI
          </span>
        </Link>

        <div className="hidden items-center gap-2 bg-black/90 p-2 rounded-full backdrop-blur-sm border border-white/10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-full px-3 py-2 font-mono text-xs uppercase transition-colors lg:px-4 ${
                pathname === item.href
                  ? "bg-white text-black"
                  : "bg-transparent text-white hover:bg-white hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/adk"
          className="hidden rounded-full border border-black bg-black px-5 py-3 font-mono text-xs uppercase text-white transition-colors hover:bg-white hover:text-black md:inline-flex"
        >
          Terminal3 verified
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="p-3 bg-black text-white rounded-full md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="mt-4 border-2 border-black bg-background p-3 md:hidden">
          <div className="grid gap-2">
            {[...navItems, { label: "Terminal3", href: "/adk" }].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-2 border-black px-4 py-3 font-mono text-sm uppercase ${
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
