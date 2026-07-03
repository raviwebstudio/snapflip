import { Sliders, HelpCircle, Palette, Music, Lock, Unlock } from "lucide-react";

interface StepSettingsProps {
  data: {
    title: string;
    description: string;
    theme: string;
    music: string;
    visibility: "Public" | "Private";
    passcode: string;
    watermark: boolean;
    allowDownload: boolean;
  };
  onChange: (fields: Partial<StepSettingsProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepSettings({ data, onChange, onNext, onBack }: StepSettingsProps) {
  const themes = [
    { id: "dark", name: "Classic Dark", class: "bg-slate-950 border-slate-800" },
    { id: "light", name: "Fine Art Light", class: "bg-slate-100 text-slate-900 border-slate-300" },
    { id: "teal", name: "Deep Teal", class: "bg-[#0b3037] border-emerald-950/40 text-slate-100" },
    { id: "purple", name: "Luxury Purple", class: "bg-purple-950/80 border-purple-900 text-slate-100" },
  ];

  const handleVisibilityChange = (type: "Public" | "Private") => {
    onChange({ visibility: type });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-2 text-center sm:text-left">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
          <Sliders className="h-5 w-5 text-sky-400" />
          Album Settings
        </h2>
        <p className="text-xs text-slate-500">Configure visual themes, security parameters, and options.</p>
      </div>

      <div className="space-y-6">
        {/* Album Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Custom Album Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Album Description</label>
          <textarea
            rows={3}
            placeholder="Introduce this portfolio layout to clients..."
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full p-4 rounded-xl border border-slate-900 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
          />
        </div>

        {/* Theme Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Palette className="h-4 w-4 text-sky-400" />
            Theme Selection
          </label>
          <div className="grid grid-cols-2 gap-4">
            {themes.map((theme) => (
              <button
                type="button"
                key={theme.id}
                onClick={() => onChange({ theme: theme.id })}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.01] ${
                  data.theme === theme.id
                    ? "border-sky-500 ring-2 ring-sky-500/10 shadow-lg"
                    : "border-slate-900 hover:border-slate-800"
                } ${theme.class}`}
              >
                <span className="text-xs font-bold">{theme.name}</span>
                {data.theme === theme.id && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-sky-400 mt-2 block">Active</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Music Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Music className="h-4 w-4 text-sky-400" />
            Background Music (Mock)
          </label>
          <select
            value={data.music}
            onChange={(e) => onChange({ music: e.target.value })}
            className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 transition-colors"
          >
            <option value="none">None</option>
            <option value="acoustic-guitar">Acoustic Guitar Melodies</option>
            <option value="piano-solo">Piano Solo - Fine Art</option>
            <option value="cinematic-ambient">Cinematic Ambient Pad</option>
            <option value="jazz-lullaby">Jazz Lullaby Collection</option>
          </select>
        </div>

        {/* Visibility */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-sky-400" />
            Visibility & Security
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleVisibilityChange("Public")}
              className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                data.visibility === "Public"
                  ? "border-sky-500 bg-[#0B3037]/15 text-slate-200"
                  : "border-slate-900 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              <Unlock className="h-4 w-4" />
              <span className="text-xs font-semibold">Public Link</span>
            </button>
            <button
              type="button"
              onClick={() => handleVisibilityChange("Private")}
              className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                data.visibility === "Private"
                  ? "border-sky-500 bg-[#0B3037]/15 text-slate-200"
                  : "border-slate-900 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="h-4 w-4" />
              <span className="text-xs font-semibold">Password Protected</span>
            </button>
          </div>

          {data.visibility === "Private" && (
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Passcode</label>
              <input
                type="password"
                placeholder="Enter passcode..."
                value={data.passcode}
                onChange={(e) => onChange({ passcode: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Toggles (Watermark / Downloads) */}
        <div className="space-y-4 border-t border-slate-900 pt-6">
          {/* Watermark Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
                Apply Brand Watermark
                <span title="Apply a subtle copyright overlay to prevent screenshot theft">
                  <HelpCircle className="h-3 w-3 text-slate-500" />
                </span>
              </h4>
              <p className="text-[10px] text-slate-500">Overlay copyright watermark text on photo items.</p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ watermark: !data.watermark })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                data.watermark ? "bg-sky-500" : "bg-slate-900"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  data.watermark ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Download Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
                Allow Client Downloads
                <span title="Allow clients to download high-res files from viewer">
                  <HelpCircle className="h-3 w-3 text-slate-500" />
                </span>
              </h4>
              <p className="text-[10px] text-slate-500">Allow clients to download original source image files.</p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ allowDownload: !data.allowDownload })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                data.allowDownload ? "bg-sky-500" : "bg-slate-900"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  data.allowDownload ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation action buttons */}
      <div className="pt-6 flex justify-between border-t border-slate-900">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
        >
          Next: Review Summary
        </button>
      </div>
    </div>
  );
}
