import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const shouldLoadAnalytics = process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true"

const _geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})
const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "SentinelMail AI | Trusted AI Email Agent",
  description:
    "A Terminal3 ADK powered AI email secretary with agent identities, scoped permissions, approval gates, signed actions, and audit logs.",
  applicationName: "SentinelMail AI",
  generator: "SentinelMail AI",
  keywords: ["Terminal3", "Agent Auth SDK", "AI email agent", "approval workflow", "audit trail"],
  authors: [{ name: "SentinelMail AI" }],
  metadataBase: new URL("https://frontend-n2azp871l-nikkus-projects-d0d225f5.vercel.app"),
  openGraph: {
    title: "SentinelMail AI",
    description:
      "Trusted multi-agent email automation with Terminal3 identities, approvals, SDK-signed actions, and audit logs.",
    type: "website",
    siteName: "SentinelMail AI",
  },
  twitter: {
    card: "summary",
    title: "SentinelMail AI",
    description:
      "Trusted multi-agent email automation with Terminal3 identities, approvals, SDK-signed actions, and audit logs.",
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_geistMono.variable} ${_playfair.variable}`}>
      <body className="font-mono antialiased">
        {children}
        {shouldLoadAnalytics ? <Analytics /> : null}
      </body>
    </html>
  )
}
