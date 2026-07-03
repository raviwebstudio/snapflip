import { Camera, Eye, Heart, Palette, Wind } from "lucide-react";

export default function TrustedBy() {
  const studios = [
    { name: "AURA STUDIOS", icon: Camera },
    { name: "LUMEN GALLERY", icon: Eye },
    { name: "VERTEX PHOTO", icon: Palette },
    { name: "ZENITH CAPTURES", icon: Wind },
    { name: "HORIZON LABS", icon: Heart },
  ];

  return (
    <section className="bg-slate-950 flex items-center border-y border-slate-900/60 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8">
          Trusted by elite photographers and digital agencies worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-45 grayscale contrast-200">
          {studios.map((studio) => {
            const Icon = studio.icon;
            return (
              <div key={studio.name} className="flex items-center gap-2 text-slate-400 font-semibold tracking-widest text-sm sm:text-base">
                <Icon className="h-4 w-4 text-sky-400" />
                <span>{studio.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
