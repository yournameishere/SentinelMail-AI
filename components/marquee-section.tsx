"use client"

import { Marquee } from "./marquee"

export function MarqueeSection() {
  return (
    <section className="bg-black text-[#FF4D00] py-20 overflow-hidden -skew-y-2 origin-left">
      <Marquee text="AGENT IDENTITY • APPROVALS • SIGNED ACTIONS •" direction={1} className="opacity-80" />
      <Marquee text="INBOX • REPLY • SEND • AUDIT • TERMINAL3 •" direction={-1} className="text-white opacity-90" />
    </section>
  )
}
