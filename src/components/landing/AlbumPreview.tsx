import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export default function AlbumPreview() {
  return (
    <section className="bg-slate-950 min-h-screen flex items-center py-24 sm:py-32 relative border-t border-slate-900/60 overflow-hidden">
      {/* Background accent light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[800px] rounded-full bg-[#0B3037]/15 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-sky-400">Interactive Preview</h2>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            A visual experience like no other
          </p>
          <p className="text-base sm:text-lg text-slate-400">
            Showcase your captures across a physical-style tactile interface that clients will love to explore.
          </p>
        </div>

        {/* Static Flipbook Mockup */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-900 bg-slate-950/80 backdrop-blur p-4 sm:p-6 lg:p-8 shadow-2xl shadow-sky-500/5">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Client View: Collection v1</span>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Open Book Display */}
          <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-xl border border-slate-900 shadow-inner flex overflow-hidden">
            {/* Left Page */}
            <div className="flex-1 bg-[#050e10] p-6 sm:p-8 relative border-r border-slate-950/40 flex flex-col justify-between">
              {/* Paper overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
              
              {/* Image Frame */}
              <div className="flex-1 rounded-lg bg-slate-900 border border-slate-850/80 shadow-md relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Left Page Image</span>
              </div>
              <div className="pt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                <span>Fine Art</span>
                <span>Page 02</span>
              </div>
            </div>

            {/* Book Spine crease shadow */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 z-10" />

            {/* Right Page */}
            <div className="flex-1 bg-[#050e10] p-6 sm:p-8 relative flex flex-col justify-between">
              {/* Paper overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent pointer-events-none" />

              {/* Image Frame */}
              <div className="flex-1 rounded-lg bg-slate-900 border border-slate-850/80 shadow-md relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Right Page Image</span>
              </div>
              <div className="pt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                <span>Page 03</span>
                <span>Portrait</span>
              </div>
            </div>
          </div>

          {/* Bottom Flipbook Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-850 bg-slate-900 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-mono text-slate-400">02 / 12</span>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-850 bg-slate-900 text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
