import { useState, useRef } from "react";
import { User, Camera, Palette, Bell, HardDrive, ShieldCheck, Check } from "lucide-react";

export default function Settings() {
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john@aurastudios.com",
    phone: "+1 (555) 234-5678",
  });

  const [brand, setBrand] = useState({
    studioName: "Aura Studios",
  });

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    viewAlerts: true,
    weeklyRecap: false,
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const isLight =
      newTheme === "light" ||
      (newTheme === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isLight) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Toast Saved Notification */}
      {isSaved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-sky-500/20 bg-slate-950 p-4 shadow-2xl shadow-sky-500/10">
          <div className="h-6 w-6 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Check className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Settings saved successfully</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-slate-900 pb-6">
        <h1 className="text-xl font-bold text-slate-100 uppercase tracking-widest">Workspace Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage photographer profile, branding logos, notifications, and subscription tiers.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Information */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-lg">
          <div className="flex items-center gap-2 text-slate-200 border-b border-slate-900/60 pb-3">
            <User className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Profile Information</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Avatar Mockup */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#0B3037] to-sky-500 flex items-center justify-center text-xl font-bold text-white uppercase border border-slate-900">
                  JD
                </div>
                <button
                  type="button"
                  className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                  title="Profile upload coming in Phase 4"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <span className="text-[8px] font-mono text-slate-600 mt-2 block">(Profile upload coming in Phase 4)</span>
            </div>

            {/* Inputs */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Settings */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-lg">
          <div className="flex items-center gap-2 text-slate-200 border-b border-slate-900/60 pb-3">
            <Camera className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Brand Settings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Studio / Business Name</label>
              <input
                type="text"
                value={brand.studioName}
                onChange={(e) => setBrand({ ...brand, studioName: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Studio Logo</label>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoChange}
                className="hidden"
                accept="image/*"
              />
              <div
                onClick={() => logoInputRef.current?.click()}
                className="border border-dashed border-slate-800 hover:border-sky-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950/40 transition-all flex items-center justify-center gap-4 min-h-[64px]"
              >
                {logoPreview ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-10 w-10 rounded border border-slate-800 bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={logoPreview} alt="Studio Logo Preview" className="h-full w-full object-contain" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-sky-400 font-bold block">Logo loaded</span>
                      <span className="text-[9px] text-slate-500 block">Click to replace logo</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-slate-400 block">Click to select studio logo</span>
                    <p className="text-[9px] text-slate-500 mt-1">PNG with transparent background preferred.</p>
                  </div>
                )}
              </div>
              <p className="text-[8px] font-mono text-slate-600 mt-1">(Logo preview is local only. Cloud storage coming in Phase 4)</p>
            </div>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-lg">
          <div className="flex items-center gap-2 text-slate-200 border-b border-slate-900/60 pb-3">
            <Palette className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Theme Preferences</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {["light", "dark", "system"].map((themeId) => (
              <button
                type="button"
                key={themeId}
                onClick={() => handleThemeChange(themeId)}
                className={`py-3 px-4 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  theme === themeId
                    ? "border-sky-500 bg-[#0B3037]/15 text-sky-400"
                    : "border-slate-900 bg-slate-950 text-slate-500 hover:text-slate-300"
                }`}
              >
                {themeId}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-lg">
          <div className="flex items-center gap-2 text-slate-200 border-b border-slate-900/60 pb-3">
            <Bell className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            {/* Email Toggles */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  Email Alerts
                  <span className="text-sky-400 font-mono italic text-[9px] font-normal">(Coming in Phase 4)</span>
                </h4>
                <p className="text-[10px] text-slate-500">Receive email notification updates regarding account changes.</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.emailAlerts ? "bg-sky-500" : "bg-slate-900"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.emailAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  Client View Alerts
                  <span className="text-sky-400 font-mono italic text-[9px] font-normal">(Coming in Phase 4)</span>
                </h4>
                <p className="text-[10px] text-slate-500">Receive notifications when a client opens one of your digital flipbooks.</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications({ ...notifications, viewAlerts: !notifications.viewAlerts })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.viewAlerts ? "bg-sky-500" : "bg-slate-900"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.viewAlerts ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  Weekly Analytics Recap
                  <span className="text-sky-400 font-mono italic text-[9px] font-normal">(Coming in Phase 4)</span>
                </h4>
                <p className="text-[10px] text-slate-500">Receive weekly summaries of album view metrics directly in your email.</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications({ ...notifications, weeklyRecap: !notifications.weeklyRecap })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications.weeklyRecap ? "bg-sky-500" : "bg-slate-900"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.weeklyRecap ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Storage Information */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-lg">
          <div className="flex items-center gap-2 text-slate-200 border-b border-slate-900/60 pb-3">
            <HardDrive className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Storage Information</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline text-xs font-mono">
              <span className="text-slate-300">12.4 GB used</span>
              <span className="text-slate-500">of 100 GB</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-[#0B3037]" style={{ width: "12.4%" }} />
            </div>
            <p className="text-[10px] text-slate-500">
              Need more storage space? View our pricing plans to upgrade your tier.{" "}
              <span className="text-sky-400 font-mono italic text-[9px] block sm:inline-block sm:ml-1">
                (Subscription upgrade coming in Phase 4)
              </span>
            </p>
          </div>
        </div>

        {/* Account Information (read-only) */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-lg">
          <div className="flex items-center gap-2 text-slate-200 border-b border-slate-900/60 pb-3">
            <ShieldCheck className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Account Information (Read-only)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-950">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Membership Tier</span>
              <span className="text-slate-200 font-semibold mt-1 block">Pro Studio Plan</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-950">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Member Since</span>
              <span className="text-slate-200 font-semibold mt-1 block">Jan 12, 2026</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-950">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Subscription Status</span>
              <span className="text-slate-200 font-semibold mt-1 block text-emerald-400">Renews Jan 12, 2027</span>
            </div>
          </div>
        </div>

        {/* Form Submission buttons */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
