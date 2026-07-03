import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="bg-slate-950 py-24 sm:py-32 relative border-t border-slate-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b3037] via-[#041215] to-slate-950 px-8 py-16 sm:px-16 sm:py-24 border border-[#0b3037]/50 shadow-2xl text-center">
          {/* Subtle light orb */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-sky-500/10 blur-[80px]" />
          
          <div className="relative mx-auto max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/5 px-4 py-1 text-xs text-sky-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Elevate Your Portfolio Showcase</span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to redefine your presentation?
            </h2>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto">
              Join thousands of fine-art, wedding, and architectural photographers delivering premium digital flipbooks to their clients.
            </p>

            <div className="pt-6">
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg hover:bg-sky-400 transition-all hover:scale-[1.02]"
              >
                Create Your First Album Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
