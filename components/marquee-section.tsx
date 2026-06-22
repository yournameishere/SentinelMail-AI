import { FileSignature, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react"

const proofs = [
  { label: "Agent DID", value: "Scoped identity", icon: KeyRound },
  { label: "Policy", value: "Capability checks", icon: ShieldCheck },
  { label: "Approval", value: "Human gate", icon: LockKeyhole },
  { label: "Ledger", value: "Signed trail", icon: FileSignature },
]

export function MarqueeSection() {
  return (
    <section className="border-y border-black bg-[#fffdf7] px-4 py-6 text-black md:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
        {proofs.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-3 border-black/20 py-3 md:border-r md:last:border-r-0">
              <Icon className="h-5 w-5 text-[#FF4D00]" />
              <div>
                <div className="font-mono text-xs uppercase text-black/55">{item.label}</div>
                <div className="font-mono text-sm uppercase">{item.value}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
