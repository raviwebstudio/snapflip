import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2, AlertTriangle } from "lucide-react";
import { UploadService } from "../../services/uploadService";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  width?: number;
  height?: number;
}

interface StepUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepUpload({ files, onFilesChange, onNext, onBack }: StepUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return `File "${file.name}" is not an image. Only image files are supported.`;
    }
    if (file.size > 10 * 1024 * 1024) {
      return `File "${file.name}" exceeds the 10MB size limit.`;
    }
    return null;
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 600 }); // Default landscape mock fallback
      };
    });
  };

  const handleUpload = async (fileList: FileList) => {
    setErrorMsg(null);
    const validFiles: File[] = [];
    let validationError: string | null = null;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const err = validateFile(file);
      if (err) {
        validationError = err;
      } else {
        validFiles.push(file);
      }
    }

    if (validationError) {
      setErrorMsg(validationError);
      // Auto-clear validation alerts after 5 seconds
      setTimeout(() => setErrorMsg(null), 5000);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    const isCloudinaryActive = UploadService.isConfigured();

    // Parallel measurement of image natural dimensions
    const measuredFiles = await Promise.all(
      validFiles.map(async (file) => {
        const dims = await getImageDimensions(file);
        return { file, ...dims };
      })
    );

    if (isCloudinaryActive) {
      setUploadStatus("Uploading to Cloudinary...");
      const progressMap: Record<string, number> = {};
      const uploadedResults: UploadedFile[] = [];

      validFiles.forEach((f) => {
        progressMap[f.name] = 0;
      });

      try {
        const uploadPromises = measuredFiles.map(async (fileObj) => {
          const result = await UploadService.uploadImage(fileObj.file, (percent) => {
            progressMap[fileObj.file.name] = percent;
            const avg = Math.round(
              Object.values(progressMap).reduce((sum, curr) => sum + curr, 0) / validFiles.length
            );
            setProgress(avg);
          });

          uploadedResults.push({
            id: result.public_id,
            url: result.secure_url,
            name: fileObj.file.name,
            width: fileObj.width,
            height: fileObj.height,
          });
        });

        await Promise.all(uploadPromises);
        onFilesChange([...files, ...uploadedResults]);
      } catch {
        setErrorMsg("Failed to upload photo. Please check your network connection and try again.");
        setTimeout(() => setErrorMsg(null), 6000);
      } finally {
        setUploading(false);
      }
    } else {
      setUploadStatus("Running local preview simulation...");
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 20;
        setProgress(Math.min(currentProgress, 100));

        if (currentProgress >= 100) {
          clearInterval(interval);
          setUploading(false);
          const localList = measuredFiles.map((f) => ({
            id: Math.random().toString(36).substring(2, 9),
            url: URL.createObjectURL(f.file),
            name: f.file.name,
            width: f.width,
            height: f.height,
          }));
          onFilesChange([...files, ...localList]);
        }
      }, 300);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove && fileToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    const updated = files.filter((f) => f.id !== id);
    onFilesChange(updated);
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-2 text-center sm:text-left">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
          <UploadCloud className="h-5 w-5 text-sky-400" />
          Photo Upload
        </h2>
        <p className="text-xs text-slate-500">Drag high-resolution image files to populate your digital album collection.</p>
      </div>

      {/* Validation Error Alert box */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-200">Validation Alert</h5>
            <p className="text-[10px] text-slate-400 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Drag Zone */}
      {!uploading && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInputClick}
          className={`h-48 rounded-2xl border-2 border-dashed flex flex-col justify-center items-center gap-3 p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-sky-500 bg-[#0B3037]/15 text-sky-400"
              : "border-slate-800 bg-slate-950 hover:border-sky-500/50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
          <UploadCloud className="h-10 w-10 text-slate-500" />
          <div>
            <p className="text-sm font-bold text-slate-200">Drag & drop files here or click to browse</p>
            <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, and WebP image files (Max 10MB per file).</p>
          </div>
        </div>
      )}

      {/* Uploading progress state */}
      {uploading && (
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-8 text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-10 w-10 text-sky-400 animate-spin" />
          </div>
          <div className="space-y-2 max-w-xs mx-auto">
            <h4 className="text-sm font-bold text-slate-200">{uploadStatus}</h4>
            <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
              <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] font-mono text-slate-500">{progress}% complete</p>
          </div>
        </div>
      )}

      {/* Previews grid */}
      {files.length > 0 && !uploading && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Uploaded Photos ({files.length})</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="group aspect-square rounded-xl border border-slate-900 bg-slate-950 overflow-hidden relative"
              >
                <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(file.id);
                  }}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-lg bg-slate-950/80 text-slate-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && !uploading && (
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-12 text-center text-slate-500">
          <ImageIcon className="h-10 w-10 text-slate-600 mx-auto mb-4" />
          <h4 className="text-sm font-semibold text-slate-300">No photos uploaded yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">Upload at least one image to set up your album collection.</p>
        </div>
      )}

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
          disabled={files.length === 0}
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          Next: Organize Album
        </button>
      </div>
    </div>
  );
}
