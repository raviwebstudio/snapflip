import { useState, useEffect, useRef } from "react";
import { Trash2, RotateCcw, AlertTriangle, Image as ImageIcon, Info, Clock, Loader2 } from "lucide-react";
import { DbService } from "../../services/dbService";
import type { Album } from "../../services/dbService";
import { useToastStore } from "../../store";

export default function TrashAlbums() {
  const { addToast } = useToastStore();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: ""
  });

  const confirmModalRef = useRef<HTMLDivElement>(null);

  const loadTrashAlbums = async () => {
    try {
      const list = await DbService.getAlbums();
      setAlbums(list.filter((a) => !!a.soft_delete_at));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTrashAlbums();
  }, []);

  // Keyboard trap and ESC handler for confirmation modal
  useEffect(() => {
    if (!deleteConfirm.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDeleteConfirm({ isOpen: false, id: "", name: "" });
        return;
      }

      if (e.key === "Tab") {
        const modalEl = confirmModalRef.current;
        if (!modalEl) return;
        const focusables = modalEl.querySelectorAll("button, [href]");
        if (focusables.length === 0) return;
        const first = focusables[0] as HTMLElement;
        const last = focusables[focusables.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleteConfirm.isOpen]);

  const handleRestore = async (id: string) => {
    try {
      await DbService.restoreAlbum(id);
      addToast("Album collection restored successfully!", "success");
      await loadTrashAlbums();
      // Dispatch storage event to update grid/stats/counts immediately
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
      addToast("Failed to restore album.", "error");
    }
  };

  const handlePermanentDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name });
  };

  const handlePermanentDeleteConfirm = async () => {
    const albumId = deleteConfirm.id;
    if (!albumId) return;

    setLoading(true);
    try {
      await DbService.permanentDeleteAlbum(albumId);
      addToast("Album deleted permanently.", "success");
      setDeleteConfirm({ isOpen: false, id: "", name: "" });
      await loadTrashAlbums();
      // Dispatch storage event to update grid/stats/counts immediately
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
      addToast("Failed to permanently delete album.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getRemainingDays = (softDeleteDateStr: string) => {
    const deletedTime = new Date(softDeleteDateStr).getTime();
    const expiryTime = deletedTime + 14 * 24 * 60 * 60 * 1000;
    const remainingMs = expiryTime - Date.now();
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    return remainingDays > 0 ? remainingDays : 0;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 flex gap-3 items-start">
        <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200">Retention Policy</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Deleted albums are kept in the Trash for up to 14 days. During this period, you can restore them with all their photos and sharing links intact. After 14 days, they will be permanently deleted automatically.
          </p>
        </div>
      </div>

      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-900 rounded-3xl bg-slate-950/40">
          <Trash2 className="h-10 w-10 text-slate-700 mb-3" />
          <h4 className="text-sm font-bold text-slate-400">Trash is empty</h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Albums you delete will appear here for 14 days before being permanently removed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => {
            const hasCoverImage = !!album.coverImage;
            const remainingDays = album.soft_delete_at ? getRemainingDays(album.soft_delete_at) : 14;

            return (
              <div
                key={album.id}
                className="rounded-2xl border border-slate-900 bg-slate-950 overflow-hidden flex flex-col justify-between min-h-[220px] shadow-lg group relative"
              >
                {/* Header Info */}
                <div className="h-24 bg-slate-900 relative p-4 flex items-start justify-between border-b border-slate-900/60 overflow-hidden">
                  {hasCoverImage && (
                    <img
                      src={album.coverImage}
                      alt={album.name}
                      className="absolute inset-0 h-full w-full object-cover opacity-20"
                    />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent ${!hasCoverImage ? album.gradient : ""}`} />

                  <div className="relative z-10 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wider uppercase border border-rose-500/20 bg-rose-500/10 text-rose-400 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {remainingDays === 0 ? "Expired" : `${remainingDays} days left`}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 truncate">{album.name}</h4>
                    <p className="text-[9px] text-slate-400 mt-1">Clients: {album.coupleName || "Unspecified"}</p>
                    <div className="flex items-center gap-2 text-slate-500 text-[9px] mt-2">
                      <ImageIcon className="h-3 w-3 text-slate-650" />
                      <span>{album.photos.length} photos</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-2 pt-4 border-t border-slate-900 mt-4">
                    <button
                      onClick={() => handleRestore(album.id)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-900 text-slate-350 hover:text-white hover:bg-slate-850 border border-slate-800 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="h-3 w-3 text-sky-400" />
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDeleteClick(album.id, album.name)}
                      className="px-3 py-1.5 rounded-lg border border-rose-950/30 hover:border-rose-900/60 bg-rose-950/15 hover:bg-rose-950/30 text-rose-455 hover:text-rose-400 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete Permanently
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            ref={confirmModalRef}
            className="w-full max-w-md rounded-3xl border border-slate-900 bg-slate-950 p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-100">Permanently Delete Album?</h3>
                <p className="text-[10px] text-slate-500">This action is permanent and irreversible.</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-200">"{deleteConfirm.name}"</strong>? All photos, Google Drive directories, and analytics history will be deleted immediately.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={loading}
                onClick={() => setDeleteConfirm({ isOpen: false, id: "", name: "" })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white border border-slate-900 hover:bg-slate-900 shrink-0 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handlePermanentDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-550 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-lg shadow-rose-500/10 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
