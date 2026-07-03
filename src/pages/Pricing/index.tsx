import { useState } from "react";
import { Check, CreditCard, Sparkles, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { useToastStore } from "../../store";

export default function Pricing() {
  const { addToast } = useToastStore();
  const [activeModal, setActiveModal] = useState<"upgrade" | "contact" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upgrade modal state
  const [paymentData, setPaymentData] = useState({
    cardName: "John Doe",
    cardNumber: "•••• •••• •••• 4242",
    expiry: "12/28",
    cvv: "•••"
  });

  // Contact sales state
  const [salesData, setSalesData] = useState({
    name: "John Doe",
    email: "john@aurastudios.com",
    studio: "Aura Studios",
    requirements: "Need custom domains, 10 team seats, and white-label client views."
  });

  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate payment authorization latency
    setTimeout(() => {
      setIsSubmitting(false);
      setActiveModal(null);
      addToast("Successfully upgraded to Professional Photographer Plan!", "success");
      
      // Update account state in settings mock cache
      localStorage.setItem("snapflip_settings_profile", JSON.stringify({
        fullName: "John Doe",
        email: "john@aurastudios.com",
        phone: "+1 (555) 234-5678",
        tier: "Professional"
      }));
    }, 2000);
  };

  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate CRM submission latency
    setTimeout(() => {
      setIsSubmitting(false);
      setActiveModal(null);
      addToast("Sales enquiry submitted. A solutions agent will contact you in 24 hours.", "success");
    }, 1500);
  };

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
      action: () => {}
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
      action: () => setActiveModal("upgrade")
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
      action: () => setActiveModal("contact")
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Modal Layer */}
      {/* Upgrade Simulation Modal */}
      {activeModal === "upgrade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleUpgradeSubmit}
            className="rounded-3xl border border-slate-900 bg-slate-950 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-sky-500/5 blur-[55px] pointer-events-none" />
            <div className="flex items-center gap-2 text-sky-400 font-mono text-[10px] uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              Secure Payment Gateway
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Upgrade Subscription</h3>
              <p className="text-xs text-slate-400">
                You are subscribing to the <span className="text-sky-400 font-semibold">Professional Plan ($24/month)</span>.
              </p>
            </div>

            {/* Simulated Card input details */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-900 bg-slate-900 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Card Number</label>
                <input
                  type="text"
                  required
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-900 bg-slate-900 text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Expiry Date</label>
                  <input
                    type="text"
                    required
                    value={paymentData.expiry}
                    onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-900 bg-slate-900 text-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">CVV</label>
                  <input
                    type="text"
                    required
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-900 bg-slate-900 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Authorizing..." : "Confirm Payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contact Sales Form Modal */}
      {activeModal === "contact" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSalesSubmit}
            className="rounded-3xl border border-slate-900 bg-slate-950 p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-sky-500/5 blur-[55px] pointer-events-none" />
            <div className="flex items-center gap-2 text-sky-400 font-mono text-[10px] uppercase tracking-wider">
              <Mail className="h-4 w-4" />
              Request Custom Enterprise Plan
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Contact Enterprise Sales</h3>
              <p className="text-xs text-slate-400">
                Submit your custom branding or team volume requirements below.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={salesData.name}
                    onChange={(e) => setSalesData({ ...salesData, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-900 bg-slate-900 text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Work Email</label>
                  <input
                    type="email"
                    required
                    value={salesData.email}
                    onChange={(e) => setSalesData({ ...salesData, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-900 bg-slate-900 text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Studio / Agency Name</label>
                <input
                  type="text"
                  required
                  value={salesData.studio}
                  onChange={(e) => setSalesData({ ...salesData, studio: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-900 bg-slate-900 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Requirements</label>
                <textarea
                  rows={3}
                  required
                  value={salesData.requirements}
                  onChange={(e) => setSalesData({ ...salesData, requirements: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-900 bg-slate-900 text-slate-200 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Submit Inquiry"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

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
                onClick={tier.action}
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
