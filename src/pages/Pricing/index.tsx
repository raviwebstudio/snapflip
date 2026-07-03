import { Check, CreditCard, Sparkles } from "lucide-react";

export default function Pricing() {
  const tiers = [
    {
      name: "Starter Hobby",
      price: "$0",
      period: "forever",
      description: "Ideal for beginners and visual artists starting out.",
      features: [
        "2 active digital flipbooks",
        "Up to 30 photos per album",
        "Standard page flip physics",
        "SnapFlip watermark on pages",
        "Public shared links only",
      ],
      highlighted: false,
      cta: "Current Plan",
    },
    {
      name: "Professional Photographer",
      price: "$24",
      period: "month",
      description: "Designed for full-time independent photographers and visual designers.",
      features: [
        "Unlimited active flipbooks",
        "Up to 250 photos per album",
        "Ultra-high resolution compression",
        "No watermarks",
        "Password protected private links",
        "Client favoriting & comments",
        "Basic viewer analytics",
      ],
      highlighted: true,
      cta: "Upgrade to Professional",
    },
    {
      name: "Premium Studio",
      price: "$49",
      period: "month",
      description: "Best for high-volume studios, digital agencies, and visual teams.",
      features: [
        "Everything in Professional",
        "Unlimited photos per album",
        "White-label custom domains",
        "Custom watermark uploads",
        "Advanced traffic analytics logs",
        "Priority VIP server rendering",
        "24/7 dedicated support",
      ],
      highlighted: false,
      cta: "Contact Sales",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-900 pb-6 text-center sm:text-left">
        <h1 className="text-xl font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 justify-center sm:justify-start">
          <CreditCard className="h-5 w-5 text-sky-400" />
          Subscription Plans
        </h1>
        <p className="text-xs text-slate-500 mt-1">Upgrade your photography showcase space. Change plans at any time.</p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl border p-6 flex flex-col justify-between shadow-2xl transition-all hover:scale-[1.01] ${
              tier.highlighted
                ? "border-sky-500/80 bg-gradient-to-br from-[#0B3037]/35 via-[#041215]/80 to-slate-950 shadow-sky-500/5"
                : "border-slate-900 bg-slate-950/60"
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-3.5 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-950 flex items-center gap-1 shadow-md">
                <Sparkles className="h-3 w-3" />
                Most Popular
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{tier.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{tier.description}</p>
              </div>

              <div className="flex items-baseline gap-1 text-white">
                <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                <span className="text-sm text-slate-400">/{tier.period}</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-400 border-t border-slate-900/60 pt-6">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                    <span className="leading-normal">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button
                disabled={tier.price === "$0"}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  tier.price === "$0"
                    ? "bg-slate-900 text-slate-500 cursor-default border border-slate-950"
                    : tier.highlighted
                    ? "bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-md"
                    : "border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
