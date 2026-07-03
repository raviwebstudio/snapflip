import { useState } from "react";
import { Move, Trash, RotateCw, CheckCircle, Circle, FolderHeart, LayoutGrid, CheckSquare } from "lucide-react";

interface UploadedFile {
  id: string;
  url: string;
  name: string;
}

interface StepOrganizerProps {
  files: UploadedFile[];
  coverImage: string;
  onCoverImageChange: (url: string) => void;
  onFilesChange: (files: UploadedFile[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepOrganizer({
  files,
  coverImage,
  onCoverImageChange,
  onFilesChange,
  onNext,
  onBack,
}: StepOrganizerProps) {
  const [rotationMap, setRotationMap] = useState<Record<string, number>>({});
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Set first uploaded photo as cover if none set
  if (files.length > 0 && !coverImage) {
    onCoverImageChange(files[0].url);
  }

  // Native Drag and Drop handlers
  const handleDragStart = (index: number) => {
    if (selectionMode) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...files];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    onFilesChange(updated);
    setDraggedIndex(null);
  };

  const handleRotate = (id: string) => {
    const currentRotate = rotationMap[id] || 0;
    setRotationMap({
      ...rotationMap,
      [id]: (currentRotate + 90) % 360,
    });
  };

  const handleDelete = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    onFilesChange(updated);
    if (coverImage === files.find((f) => f.id === id)?.url) {
      onCoverImageChange(updated[0]?.url || "");
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    const updated = files.filter((f) => !selectedIds.includes(f.id));
    onFilesChange(updated);
    setSelectedIds([]);
    setSelectionMode(false);
    if (!updated.some((f) => f.url === coverImage)) {
      onCoverImageChange(updated[0]?.url || "");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === files.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map((f) => f.id));
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-sky-400" />
            Organize Photos
          </h2>
          <p className="text-xs text-slate-500">
            {selectionMode
              ? "Select photos to perform bulk actions."
              : "Drag & drop photos to reorder. Set the cover image or rotate images."}
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {selectionMode ? (
            <>
              <button
                onClick={handleSelectAll}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 hover:text-white"
              >
                {selectedIds.length === files.length ? "Deselect All" : "Select All"}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-500 hover:bg-rose-400 px-3 text-xs text-slate-950 font-semibold disabled:opacity-50"
              >
                Delete Selected ({selectedIds.length})
              </button>
              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setSelectionMode(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 text-xs text-slate-300 hover:text-white"
            >
              <CheckSquare className="h-4 w-4" />
              Selection Mode
            </button>
          )}
        </div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {files.map((file, index) => {
          const isCover = coverImage === file.url;
          const isSelected = selectedIds.includes(file.id);
          const rotation = rotationMap[file.id] || 0;

          return (
            <div
              key={file.id}
              draggable={!selectionMode}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`rounded-xl border bg-slate-950 overflow-hidden flex flex-col justify-between relative shadow-lg group select-none transition-all ${
                isCover ? "border-sky-500 shadow-sky-500/5" : "border-slate-900"
              } ${draggedIndex === index ? "opacity-35" : "opacity-100"} ${
                !selectionMode ? "cursor-grab active:cursor-grabbing" : ""
              }`}
            >
              {/* Image box with rotation style */}
              <div className="aspect-square bg-slate-900 overflow-hidden relative flex items-center justify-center">
                <img
                  src={file.url}
                  alt={file.name}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="h-full w-full object-cover transition-transform duration-300 pointer-events-none"
                />

                {/* Overlay in selection mode */}
                {selectionMode && (
                  <div
                    onClick={() => handleToggleSelect(file.id)}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckCircle className="h-8 w-8 text-sky-400" />
                    ) : (
                      <Circle className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                )}

                {/* Cover badge */}
                {isCover && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-950 border border-sky-400/20">
                    Cover
                  </span>
                )}

                {/* Drag handle icon indicator */}
                {!selectionMode && (
                  <div className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-slate-950/80 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Move className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>

              {/* Action row at bottom of card */}
              {!selectionMode && (
                <div className="p-2.5 bg-slate-950 flex items-center justify-between border-t border-slate-900">
                  {/* Left: Make cover */}
                  <button
                    type="button"
                    onClick={() => onCoverImageChange(file.url)}
                    disabled={isCover}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                      isCover ? "text-sky-400 bg-sky-500/10" : "text-slate-500 hover:text-white hover:bg-slate-900"
                    }`}
                    title="Set as album cover"
                  >
                    <FolderHeart className="h-3.5 w-3.5" />
                  </button>

                  {/* Middle: Rotate */}
                  <button
                    type="button"
                    onClick={() => handleRotate(file.id)}
                    className="h-7 w-7 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 flex items-center justify-center transition-colors"
                    title="Rotate 90°"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>

                  {/* Right: Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    className="h-7 w-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 flex items-center justify-center transition-colors"
                    title="Delete image"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
          Next: Album Settings
        </button>
      </div>
    </div>
  );
}
