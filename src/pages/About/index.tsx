import { Link } from "react-router-dom";
import { Camera, Heart, Shield, Award, ChevronRight } from "lucide-react";

export default function About() {
  const values = [
    {
      title: "Tactile Fidelity",
      desc: "We believe digital presentation should never lose the physical gravity, page weight, and soul of printed media.",
      icon: Heart
    },
    {
      title: "Privacy First",
      desc: "Photographers entrust us with once-in-a-lifetime events. We safeguard client collections with rigorous passcode encryption.",
      icon: Shield
    },
    {
      title: "Creative Control",
      desc: "Zero cookie-cutter layouts. Custom branding, studio logos, and color palettes belong entirely to the artist.",
      icon: Award
    }
  ];

  const milestones = [
    { year: "2024", title: "The Concept", desc: "SnapFlip is born in a small studio to eliminate clunky, plain PDF and gallery deliveries for wedding couples." },
    { year: "2025", title: "Studio Adoption", desc: "Over 500 boutique digital studios replace traditional web links with physical-feel interactive books." },
    { year: "2026", title: "v1 MVP Launch", desc: "Release of our current high-speed Cloudinary-powered layout creation tool for studios worldwide." }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative py-24 sm:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-slate-900/60">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-[#0B3037]/20 blur-[130px] pointer-events-none" />
        <div className="space-y-6 max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold tracking-widest uppercase text-sky-400 border border-sky-500/20 animate-pulse">
            Our Legacy
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Elevating digital <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-[#0B3037]/20 bg-clip-text text-transparent">storytelling</span> for creators
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            SnapFlip bridges the gap between digital convenience and the tactile romance of physical photography albums.
          </p>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-b border-slate-900/60">
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400 font-mono">Our Story</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Born out of frustration. Built for the artist.</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            As event photographers, we realized that while capturing moments felt magical, delivering them was sterile. Sending clients a dry grid of thumbnail links or download zip folders stripped the romance out of their memories.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            We wanted client presentations to feel like handing over a heavy, hand-stitched leather album. Thus, SnapFlip was created—bringing pages to life with weight, sound, depth, and premium dark-mode showcase framing.
          </p>
        </div>
        <div className="relative group rounded-2xl border border-slate-900 bg-slate-950 p-6 shadow-2xl shadow-sky-500/5 overflow-hidden min-h-[300px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-sky-500/5 blur-[60px] pointer-events-none" />
          <div className="space-y-4 relative z-10 text-center md:text-left">
            <Camera className="h-10 w-10 text-sky-400 mx-auto md:mx-0" />
            <h4 className="text-lg font-bold text-slate-100">Boutique Presentation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every transition, paper shadow, and page-flip curve is fine-tuned to deliver an emotional experience that makes clients gasp.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Why SnapFlip Section */}
      <section className="py-20 bg-slate-950/45 border-b border-slate-900/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400 font-mono">Why SnapFlip</h2>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Why boutique studios choose us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-4 hover:border-sky-500/40 hover:-translate-y-1 transition-all duration-300 group shadow-lg">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{v.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Our Legacy & Founder Message Section */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12 items-center border-b border-slate-900/60">
        <div className="md:col-span-5 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400 font-mono">Founder Message</h2>
          <blockquote className="border-l-2 border-sky-400 pl-4 italic text-slate-300 text-sm leading-relaxed">
            "Your clients aren't buying files. They are buying how those files make them feel. SnapFlip is built to treat pixels like paper."
          </blockquote>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-100">David Aura</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Founder, Aura Studios</p>
          </div>
        </div>
        <div className="md:col-span-7 space-y-6">
          <h3 className="text-2xl font-extrabold text-white">Our Legacy</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Founded by a collaborative network of visual designers and software engineers, SnapFlip has grown to serve boutique creative professionals globally. We reject bulk, corporate presentation layouts in favor of curated digital showcases that respect the photography medium.
          </p>
        </div>
      </section>

      {/* 5. Timeline Section */}
      <section className="py-20 bg-slate-950/45 border-b border-slate-900/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400 font-mono">Milestone Timeline</h2>
            <p className="text-2xl font-bold text-white">The journey so far</p>
          </div>

          <div className="relative border-l border-slate-900 pl-6 space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className="relative space-y-2">
                {/* Timeline node dot */}
                <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border border-sky-500 bg-slate-950 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-400 font-mono">{m.year}</span>
                  <span className="text-xs font-bold text-slate-200">— {m.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Numbers Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-900/60">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">5M+</span>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Pages Flipped</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">10k+</span>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Active Studios</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">99.9%</span>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Server Uptime</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-400">&lt;100ms</span>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Image Render Latency</p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Section */}
      <section className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0B3037]/15 to-slate-950 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Join the Photography Presentation Revolution</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Ditch flat grids. Give your high-resolution client collections the luxury physical-feel delivery they deserve.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition-all hover:scale-102 cursor-pointer shadow-lg shadow-sky-500/10"
            >
              Get Started For Free
              <ChevronRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
