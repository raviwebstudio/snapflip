import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
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

  const simulateUpload = (newFiles: FileList) => {
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);

          // Add newly uploaded files
          const fileList: UploadedFile[] = [];
          for (let i = 0; i < newFiles.length; i++) {
            const f = newFiles[i];
            if (f.type.startsWith("image/")) {
              fileList.push({
                id: Math.random().toString(36).substring(2, 9),
                url: URL.createObjectURL(f),
                name: f.name,
              });
            }
          }
          onFilesChange([...files, ...fileList]);
          return 100;
        }
        return prev + 25; // 4 steps to complete
      });
    }, 400);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files);
    }
  };

  const handleRemoveFile = (id: string) => {
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
          <UploadCloud className="h-10 w-10 text-slate-500 group-hover:text-sky-400" />
          <div>
            <p className="text-sm font-bold text-slate-200">Drag & drop files here or click to browse</p>
            <p className="text-xs text-slate-500 mt-1">Supports high-res JPG, PNG, and WebP images.</p>
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
            <h4 className="text-sm font-bold text-slate-200">Uploading photos...</h4>
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
                {/* Remove button */}
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
