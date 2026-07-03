import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 min-h-screen flex items-center py-20">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#0B3037]/25 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0B3037]/60 bg-gradient-to-r from-[#0B3037]/45 to-slate-950 px-4 py-1.5 text-xs sm:text-sm text-slate-300">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span>Introducing SnapFlip v1.0</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Stunning digital <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-[#0B3037]/20 bg-clip-text text-transparent">flipbooks</span> for photographers
            </h1>

            {/* Description */}
            <p className="mx-auto lg:mx-0 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
              Transform your high-resolution photography portfolios into interactive, physical-feel digital flipbooks. Share elegant private links with clients and showcase your creative vision in luxury.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-base font-semibold text-slate-950 shadow-lg hover:bg-sky-400 transition-all hover:scale-[1.02]"
              >
                Get Started For Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/playground"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition-all"
              >
                <BookOpen className="h-5 w-5 text-sky-400" />
                Explore Playground
              </Link>
            </div>
          </div>

          {/* Album Mockup Column */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[400px] aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 border border-slate-800/80 shadow-2xl shadow-sky-500/5">
              {/* Top border light */}
              <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
              
              {/* CSS 3D Album Cover Mockup */}
              <div className="relative h-full w-full rounded-xl bg-[#091b1f] border border-slate-800/60 p-6 shadow-inner flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                
                {/* Book Spine shadow */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-slate-950/80 to-transparent" />
                
                <div className="space-y-4">
                  <div className="h-1.5 w-12 rounded-full bg-sky-400/80" />
                  <h3 className="text-xl font-bold text-slate-100 tracking-wide font-serif">AURA STUDIOS</h3>
                  <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Portfolio Collection</p>
                </div>
                
                {/* Photo mockups inside the cover layout */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="aspect-square rounded-lg bg-slate-900 border border-slate-800/80 overflow-hidden relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 to-transparent" />
                    <span className="text-[10px] text-slate-500 tracking-wider">Landscape</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-slate-900 border border-slate-800/80 overflow-hidden relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B3037]/20 to-transparent" />
                    <span className="text-[10px] text-slate-500 tracking-wider">Portrait</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Est. 2026</span>
                  <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest">Click to Flip</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
