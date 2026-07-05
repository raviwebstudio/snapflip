import { useState, useEffect } from "react";
import {
  Move,
  Trash,
  RotateCw,
  RotateCcw,
  CheckCircle,
  Circle,
  FolderHeart,
  LayoutGrid,
  CheckSquare,
  BarChart3,
  Image as ImageIcon,
  Info
} from "lucide-react";
interface UploadedFile {
  id: string;
  url: string;
  name: string;
  thumbnailUrl?: string;
  optimizedUrl?: string;
  orientation?: number;
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
  const [rotationMap, setRotationMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    files.forEach((f) => {
      if (f.orientation !== undefined) {
        map[f.id] = f.orientation;
      }
    });
    return map;
  });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Custom Delete Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    targetId: string | null;
    isBulk: boolean;
  }>({
    isOpen: false,
    targetId: null,
    isBulk: false,
  });

  // Set first uploaded photo as cover if none set
  useEffect(() => {
    if (files.length > 0 && !coverImage) {
      onCoverImageChange(files[0].url);
    }
  }, [files, coverImage, onCoverImageChange]);

  // Synchronize rotationMap from files prop
  useEffect(() => {
    setRotationMap((prev) => {
      const map = { ...prev };
      let changed = false;
      files.forEach((f) => {
        const fileOrientation = f.orientation || 0;
        if (map[f.id] !== fileOrientation) {
          map[f.id] = fileOrientation;
          changed = true;
        }
      });
      return changed ? map : prev;
    });
  }, [files]);

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

  const handleRotateRight = (id: string) => {
    const currentRotate = rotationMap[id] || 0;
    const newRotate = (currentRotate + 90) % 360;
    setRotationMap((prev) => ({
      ...prev,
      [id]: newRotate,
    }));
    const updated = files.map((f) => {
      if (f.id === id) {
        return { ...f, orientation: newRotate };
      }
      return f;
    });
    onFilesChange(updated);
  };

  const handleRotateLeft = (id: string) => {
    const currentRotate = rotationMap[id] || 0;
    const newRotate = (currentRotate - 90 + 360) % 360;
    setRotationMap((prev) => ({
      ...prev,
      [id]: newRotate,
    }));
    const updated = files.map((f) => {
      if (f.id === id) {
        return { ...f, orientation: newRotate };
      }
      return f;
    });
    onFilesChange(updated);
  };

  const handleDelete = (id: string) => {
    const fileToDelete = files.find((f) => f.id === id);
    const updated = files.filter((f) => f.id !== id);
    onFilesChange(updated);

    if (fileToDelete && fileToDelete.url === coverImage) {
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

  const handleBulkSetCover = () => {
    if (selectedIds.length > 0) {
      const firstId = selectedIds[0];
      const selectedFile = files.find((f) => f.id === firstId);
      if (selectedFile) {
        onCoverImageChange(selectedFile.url);
        // Clear selection mode after setting cover
        setSelectionMode(false);
        setSelectedIds([]);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === files.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map((f) => f.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Mock file size calculation (2.4 MB per photo)
  const totalSizeMB = (files.length * 2.4).toFixed(1);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Custom Confirmation Modal */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="rounded-2xl border border-rose-500/25 bg-slate-950 p-6 text-center space-y-6 max-w-sm w-full shadow-2xl shadow-rose-500/5">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Trash className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Confirm Deletion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {confirmDelete.isBulk
                  ? `Are you sure you want to permanently delete the ${selectedIds.length} selected photos? This action cannot be undone.`
                  : "Are you sure you want to permanently delete this photo? This action cannot be undone."}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setConfirmDelete({ isOpen: false, targetId: null, isBulk: false })}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete.isBulk) {
                    handleBulkDelete();
                  } else if (confirmDelete.targetId) {
                    handleDelete(confirmDelete.targetId);
                  }
                  setConfirmDelete({ isOpen: false, targetId: null, isBulk: false });
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                {selectedIds.length === files.length ? "Deselect All" : "Select All"}
              </button>
              <button
                onClick={handleClearSelection}
                disabled={selectedIds.length === 0}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkSetCover}
                disabled={selectedIds.length === 0}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-sky-400 hover:text-sky-300 disabled:opacity-30 cursor-pointer"
                title="Set the first selected photo as the cover image"
              >
                Set Cover
              </button>
              <button
                onClick={() => setConfirmDelete({ isOpen: true, targetId: null, isBulk: true })}
                disabled={selectedIds.length === 0}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-500 hover:bg-rose-400 px-3 text-xs text-slate-950 font-semibold disabled:opacity-50 cursor-pointer"
              >
                Delete Selected ({selectedIds.length})
              </button>
              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectionMode(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              <CheckSquare className="h-4 w-4" />
              Selection Mode
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Grid on Left, Stats Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Photos Grid Column (3/4 on Large screens) */}
        <div className="lg:col-span-3">
          {files.length === 0 ? (
            <div className="rounded-2xl border border-slate-900 bg-slate-950 p-12 text-center text-slate-500">
              <ImageIcon className="h-10 w-10 text-slate-600 mx-auto mb-4" />
              <h4 className="text-sm font-semibold text-slate-300">No photos found</h4>
              <p className="text-xs text-slate-500 mt-1">Please go back to the upload step and add photos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                    } ${draggedIndex === index ? "opacity-30" : "opacity-100"} ${
                      !selectionMode ? "cursor-grab active:cursor-grabbing" : ""
                    }`}
                  >
                    {/* Image Box */}
                    <div className="aspect-square bg-slate-900 overflow-hidden relative flex items-center justify-center">
                      <img
                        src={file.thumbnailUrl || file.url}
                        alt={file.name}
                        style={{ transform: `rotate(${rotation}deg)` }}
                        className="h-full w-full object-cover transition-transform duration-300 pointer-events-none"
                      />

                      {/* Selection Overlay */}
                      {selectionMode && (
                        <div
                          onClick={() => handleToggleSelect(file.id)}
                          className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckCircle className="h-7 w-7 text-sky-400" />
                          ) : (
                            <Circle className="h-7 w-7 text-slate-400" />
                          )}
                        </div>
                      )}

                      {/* Cover tag */}
                      {isCover && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-950 border border-sky-400/20">
                          Cover
                        </span>
                      )}

                      {/* Reorder Drag Handle visual indicator */}
                      {!selectionMode && (
                        <div className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-slate-950/80 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Move className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Bottom actions row */}
                    {!selectionMode && (
                      <div className="p-2 bg-slate-950 flex items-center justify-between border-t border-slate-900 gap-1.5">
                        {/* Cover image toggle */}
                        <button
                          type="button"
                          onClick={() => onCoverImageChange(file.url)}
                          disabled={isCover}
                          className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            isCover
                              ? "text-sky-400 bg-sky-500/10"
                              : "text-slate-500 hover:text-white hover:bg-slate-900"
                          }`}
                          title="Set as album cover"
                        >
                          <FolderHeart className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Rotate Left */}
                          <button
                            type="button"
                            onClick={() => handleRotateLeft(file.id)}
                            className="h-7 w-7 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="Rotate Left 90°"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>

                          {/* Rotate Right */}
                          <button
                            type="button"
                            onClick={() => handleRotateRight(file.id)}
                            className="h-7 w-7 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="Rotate Right 90°"
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Delete single image */}
                        <button
                          type="button"
                          onClick={() => setConfirmDelete({ isOpen: true, targetId: file.id, isBulk: false })}
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer"
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
          )}
        </div>

        {/* Album Statistics Column (1/4 on Large screens) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 space-y-5 shadow-lg">
            <div className="flex items-center gap-2 text-slate-200 border-b border-slate-900/60 pb-3">
              <BarChart3 className="h-4.5 w-4.5 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Album Statistics</h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Cover Image Block */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Cover Image</span>
                {coverImage ? (
                  <div className="aspect-video rounded-lg border border-slate-900 bg-slate-900 overflow-hidden relative">
                    <img src={coverImage} alt="Album Cover Preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border border-dashed border-slate-800 bg-slate-900/40 flex items-center justify-center text-slate-500 font-mono text-[9px] uppercase">
                    No Cover Selected
                  </div>
                )}
              </div>

              {/* Grid counters */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/45">
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Photos</span>
                  <span className="text-slate-200 font-bold mt-0.5 block">{files.length}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/45">
                  <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Total Size</span>
                  <span className="text-slate-200 font-bold mt-0.5 block">{totalSizeMB} MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 flex gap-3 text-xs leading-relaxed text-slate-400">
            <Info className="h-4.5 w-4.5 text-sky-400 shrink-0 mt-0.5" />
            <p>
              Cover images set here will be used on client flipbook layouts. Arrange pages by dragging items into position.
            </p>
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
        <button
          type="button"
          onClick={onNext}
          disabled={files.length === 0}
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          Next: Album Settings
        </button>
      </div>
    </div>
  );
}
