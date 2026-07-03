import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepDetails from "../../components/album/StepDetails";
import StepUpload from "../../components/album/StepUpload";
import StepOrganizer from "../../components/album/StepOrganizer";
import StepSettings from "../../components/album/StepSettings";
import StepReview from "../../components/album/StepReview";
import { Check, CheckCircle2 } from "lucide-react";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
}

export default function CreateAlbum() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [successMsg, setSuccessMsg] = useState(false);

  // Wizard cumulative state
  const [details, setDetails] = useState({
    albumName: "",
    coupleName: "",
    eventType: "",
    eventDate: "",
  });
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [coverImage, setCoverImage] = useState("");
  const [settings, setSettings] = useState({
    title: "",
    description: "",
    theme: "dark",
    music: "none",
    visibility: "Public" as "Public" | "Private",
    passcode: "",
    watermark: false,
    allowDownload: false,
  });

  // Pre-fill settings title when details albumName changes
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      title: details.albumName,
    }));
  }, [details.albumName]);

  const handleDetailsChange = (fields: Partial<typeof details>) => {
    setDetails((prev) => ({ ...prev, ...fields }));
  };

  const handleSettingsChange = (fields: Partial<typeof settings>) => {
    setSettings((prev) => ({ ...prev, ...fields }));
  };

  const handleSaveDraft = () => {
    setSuccessMsg(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
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
          <div className="rounded-2xl border border-sky-500/30 bg-slate-950 p-8 text-center space-y-4 max-w-sm shadow-2xl shadow-sky-500/10">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-sky-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Draft Saved Successfully!</h3>
            <p className="text-xs text-slate-400">Your digital album showcase draft has been stored locally. Redirecting you to the workspace dashboard...</p>
          </div>
        </div>
      )}

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
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center border text-xs font-semibold font-mono transition-all ${
                    isCompleted
                      ? "bg-sky-500 border-sky-500 text-slate-950"
                      : isActive
                      ? "bg-slate-950 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/10"
                      : "bg-slate-950 border-slate-900 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3px]" /> : s.num}
                </div>
                <span
                  className={`text-[9px] uppercase font-bold tracking-widest ${
                    isActive ? "text-sky-400 font-extrabold" : "text-slate-500"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Render Area */}
      <div className="bg-slate-950/20 rounded-2xl p-6 sm:p-8">
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
            coverImage={coverImage}
            onCoverImageChange={setCoverImage}
            onFilesChange={setFiles}
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
            coverImage={coverImage}
            onBack={() => setStep(4)}
            onSaveDraft={handleSaveDraft}
          />
        )}
      </div>
    </div>
  );
}
