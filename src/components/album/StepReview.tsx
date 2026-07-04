import { ClipboardCheck, FileCheck, CheckCircle2 } from "lucide-react";
import { ALBUM_SIZE_MAP } from "../../utils/albumUtils";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  width?: number;
  height?: number;
}

interface StepReviewProps {
  data: {
    albumName: string;
    coupleName: string;
    eventType: string;
    eventDate: string;
    title: string;
    description: string;
    theme: string;
    music: string;
    visibility: "Public" | "Private";
    passcode: string;
    watermark: boolean;
    allowDownload: boolean;
    albumSize: string;
    customWidth?: string;
    customHeight?: string;
    customUnit?: string;
  };
  filesCount: number;
  files: UploadedFile[];
  coverImage: string;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isPublished?: boolean;
}

export default function StepReview({ data, filesCount, files, coverImage, onBack, onSaveDraft, onPublish, isPublished }: StepReviewProps) {
  // Estimated file size calculations
  const estSizeMb = (filesCount * 2.4).toFixed(1);

  const getFriendlySizeLabel = () => {
    if (!data.albumSize || data.albumSize === "auto") {
      let portraitCount = 0;
      let landscapeCount = 0;
      let squareCount = 0;

      files.forEach((file) => {
        const w = file.width || 800;
        const h = file.height || 600;
        const ratio = w / h;
        if (ratio > 1.2) {
          landscapeCount++;
        } else if (ratio < 0.8) {
          portraitCount++;
        } else {
          squareCount++;
        }
      });

      let detected = "Landscape";
      if (portraitCount > landscapeCount && portraitCount > squareCount) {
        detected = "Portrait";
      } else if (squareCount > landscapeCount && squareCount > portraitCount) {
        detected = "Square";
      }
      return `Auto Detected: ${detected}`;
    }

    if (data.albumSize === "custom") {
      return `Custom (${data.customWidth ?? "?"} × ${data.customHeight ?? "?"} ${data.customUnit ?? "mm"})`;
    }
    return ALBUM_SIZE_MAP[data.albumSize]?.label ?? "AUTO (Recommended)";
  };

  const sizeLabel = getFriendlySizeLabel();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-2 text-center sm:text-left">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
          <ClipboardCheck className="h-5 w-5 text-sky-400" />
          Review & Publish
        </h2>
        <p className="text-xs text-slate-500">Double-check your photography collection details before saving the showcase draft.</p>
      </div>

      <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 sm:p-8 space-y-8 shadow-xl">
        {/* Cover Preview & Core Stats */}
        <div className="flex flex-col sm:flex-row gap-6 items-stretch">
          {/* Cover Placeholder */}
          <div className="w-full sm:w-40 aspect-video sm:aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 relative flex items-center justify-center">
            {coverImage ? (
              <img src={coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">No Cover Image</span>
            )}
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-400 border border-slate-800">
              Cover Preview
            </span>
          </div>

          {/* Details list */}
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest">Event Collection</span>
              <h3 className="text-lg font-bold text-slate-100">{data.albumName || "Untitled Album"}</h3>
              <p className="text-xs text-slate-400">Clients: {data.coupleName || "Unspecified"}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-slate-900/60 pt-4 mt-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Event Type</span>
                <span className="text-slate-300 font-semibold">{data.eventType || "None"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Event Date</span>
                <span className="text-slate-300 font-semibold">{data.eventDate || "None"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div className="border-t border-slate-900 pt-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Configuration Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-xs">
            {/* Left Col */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/50">
                <span className="text-slate-500">Total Photos</span>
                <span className="font-semibold text-slate-200">{filesCount} items</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/50">
                <span className="text-slate-500">Estimated Size</span>
                <span className="font-semibold text-slate-200">{estSizeMb} MB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/50">
                <span className="text-slate-500">Selected Theme</span>
                <span className="font-semibold text-slate-200 capitalize">{data.theme} theme</span>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/50">
                <span className="text-slate-500">Background Music</span>
                <span className="font-semibold text-slate-200 capitalize">{data.music.replace("-", " ")}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/50">
                <span className="text-slate-500">Visibility Setting</span>
                <span className="font-semibold text-slate-200">{data.visibility}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/50">
                <span className="text-slate-500">Album Dimensions</span>
                <span className="font-semibold text-slate-200">{sizeLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation action buttons */}
      <div className="pt-6 flex justify-between border-t border-slate-900">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
        >
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-850 hover:text-white transition-colors cursor-pointer"
          >
            <FileCheck className="h-4 w-4 text-sky-400" />
            Save Draft
          </button>
          
          <button
            type="button"
            onClick={onPublish}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isPublished ? "Update Published Album" : "Publish Album"}
          </button>
        </div>
      </div>
    </div>
  );
}
