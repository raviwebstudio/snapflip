import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2, AlertTriangle } from "lucide-react";
import { UploadService } from "../../services/uploadService";
import { getExifOrientation, generateImageVariants } from "../../utils/imageUtils";
import { PhotoService } from "../../services/PhotoService";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
  width?: number;
  height?: number;
  optimizedUrl?: string;
  thumbnailUrl?: string;
  orientation?: number;
}

interface StepUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onNext: () => void;
  onBack: () => void;
  albumId?: string;
}

export default function StepUpload({ files, onFilesChange, onNext, onBack, albumId }: StepUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCancelledRef = useRef(false);

  const handleCancelUpload = () => {
    isCancelledRef.current = true;
    setUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (fileList: File[]) => {
    console.log("StepUpload: handleFiles called with", fileList.map(f => `${f.name} (${f.type}, ${f.size}B)`));
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];

    const validFiles: File[] = [];
    for (const f of fileList) {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExtensions.includes(ext) || !allowedMimes.includes(f.type)) {
        const msg = `Upload failed: File "${f.name}" has an invalid extension (${ext}) or format (${f.type}). Only jpg, jpeg, png, and webp are allowed.`;
        console.warn("StepUpload:", msg);
        setErrorMsg(msg);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        const msg = `Upload failed: File "${f.name}" exceeds the maximum allowed limit of 10MB.`;
        console.warn("StepUpload:", msg);
        setErrorMsg(msg);
        return;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) {
      console.warn("StepUpload: no valid files after filtering.");
      return;
    }

    if (files.length + validFiles.length > 50) {
      const msg = "Maximum of 50 images per album allowed.";
      console.warn("StepUpload:", msg);
      setErrorMsg(msg);
      return;
    }

    console.log("StepUpload: starting upload process for", validFiles.length, "files");
    setUploading(true);
    setErrorMsg(null);
    setProgress(0);
    isCancelledRef.current = false;

    const measuredFiles: { file: File; width: number; height: number; orientation: number }[] = [];
    const measurePromises = validFiles.map((file) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
          let orientation = 1;
          try {
            orientation = await getExifOrientation(file);
          } catch (e) {
            console.warn("Exif orientation parse error:", e);
          }
          measuredFiles.push({ file, width: img.width, height: img.height, orientation });
          URL.revokeObjectURL(img.src);
          resolve();
        };
        img.onerror = () => {
          measuredFiles.push({ file, width: 800, height: 600, orientation: 1 });
          URL.revokeObjectURL(img.src);
          resolve();
        };
      });
    });

    await Promise.all(measurePromises);

    if (UploadService.isConfigured()) {
      setUploadStatus("Uploading to Cloudinary...");
      const localList: UploadedFile[] = [];
      const total = measuredFiles.length;
      const progressMap: Record<string, number> = {};
      validFiles.forEach((f) => {
        progressMap[f.name] = 0;
      });

      try {
        for (let idx = 0; idx < total; idx++) {
          const fileObj = measuredFiles[idx];
          const result = await UploadService.uploadImage(fileObj.file, (p) => {
            progressMap[fileObj.file.name] = p;
            const avg = Math.round(
              Object.values(progressMap).reduce((sum, curr) => sum + curr, 0) / total
            );
            setProgress(avg);
          });

          const { optimizedUrl, thumbnailUrl } = await generateImageVariants(fileObj.file, result.secure_url);

          localList.push({
            id: result.public_id,
            url: result.secure_url,
            name: fileObj.file.name,
            width: fileObj.width,
            height: fileObj.height,
            optimizedUrl,
            thumbnailUrl,
            orientation: fileObj.orientation
          });
        }
        onFilesChange([...files, ...localList]);
      } catch (err: any) {
        console.error("Cloudinary upload error:", err);
        setErrorMsg("Failed to upload to Cloudinary. Check console.");
      } finally {
        setUploading(false);
      }
    } else {
      setUploadStatus("Preparing...");
      const localList: UploadedFile[] = [];
      const total = measuredFiles.length;

      try {
        const photoService = new PhotoService();
        const devUserId = "11111111-1111-1111-1111-111111111111";
        const currentAlbumId = albumId || "22222222-2222-2222-2222-222222222222";

        for (let idx = 0; idx < total; idx++) {
          if (isCancelledRef.current) {
            console.log("StepUpload: upload cancelled by user");
            setErrorMsg("Upload cancelled by user.");
            break;
          }
          const f = measuredFiles[idx];
          console.log(`StepUpload: processing image ${idx + 1}/${total}: ${f.file.name}`);
          
          setUploadStatus(`Preparing image ${idx + 1} of ${total}...`);
          await new Promise((r) => setTimeout(r, 150));
          if (isCancelledRef.current) break;

          setUploadStatus(`Compressing image ${idx + 1} of ${total}...`);
          await new Promise((r) => setTimeout(r, 150));
          if (isCancelledRef.current) break;

          setUploadStatus(`Uploading image ${idx + 1} of ${total}...`);
          const result = await photoService.uploadPhoto(
            devUserId,
            currentAlbumId,
            f.file,
            files.length + idx,
            f.orientation
          );
          if (isCancelledRef.current) break;

          setUploadStatus(`Saving image ${idx + 1} of ${total}...`);
          await new Promise((r) => setTimeout(r, 150));
          if (isCancelledRef.current) break;

          console.log(`StepUpload: finished uploading image ${idx + 1}/${total}: ${f.file.name} -> storageFileId: ${result.storageFileId}`);
          localList.push({
            id: result.storageFileId,
            url: result.url,
            name: f.file.name,
            width: result.width || f.width,
            height: result.height || f.height,
            orientation: f.orientation,
            optimizedUrl: result.optimizedUrl || result.url,
            thumbnailUrl: result.thumbnailUrl || result.url,
          });

          const avg = Math.round(((idx + 1) / total) * 100);
          setProgress(avg);
        }

        if (!isCancelledRef.current) {
          setUploadStatus("Completed");
          onFilesChange([...files, ...localList]);
        }
      } catch (err: any) {
        console.error("Google Drive / Supabase upload error:", err);
        setErrorMsg(`Upload failed: ${err.message || err}`);
        setTimeout(() => setErrorMsg(null), 6000);
      } finally {
        setUploading(false);
      }
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
            onChange={handleChange}
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
          <div>
            <button
              onClick={() => handleCancelUpload()}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold px-4 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all"
            >
              Cancel Upload
            </button>
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
