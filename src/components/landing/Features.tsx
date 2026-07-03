import { Image, Sliders, RefreshCw, ShieldCheck, Globe, MessageSquare } from "lucide-react";

export default function Features() {
  const featuresList = [
    {
      title: "Ultra-High Resolution",
      description: "Lossless compression keeps your images tack-sharp while guaranteeing blazing-fast loading speeds on mobile and desktop.",
      icon: Image,
    },
    {
      title: "Customizable Layouts",
      description: "Tailor the page layout, background colors, typography, margins, and paper textures to match your branding theme.",
      icon: Sliders,
    },
    {
      title: "Interactive Flip Physics",
      description: "A premium physical-feel book layout with page turns that respond to swipes, click-drags, or keyboard controls.",
      icon: RefreshCw,
    },
    {
      title: "Privacy Controls",
      description: "Protect client deliverables with password locks, restricted access links, or set expiration dates on flipbook viewing.",
      icon: ShieldCheck,
    },
    {
      title: "Custom Domains",
      description: "Serve your flipbooks under your own domain or subdomain (e.g. books.yourname.com) for a complete white-label solution.",
      icon: Globe,
    },
    {
      title: "Client Feedback",
      description: "Allow clients to leave comments, select favorites, or request prints directly inside the flipbook viewer.",
      icon: MessageSquare,
    },
  ];

  return (
    <section className="bg-slate-950 py-24 sm:py-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#0B3037]/10 blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-sky-400">Core Capabilities</h2>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Designed for premium visual storytelling
          </p>
          <p className="text-base sm:text-lg text-slate-400">
            Built for high-end photography portfolios, elegant client deliverables, and luxury digital art collections.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative rounded-2xl border border-slate-900 bg-slate-950 p-8 shadow-xl transition-all hover:border-[#0B3037]/60 hover:shadow-sky-500/5 hover:translate-y-[-2px]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0B3037]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative space-y-6">
                  {/* Icon */}
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sky-400 group-hover:text-white group-hover:bg-sky-500/10 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
