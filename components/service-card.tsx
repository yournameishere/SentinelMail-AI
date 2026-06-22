"use client"

import { ArrowUpRight } from "lucide-react"

interface ServiceCardProps {
  number: string
  title: string
  tags: string[]
}

export function ServiceCard({ number, title, tags }: ServiceCardProps) {
  return (
    <div className="group border-t border-white/20 py-12 hover:bg-white/5 transition-colors duration-500 cursor-pointer">
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="font-mono text-[#FF4D00] text-xl">({number})</div>
        <div className="flex-1">
          <h3 className="font-serif text-6xl md:text-8xl font-bold uppercase text-white mb-4 group-hover:translate-x-4 transition-transform duration-300">
            {title}
          </h3>
          <div className="flex gap-4 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 border border-white/30 rounded-full text-white/60 font-mono text-sm uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="md:self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:rotate-45">
          <ArrowUpRight className="w-20 h-20 text-[#FF4D00]" />
        </div>
      </div>
    </div>
  )
}
