import { UploadCloud, SlidersHorizontal, BookOpen, Share2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Upload Portfolio",
      description: "Import your raw high-resolution images or PDF collections in seconds.",
      icon: UploadCloud,
    },
    {
      step: "02",
      title: "Customize Aesthetic",
      description: "Tweak layouts, paper textures, background colors, and custom domains.",
      icon: SlidersHorizontal,
    },
    {
      step: "03",
      title: "Publish Book",
      description: "Generate high-fidelity, touch-responsive 3D flipbook links instantly.",
      icon: BookOpen,
    },
    {
      step: "04",
      title: "Share Collections",
      description: "Distribute secure links to clients or embed portfolios in your site.",
      icon: Share2,
    },
  ];

  return (
    <section className="bg-slate-950 min-h-screen flex items-center py-24 sm:py-32 relative border-t border-slate-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-sky-400">Process</h2>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Seamlessly build and publish
          </p>
          <p className="text-base sm:text-lg text-slate-400">
            From raw captures to luxury client showcases in four simple steps.
          </p>
        </div>

        {/* Steps Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-[45px] left-12 right-12 h-[1px] bg-gradient-to-r from-sky-500/10 via-[#0B3037]/45 to-sky-500/10 z-0" />

          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.step} className="relative z-10 space-y-6 text-center md:text-left">
                {/* Step Circle */}
                <div className="mx-auto md:mx-0 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-sky-400 relative">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-[#0B3037] text-sky-300 px-1.5 py-0.5 rounded-full border border-sky-400/25">
                    {st.step}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-100">{st.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto md:mx-0">
                    {st.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
