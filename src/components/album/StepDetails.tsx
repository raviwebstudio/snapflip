import { useState } from "react";
import { Sparkles, Calendar, BookOpen, User, Heart } from "lucide-react";
import { ALBUM_SIZE_OPTIONS } from "../../utils/albumUtils";

interface StepDetailsProps {
  data: {
    albumName: string;
    coupleName: string;
    eventType: string;
    eventDate: string;
    albumSize: string;
    customWidth: string;
    customHeight: string;
    customUnit: string;
  };
  onChange: (fields: Partial<StepDetailsProps["data"]>) => void;
  onNext: () => void;
}

export default function StepDetails({ data, onChange, onNext }: StepDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.albumName.trim()) newErrors.albumName = "Album name is required";
    if (!data.coupleName.trim()) newErrors.coupleName = "Couple name(s) is required";
    if (!data.eventType) newErrors.eventType = "Please select an event type";
    if (!data.eventDate) newErrors.eventDate = "Event date is required";

    if (data.albumSize === "custom") {
      if (!data.customWidth.trim()) newErrors.customWidth = "Width is required";
      if (!data.customHeight.trim()) newErrors.customHeight = "Height is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2 text-center sm:text-left">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
          <BookOpen className="h-5 w-5 text-sky-400" />
          Album Details
        </h2>
        <p className="text-xs text-slate-500">Provide core metadata for this photography portfolio album.</p>
      </div>

      <div className="space-y-4">
        {/* Album Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            Album Name
          </label>
          <input
            type="text"
            placeholder="e.g. Autumn Wedding Collection"
            value={data.albumName}
            onChange={(e) => {
              onChange({ albumName: e.target.value });
              if (errors.albumName) setErrors({ ...errors, albumName: "" });
            }}
            className={`w-full h-11 px-4 rounded-xl border bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors ${
              errors.albumName ? "border-rose-500/50 focus:border-rose-500" : "border-slate-900"
            }`}
          />
          {errors.albumName && <p className="text-[10px] text-rose-500">{errors.albumName}</p>}
        </div>

        {/* Couple Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-sky-400" />
            Couple / Client Name
          </label>
          <input
            type="text"
            placeholder="e.g. Sarah & Michael"
            value={data.coupleName}
            onChange={(e) => {
              onChange({ coupleName: e.target.value });
              if (errors.coupleName) setErrors({ ...errors, coupleName: "" });
            }}
            className={`w-full h-11 px-4 rounded-xl border bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 transition-colors ${
              errors.coupleName ? "border-rose-500/50 focus:border-rose-500" : "border-slate-900"
            }`}
          />
          {errors.coupleName && <p className="text-[10px] text-rose-500">{errors.coupleName}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Event Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-sky-400" />
              Event Type
            </label>
            <select
              value={data.eventType}
              onChange={(e) => {
                onChange({ eventType: e.target.value });
                if (errors.eventType) setErrors({ ...errors, eventType: "" });
              }}
              className={`w-full h-11 px-4 rounded-xl border bg-slate-950 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 transition-colors ${
                errors.eventType ? "border-rose-500/50 focus:border-rose-500" : "border-slate-900"
              }`}
            >
              <option value="">Select Event...</option>
              <option value="Wedding">Wedding</option>
              <option value="Pre-Wedding">Pre-Wedding</option>
              <option value="Engagement">Engagement</option>
              <option value="Reception">Reception</option>
              <option value="Portrait Session">Portrait Session</option>
              <option value="Fine Art">Fine Art Collection</option>
            </select>
            {errors.eventType && <p className="text-[10px] text-rose-500">{errors.eventType}</p>}
          </div>

          {/* Event Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-sky-400" />
              Event Date
            </label>
            <input
              type="date"
              value={data.eventDate}
              onChange={(e) => {
                onChange({ eventDate: e.target.value });
                if (errors.eventDate) setErrors({ ...errors, eventDate: "" });
              }}
              className={`w-full h-11 px-4 rounded-xl border bg-slate-950 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 transition-colors ${
                errors.eventDate ? "border-rose-500/50 focus:border-rose-500" : "border-slate-900"
              }`}
            />
            {errors.eventDate && <p className="text-[10px] text-rose-500">{errors.eventDate}</p>}
          </div>
        </div>

        {/* Album Size Selection (P5-009) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-sky-400" />
            Album Size *
          </label>
          <select
            value={data.albumSize || "auto"}
            onChange={(e) => {
              onChange({ albumSize: e.target.value });
            }}
            className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950 text-sm text-slate-300 focus:outline-none focus:border-sky-500/50 transition-colors"
          >
            {ALBUM_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Custom Size Fields */}
        {data.albumSize === "custom" && (
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/40 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Width *</label>
              <input
                type="number"
                min="1"
                required
                value={data.customWidth}
                onChange={(e) => {
                  onChange({ customWidth: e.target.value });
                  if (errors.customWidth) setErrors({ ...errors, customWidth: "" });
                }}
                placeholder="Width"
                className={`w-full h-10 px-3 rounded-lg border bg-slate-950 text-slate-200 focus:outline-none ${
                  errors.customWidth ? "border-rose-500/50" : "border-slate-900"
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Height *</label>
              <input
                type="number"
                min="1"
                required
                value={data.customHeight}
                onChange={(e) => {
                  onChange({ customHeight: e.target.value });
                  if (errors.customHeight) setErrors({ ...errors, customHeight: "" });
                }}
                placeholder="Height"
                className={`w-full h-10 px-3 rounded-lg border bg-slate-950 text-slate-200 focus:outline-none ${
                  errors.customHeight ? "border-rose-500/50" : "border-slate-900"
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Unit</label>
              <select
                value={data.customUnit}
                onChange={(e) => onChange({ customUnit: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-900 bg-slate-950 text-slate-300 focus:outline-none"
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="inch">inch</option>
                <option value="px">px</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors cursor-pointer"
        >
          Next: Upload Photos
        </button>
      </div>
    </form>
  );
}
