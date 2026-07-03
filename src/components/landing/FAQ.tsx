import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What formats can I upload to SnapFlip?",
      answer: "You can upload high-resolution JPG, PNG, and WebP images, or upload a direct PDF file. Our compression algorithm handles files efficiently to maintain maximum clarity while optimizing loading speeds.",
    },
    {
      question: "Can I custom-brand my client delivery links?",
      answer: "Yes, our Professional and Studio plans allow you to remove all SnapFlip branding, configure custom domain URLs (e.g. albums.yourstudio.com), upload custom logos, and style color schemes.",
    },
    {
      question: "Is there support for password-protecting albums?",
      answer: "Absolutely. You can secure any album with password locking. Clients will be requested to input the corresponding password before they can access and view the pages.",
    },
    {
      question: "Are there image limits per album?",
      answer: "Free plan accounts support up to 25 pages per flipbook. Professional and Studio plan tiers allow unlimited pages up to the maximum upload file sizes (100MB+).",
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-slate-950 py-24 relative border-t border-slate-900/60">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-sky-400">Questions</h2>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden transition-colors hover:border-[#0B3037]/50"
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between p-6 text-left text-slate-200 hover:text-white transition-colors focus:outline-none"
                >
                  <span className="font-semibold text-sm sm:text-base">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-sky-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-slate-900/50 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
