import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function PricingPreview() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "For hobbyists and beginner photographers testing the waters.",
      features: [
        "Up to 3 active flipbooks",
        "Standard paper textures",
        "Ad-supported viewing pages",
        "Max file upload size 20MB",
        "Public links sharing only",
      ],
      ctaText: "Get Started For Free",
      ctaLink: "/create",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$19",
      period: "month",
      description: "For active creators sharing premium client deliverables.",
      features: [
        "Unlimited active flipbooks",
        "Custom branding & logos",
        "Completely ad-free showcase",
        "Max file upload size 100MB",
        "Password protection locks",
        "Serve under custom domain",
        "High-definition compression",
      ],
      ctaText: "Start 7-Day Free Trial",
      ctaLink: "/create",
      highlighted: true,
    },
    {
      name: "Studio Yearly",
      price: "$149",
      period: "year",
      description: "Best value for established photography studio businesses.",
      features: [
        "All Professional features",
        "Priority premium compression",
        "Dedicated VIP support agent",
        "Bulk upload & background queue",
        "Collaborative shared workspace",
        "Save 35% compared to monthly",
      ],
      ctaText: "Choose Yearly Studio Plan",
      ctaLink: "/create",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing-section" className="bg-slate-950 min-h-screen flex items-center py-24 sm:py-32 relative border-t border-slate-900/60">
      <div className="absolute top-0 right-10 h-[300px] w-[300px] rounded-full bg-sky-500/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-sky-400">Pricing</h2>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Choose your membership tier
          </p>
          <p className="text-base sm:text-lg text-slate-400">
            Transparent plans configured to suit independent freelancers and full-scale studios alike.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 flex flex-col justify-between shadow-2xl transition-all hover:scale-[1.01] ${
                tier.highlighted
                  ? "border-sky-500/80 bg-gradient-to-b from-[#0B3037]/30 to-slate-950 shadow-sky-500/5"
                  : "border-slate-900 bg-slate-950/60"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-950">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                  <span className="text-sm text-slate-400">/{tier.period}</span>
                </div>

                <div className="border-t border-slate-900 my-6" />

                <ul className="space-y-4">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  to={tier.ctaLink}
                  className={`inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? "bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-md shadow-sky-500/10"
                      : "border border-slate-800 bg-slate-900/40 text-slate-200 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
