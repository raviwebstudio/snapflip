import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Globe } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studio: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in Name, Email, and Message fields.");
      return;
    }
    setIsSubmitting(true);

    // Mock API submission latency
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        studio: "",
        message: ""
      });

      // Clear toast after 4 seconds
      setTimeout(() => setShowToast(false), 4000);
    }, 1500);
  };

  const cards = [
    { title: "Direct Email", value: "support@snapflip.co", desc: "For licensing, API requests, and business partnerships.", icon: Mail },
    { title: "Call Center", value: "+1 (555) 303-9000", desc: "Available Mon-Fri, 9am - 6pm EST for critical issues.", icon: Phone },
    { title: "Office HQ", value: "82 Sovereign St, Suite 400", desc: "San Francisco, CA 94107", icon: MapPin }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen relative overflow-hidden py-16 sm:py-24">
      {/* Toast Notification Box */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-sky-500/20 bg-slate-950 p-4 shadow-2xl shadow-sky-500/15 animate-slide-in">
          <div className="h-7 w-7 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-slate-200 block">Message Sent Successfully!</span>
            <span className="text-[10px] text-slate-500 block">Our support team will contact you shortly.</span>
          </div>
        </div>
      )}

      {/* Decorative Glow Elements */}
      <div className="absolute top-[10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-[#0B3037]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold tracking-widest uppercase text-sky-400 border border-sky-500/20">
            Contact
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Get in touch with <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-[#0B3037]/20 bg-clip-text text-transparent">SnapFlip</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Have questions about studio custom branding, API limits, or bulk plans? Send us a message and we'll reply shortly.
          </p>
        </div>

        {/* Split Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact cards and details (5/12 width) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-900 pb-3 font-mono">
              Contact Channels
            </h3>

            {cards.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-900 bg-slate-950 p-5 flex gap-4 hover:border-sky-500/35 transition-all duration-300 group shadow-md"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#0B3037]/15 text-sky-400 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">{c.title}</h4>
                    <span className="text-sm font-semibold text-slate-100 block">{c.value}</span>
                    <p className="text-[11px] text-slate-500 leading-normal">{c.desc}</p>
                  </div>
                </div>
              );
            })}

            {/* Social Grid Glow block */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-6 space-y-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">World Grid Connection</span>
              <div className="h-28 rounded-xl border border-slate-900 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#091316_1px,transparent_1px),linear-gradient(to_bottom,#091316_1px,transparent_1px)] bg-[size:14px_14px] opacity-60" />
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Globe className="h-6 w-6 text-sky-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">SF Gateway Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphic Contact Form (7/12 width) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-900 bg-slate-950/80 p-6 sm:p-8 shadow-2xl relative">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-sky-500/5 blur-[50px] pointer-events-none" />

              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-900/60 pb-3 mb-6 flex items-center gap-2">
                <Send className="h-4 w-4 text-sky-400" />
                Send Studio Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/55 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@yourstudio.com"
                      className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/55 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 000-0000"
                      className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/55 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Studio / Business Name</label>
                    <input
                      type="text"
                      value={formData.studio}
                      onChange={(e) => setFormData({ ...formData, studio: e.target.value })}
                      placeholder="e.g. Aura Studios"
                      className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/55 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your studio requirements or questions..."
                    className="w-full p-4 rounded-xl border border-slate-900 bg-slate-950/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/55 transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-sky-500/10"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Map Mock Placeholder */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Studio Location Index</span>
            <span className="text-[9px] font-mono text-slate-600">37.7749° N, 122.4194° W</span>
          </div>
          <div className="h-44 rounded-xl border border-slate-900 bg-slate-950 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[#091518]/20" />
            <div className="absolute inset-0 bg-[radial-gradient(#112c32_1px,transparent_1px)] [background-size:16px_16px] opacity-75" />
            <div className="relative z-10 text-center space-y-2">
              <div className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/25">
                <MapPin className="h-4 w-4 animate-bounce" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">San Francisco HQ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
