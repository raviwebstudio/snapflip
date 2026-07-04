import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StepDetails from "../../components/album/StepDetails";
import StepUpload from "../../components/album/StepUpload";
import StepOrganizer from "../../components/album/StepOrganizer";
import StepSettings from "../../components/album/StepSettings";
import StepReview from "../../components/album/StepReview";
import { Check, CheckCircle2, RotateCcw } from "lucide-react";
import { DbService } from "../../services/dbService";
import { useToastStore } from "../../store";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  width?: number;
  height?: number;
}

const detailsFallback = {
  albumName: "",
  coupleName: "",
  eventType: "",
  eventDate: "",
  albumSize: "auto",
  customWidth: "",
  customHeight: "",
  customUnit: "mm",
};

const settingsFallback = {
  title: "",
  description: "",
  theme: "dark",
  music: "none",
  visibility: "Public" as "Public" | "Private",
  passcode: "",
  watermark: false,
  allowDownload: false,
};

export default function CreateAlbum() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const { addToast } = useToastStore();

  const [successMsg, setSuccessMsg] = useState(false);
  const [successTitle, setSuccessTitle] = useState("Draft Saved Successfully!");
  
  const [step, setStep] = useState<number>(1);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [albumStatus, setAlbumStatus] = useState<"Draft" | "Published">("Draft");

  const [details, setDetails] = useState<typeof detailsFallback>(detailsFallback);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [coverImage, setCoverImage] = useState<string>("");
  const [settings, setSettings] = useState<typeof settingsFallback>(settingsFallback);

  // 1. Initial State Loader: Listen for ?id=xxx
  useEffect(() => {
    if (queryId) {
      const existing = DbService.getAlbumById(queryId);
      if (existing) {
        setEditingAlbumId(queryId);
        setAlbumStatus(existing.status);
        const s = existing.settings;
        setDetails({
          albumName: existing.name || "",
          coupleName: existing.coupleName || "",
          eventType: existing.eventType || "",
          eventDate: existing.eventDate || "",
          albumSize: s?.albumSize ?? "auto",
          customWidth: s?.customWidth ?? "",
          customHeight: s?.customHeight ?? "",
          customUnit: s?.customUnit ?? "mm",
        });
        setFiles(existing.photos || []);
        setCoverImage(existing.coverImage || "");
        setSettings({
          title: s?.title ?? "",
          description: s?.description ?? "",
          theme: s?.theme ?? "dark-luxury",
          music: s?.music ?? "none",
          visibility: s?.visibility ?? "Public",
          passcode: s?.passcode ?? "",
          watermark: s?.watermark ?? false,
          allowDownload: s?.allowDownload ?? true,
        });

        // Restore step if there is matching session editing cache
        const savedStateStr = localStorage.getItem("snapflip_create_album_state");
        if (savedStateStr) {
          try {
            const saved = JSON.parse(savedStateStr);
            if (saved.editingId === queryId) {
              setStep(saved.step || 1);
            } else {
              setStep(1);
            }
          } catch {
            setStep(1);
          }
        } else {
          setStep(1);
        }
      }
    } else {
      setEditingAlbumId(null);
      setAlbumStatus("Draft");
      
      const savedStateStr = localStorage.getItem("snapflip_create_album_state");
      if (savedStateStr) {
        try {
          const saved = JSON.parse(savedStateStr);
          if (!saved.editingId) {
            setStep(saved.step || 1);
            setDetails(saved.details || detailsFallback);
            setFiles(saved.files || []);
            setCoverImage(saved.coverImage || "");
            setSettings(saved.settings || settingsFallback);
          } else {
            // Reset to defaults
            setStep(1);
            setDetails(detailsFallback);
            setFiles([]);
            setCoverImage("");
            setSettings(settingsFallback);
          }
        } catch {
          // fallback defaults
        }
      } else {
        setStep(1);
        setDetails(detailsFallback);
        setFiles([]);
        setCoverImage("");
        setSettings(settingsFallback);
      }
    }
  }, [queryId]);

  // Pre-fill settings title when details albumName changes (only if settings title is empty)
  useEffect(() => {
    if (!settings.title && details.albumName) {
      setSettings((prev) => ({
        ...prev,
        title: details.albumName,
      }));
    }
  }, [details.albumName, settings.title]);

  // Persist state to localStorage on changes
  useEffect(() => {
    const stateToSave = {
      step,
      details,
      files,
      coverImage,
      settings,
      editingId: editingAlbumId
    };
    localStorage.setItem("snapflip_create_album_state", JSON.stringify(stateToSave));
  }, [step, details, files, coverImage, settings, editingAlbumId]);

  const handleDetailsChange = (fields: Partial<typeof details>) => {
    setDetails((prev) => ({ ...prev, ...fields }));
  };

  const handleSettingsChange = (fields: Partial<typeof settings>) => {
    setSettings((prev) => ({ ...prev, ...fields }));
  };

  const detectDominantSize = (albumFiles: UploadedFile[]): string => {
    if (albumFiles.length === 0) return "Landscape";
    
    let portraitCount = 0;
    let landscapeCount = 0;
    let squareCount = 0;

    albumFiles.forEach((file) => {
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

    if (landscapeCount >= portraitCount && landscapeCount >= squareCount) {
      return "Landscape";
    }
    if (portraitCount >= landscapeCount && portraitCount >= squareCount) {
      return "Portrait";
    }
    return "Square";
  };

  // Autosave / Save-on-Exit Lifecycle Hook (P5-014)
  const saveRef = useRef({ editingAlbumId, details, files, coverImage, settings, albumStatus });
  useEffect(() => {
    saveRef.current = { editingAlbumId, details, files, coverImage, settings, albumStatus };
  }, [editingAlbumId, details, files, coverImage, settings, albumStatus]);

  // Execute database save/autosave updates
  const performAutosaveUpdate = () => {
    const current = saveRef.current;
    if (!current.editingAlbumId) return;

    const isAuto = current.details.albumSize === "auto";
    const detected = isAuto ? detectDominantSize(current.files) : undefined;

    try {
      DbService.updateAlbum(current.editingAlbumId, {
        name: current.details.albumName || "Untitled Collection",
        coupleName: current.details.coupleName || "Event",
        eventType: current.details.eventType || "editorial",
        eventDate: current.details.eventDate || new Date().toISOString().split("T")[0],
        photos: current.files,
        coverImage: current.coverImage,
        settings: {
          ...current.settings,
          albumSize: current.details.albumSize,
          customWidth: current.details.albumSize === "custom" ? current.details.customWidth : undefined,
          customHeight: current.details.albumSize === "custom" ? current.details.customHeight : undefined,
          customUnit: current.details.albumSize === "custom" ? current.details.customUnit : undefined,
          detectedSize: detected,
        },
        status: current.albumStatus,
      });
    } catch {
      // silent background save
    }
  };

  // 1. 10-second interval
  useEffect(() => {
    const interval = setInterval(() => {
      performAutosaveUpdate();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Before browser refresh (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      performAutosaveUpdate();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // 3. Save on unmount (navigation)
  useEffect(() => {
    return () => {
      performAutosaveUpdate();
    };
  }, []);

  const handleSaveDraft = () => {
    try {
      const isAuto = details.albumSize === "auto";
      const detected = isAuto ? detectDominantSize(files) : undefined;

      const payload = {
        name: details.albumName || "Untitled Collection",
        coupleName: details.coupleName || "Event",
        eventType: details.eventType || "editorial",
        eventDate: details.eventDate || new Date().toISOString().split("T")[0],
        photos: files,
        coverImage: coverImage,
        settings: {
          ...settings,
          albumSize: details.albumSize,
          customWidth: details.albumSize === "custom" ? details.customWidth : undefined,
          customHeight: details.albumSize === "custom" ? details.customHeight : undefined,
          customUnit: details.albumSize === "custom" ? details.customUnit : undefined,
          detectedSize: detected,
        },
        status: "Draft" as const,
      };

      if (editingAlbumId) {
        DbService.updateAlbum(editingAlbumId, payload);
        addToast("Collection draft updated successfully!", "success");
      } else {
        DbService.createAlbum(payload);
        addToast("Collection draft saved successfully!", "success");
      }

      setSuccessTitle("Draft Saved Successfully!");
      setSuccessMsg(true);
      localStorage.removeItem("snapflip_create_album_state");
      setTimeout(() => {
        navigate("/dashboard?tab=albums");
      }, 2000);
    } catch {
      addToast("Failed to save draft.", "error");
    }
  };

  const handlePublish = () => {
    try {
      const isAuto = details.albumSize === "auto";
      const detected = isAuto ? detectDominantSize(files) : undefined;

      const payload = {
        name: details.albumName || "Untitled Collection",
        coupleName: details.coupleName || "Event",
        eventType: details.eventType || "editorial",
        eventDate: details.eventDate || new Date().toISOString().split("T")[0],
        photos: files,
        coverImage: coverImage,
        settings: {
          ...settings,
          albumSize: details.albumSize,
          customWidth: details.albumSize === "custom" ? details.customWidth : undefined,
          customHeight: details.albumSize === "custom" ? details.customHeight : undefined,
          customUnit: details.albumSize === "custom" ? details.customUnit : undefined,
          detectedSize: detected,
        },
        status: "Published" as const,
      };

      if (editingAlbumId) {
        DbService.updateAlbum(editingAlbumId, payload);
        addToast("Collection published successfully!", "success");
      } else {
        DbService.createAlbum(payload);
        addToast("Collection published successfully!", "success");
      }

      setSuccessTitle(editingAlbumId && albumStatus === "Published" ? "Album Updated!" : "Album Published!");
      setSuccessMsg(true);
      localStorage.removeItem("snapflip_create_album_state");
      setTimeout(() => {
        navigate("/dashboard?tab=albums");
      }, 2000);
    } catch {
      addToast("Failed to publish album.", "error");
    }
  };

  const handleResetDraft = () => {
    if (window.confirm("Are you sure you want to reset this draft? All uploaded files and details will be cleared.")) {
      localStorage.removeItem("snapflip_create_album_state");
      setStep(1);
      setDetails({
        albumName: "",
        coupleName: "",
        eventType: "",
        eventDate: "",
        albumSize: "auto",
        customWidth: "",
        customHeight: "",
        customUnit: "mm",
      });
      setFiles([]);
      setCoverImage("");
      setSettings({
        title: "",
        description: "",
        theme: "dark",
        music: "none",
        visibility: "Public",
        passcode: "",
        watermark: false,
        allowDownload: false,
      });
    }
  };

  // Steps configuration for the progress bar
  const stepsConfig = [
    { label: "Details", num: 1 },
    { label: "Upload", num: 2 },
    { label: "Organize", num: 3 },
    { label: "Settings", num: 4 },
    { label: "Review", num: 5 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Success Modal Popup */}
      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-sky-500/30 bg-slate-950 p-8 text-center space-y-4 max-w-sm shadow-2xl shadow-sky-500/10 font-mono">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-sky-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">{successTitle}</h3>
            <p className="text-xs text-slate-400 font-sans">Your digital album showcase has been stored locally. Redirecting you to the workspace dashboard...</p>
          </div>
        </div>
      )}

      {/* Header controls */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
        <div className="flex items-center gap-2">
          <h1 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {editingAlbumId ? "Editing Album" : "Album Creator"}
          </h1>
          {editingAlbumId && (
            <span className="inline-flex items-center gap-1 rounded bg-[#0B3037]/45 border border-sky-500/20 text-sky-400 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5 font-mono">
              Edit Mode
            </span>
          )}
        </div>
        <button
          onClick={handleResetDraft}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/5 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/15 cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Draft
        </button>
      </div>

      {/* Progress Timeline Header */}
      <div className="border-b border-slate-900 pb-6">
        <div className="flex justify-between items-center relative max-w-md mx-auto">
          {/* Connecting timeline bar */}
          <div className="absolute top-[18px] left-6 right-6 h-[2px] bg-slate-900 z-0" />
          <div
            className="absolute top-[18px] left-6 h-[2px] bg-sky-500 z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / (stepsConfig.length - 1)) * 100}%` }}
          />

          {stepsConfig.map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;

            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    // Only allow jumping back to steps already visited/valid
                    if (s.num < step) {
                      setStep(s.num);
                    }
                  }}
                  disabled={s.num >= step}
                  className={`h-9 w-9 rounded-full flex items-center justify-center border text-xs font-semibold font-mono transition-all ${
                    isCompleted
                      ? "bg-sky-500 border-sky-500 text-slate-950 cursor-pointer"
                      : isActive
                      ? "bg-slate-950 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/10 cursor-default"
                      : "bg-slate-950 border-slate-900 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3px]" /> : s.num}
                </button>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isActive ? "text-sky-400" : isCompleted ? "text-slate-300" : "text-slate-650"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps Content rendering */}
      <div className="min-h-[300px]">
        {step === 1 && (
          <StepDetails
            data={details}
            onChange={handleDetailsChange}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepUpload
            files={files}
            onFilesChange={setFiles}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepOrganizer
            files={files}
            onFilesChange={setFiles}
            coverImage={coverImage}
            onCoverImageChange={setCoverImage}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepSettings
            data={settings}
            onChange={handleSettingsChange}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && (
          <StepReview
            data={{ ...details, ...settings }}
            filesCount={files.length}
            files={files}
            coverImage={coverImage}
            onBack={() => setStep(4)}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            isPublished={albumStatus === "Published"}
          />
        )}
      </div>
    </div>
  );
}
