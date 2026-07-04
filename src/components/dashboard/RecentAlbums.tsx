import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Image as ImageIcon,
  Calendar,
  MoreVertical,
  ExternalLink,
  Inbox,
  Copy,
  Check,
  ChevronDown,
  Trash,
  Edit2,
  FolderHeart,
  Send,
  BookOpen,
  QrCode,
  Printer,
  Download
} from "lucide-react";
import QRCode from "qrcode";
import { DbService } from "../../services/dbService";
import type { Album } from "../../services/dbService";
import { useToastStore } from "../../store";
import { getSizeBadgeLabel, getSizeOrientation } from "../../utils/albumUtils";

export default function RecentAlbums() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchVal = searchParams.get("search") || "";
  const { addToast } = useToastStore();

  const [albums, setAlbums] = useState<Album[]>(() => DbService.getAlbums());
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Modal states
  const [renameState, setRenameState] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: ""
  });
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: ""
  });
  const [publishState, setPublishState] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: ""
  });
  
  // Redesigned Share Modal State (P5-015)
  const [shareState, setShareState] = useState<{
    isOpen: boolean;
    album: Album | null;
    qrPng: string;
    qrSvg: string;
  }>({
    isOpen: false,
    album: null,
    qrPng: "",
    qrSvg: ""
  });
  const [shareTab, setShareTab] = useState<"link" | "qr">("link");

  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  // ESC and Focus Trap for Delete Modal
  useEffect(() => {
    if (!deleteState.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDeleteState({ isOpen: false, id: "", name: "" });
        return;
      }

      if (e.key === "Tab") {
        const modalEl = deleteModalRef.current;
        if (!modalEl) return;
        const focusables = modalEl.querySelectorAll("button, [href], input, select, textarea");
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
    
    // Auto-focus first button in modal
    setTimeout(() => {
      const focusables = deleteModalRef.current?.querySelectorAll("button");
      if (focusables && focusables.length > 0) {
        (focusables[0] as HTMLElement).focus();
      }
    }, 50);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleteState.isOpen]);

  // Refresh lists helper
  const refreshAlbums = () => {
    setAlbums(DbService.getAlbums());
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync albums list when searchParam changes
  useEffect(() => {
    refreshAlbums();
  }, [searchVal]);

  const handleDuplicate = (id: string) => {
    try {
      DbService.duplicateAlbum(id);
      addToast("Album collection duplicated successfully!", "success");
      refreshAlbums();
    } catch {
      addToast("Failed to duplicate album.", "error");
    }
    setActiveDropdown(null);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameState.name.trim()) return;
    try {
      DbService.updateAlbum(renameState.id, { name: renameState.name });
      addToast("Collection renamed successfully!", "success");
      setRenameState({ isOpen: false, id: "", name: "" });
      refreshAlbums();
    } catch {
      addToast("Failed to rename collection.", "error");
    }
  };

  const handleDeleteConfirm = () => {
    const targetAlbum = albums.find((a) => a.id === deleteState.id);
    if (!targetAlbum) return;

    try {
      // Remove album from DB
      DbService.deleteAlbum(targetAlbum.id);
      setDeleteState({ isOpen: false, id: "", name: "" });
      refreshAlbums();

      // Show success toast with Undo option available for 5 seconds
      addToast("Album deleted successfully.", "success", {
        label: "Undo",
        onClick: () => {
          try {
            // Restore album back to DB
            const albumsList = DbService.getAlbums();
            if (!albumsList.some((a) => a.id === targetAlbum.id)) {
              albumsList.push(targetAlbum);
              localStorage.setItem("snapflip_albums", JSON.stringify(albumsList));
            }
            
            // Dispatch storage event to update grid/stats/counts/storage immediately
            window.dispatchEvent(new Event("storage"));
            refreshAlbums();
            addToast("Album collection restored successfully!", "success");
          } catch {
            addToast("Failed to restore album.", "error");
          }
        }
      });

      // Dispatch storage event to update grid/stats/counts/storage immediately
      window.dispatchEvent(new Event("storage"));
    } catch {
      addToast("Failed to delete collection.", "error");
    }
  };

  const handlePublishConfirm = () => {
    try {
      DbService.publishAlbum(publishState.id);
      addToast("Album published successfully!", "success");
      setPublishState({ isOpen: false, id: "", name: "" });
      refreshAlbums();
    } catch {
      addToast("Failed to publish album.", "error");
    }
  };

  const handleUnpublish = (id: string) => {
    try {
      DbService.unpublishAlbum(id);
      addToast("Album unpublished and moved back to Drafts.", "success");
      refreshAlbums();
    } catch {
      addToast("Failed to unpublish album.", "error");
    }
    setActiveDropdown(null);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    addToast("Direct share link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenShare = async (album: Album) => {
    const shareUrl = `${window.location.origin}/view/${album.id}`;
    
    // Check if album settings already has QR code stored
    let qrPng = album.settings?.qrCodeDataUrl || "";
    let qrSvg = album.settings?.qrCodeSvg || "";

    if (!qrPng || !qrSvg) {
      try {
        qrPng = await QRCode.toDataURL(shareUrl, {
          margin: 1,
          width: 300,
          color: {
            dark: "#0f172a", // Elegant dark slate QR
            light: "#ffffff"
          }
        });
        
        qrSvg = await QRCode.toString(shareUrl, {
          type: "svg",
          margin: 1,
          width: 300,
          color: {
            dark: "#0f172a",
            light: "#ffffff"
          }
        });

        // Store back in the album database so it is saved and reused
        const updatedSettings = {
          ...album.settings,
          qrCodeDataUrl: qrPng,
          qrCodeSvg: qrSvg
        };
        DbService.updateAlbum(album.id, { settings: updatedSettings });
        refreshAlbums();
      } catch {
        addToast("Failed to generate QR Code.", "error");
      }
    }

    setShareState({
      isOpen: true,
      album,
      qrPng,
      qrSvg
    });
    setShareTab("link");
  };

  const handleDownloadPng = () => {
    if (!shareState.qrPng || !shareState.album) return;
    const link = document.createElement("a");
    link.href = shareState.qrPng;
    link.download = `qr-${shareState.album.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();
    addToast("QR Code PNG download started!", "success");
  };

  const handleDownloadSvg = () => {
    if (!shareState.qrSvg || !shareState.album) return;
    const blob = new Blob([shareState.qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${shareState.album.name.toLowerCase().replace(/\s+/g, "-")}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    addToast("QR Code SVG download started!", "success");
  };

  const handlePrintQR = () => {
    if (!shareState.album || !shareState.qrPng) return;
    const { name, coupleName, id } = shareState.album;
    const url = `${window.location.origin}/view/${id}`;
    const qrPng = shareState.qrPng;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      addToast("Failed to open print window. Please allow popups.", "error");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Card - ${name}</title>
          <style>
            body {
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #020617;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .qr-card {
              border: 1px solid #1e293b;
              background: #0f172a;
              border-radius: 24px;
              padding: 40px;
              max-width: 360px;
              width: 100%;
              text-align: center;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              box-sizing: border-box;
            }
            .logo {
              font-weight: 800;
              font-size: 20px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #ffffff;
              margin-bottom: 24px;
            }
            .logo span {
              color: #38bdf8;
            }
            .details {
              margin-bottom: 24px;
            }
            .album-name {
              font-size: 18px;
              font-weight: 800;
              margin: 0 0 6px 0;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .client-name {
              font-size: 12px;
              color: #94a3b8;
              margin: 0;
              font-family: monospace;
              letter-spacing: 0.1em;
            }
            .qr-wrapper {
              background: #ffffff;
              padding: 16px;
              border-radius: 16px;
              display: inline-block;
              margin-bottom: 24px;
            }
            .qr-image {
              width: 180px;
              height: 180px;
              display: block;
            }
            .scan-text {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              color: #38bdf8;
              margin-bottom: 4px;
              display: block;
            }
            .url-text {
              font-size: 9px;
              color: #64748b;
              font-family: monospace;
              margin: 0;
              word-break: break-all;
            }
            .footer {
              margin-top: 32px;
              font-size: 9px;
              font-family: monospace;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              border-top: 1px solid #1e293b;
              padding-top: 16px;
            }
            @media print {
              body {
                background: #ffffff !important;
                color: #000000 !important;
              }
              .qr-card {
                border: none !important;
                background: #ffffff !important;
                box-shadow: none !important;
                color: #000000 !important;
                max-width: 100% !important;
                padding: 0 !important;
              }
              .logo, .logo span {
                color: #000000 !important;
              }
              .client-name {
                color: #475569 !important;
              }
              .scan-text {
                color: #000000 !important;
              }
              .url-text {
                color: #475569 !important;
              }
              .footer {
                color: #475569 !important;
                border-top: 1px solid #e2e8f0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="logo">Snap<span>Flip</span></div>
            <div class="details">
              <h3 class="album-name">${name}</h3>
              <p class="client-name">${coupleName}</p>
            </div>
            <div class="qr-wrapper">
              <img class="qr-image" src="${qrPng}" />
            </div>
            <div>
              <span class="scan-text">Scan to View Album</span>
              <p class="url-text">${url}</p>
            </div>
            <div class="footer">
              Powered by SnapFlip
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addToast("QR Card Print layout opened!", "info");
  };

  const handleContinueEditing = (album: Album) => {
    // Stage draft data back to the wizard localStorage cache
    const s = album.settings;
    const wizardState = {
      step: 1, // Start them at step 1 so they can click through and verify
      details: {
        albumName: album.name,
        coupleName: album.coupleName,
        eventType: album.eventType,
        eventDate: album.eventDate,
        albumSize: s?.albumSize ?? "auto",
        customWidth: s?.customWidth ?? "",
        customHeight: s?.customHeight ?? "",
        customUnit: s?.customUnit ?? "mm",
      },
      files: album.photos,
      coverImage: album.coverImage,
      settings: {
        title: s?.title ?? "",
        description: s?.description ?? "",
        theme: s?.theme ?? "dark-luxury",
        music: s?.music ?? "none",
        visibility: s?.visibility ?? "Public",
        passcode: s?.passcode ?? "",
        watermark: s?.watermark ?? false,
        allowDownload: s?.allowDownload ?? true,
      }
    };
    localStorage.setItem("snapflip_create_album_state", JSON.stringify(wizardState));
    navigate(`/create?id=${album.id}`);
  };

  // Helper to extract size badge labels (delegates to centralised utility)
  const getBadgeLabel = (album: Album) => {
    const size = album.settings?.albumSize;
    if (!size || size === "auto") {
      return album.settings?.detectedSize || "Auto";
    }
    return getSizeBadgeLabel(size);
  };

  const getOrientationLabel = (album: Album) => {
    return getSizeOrientation(
      album.settings?.albumSize,
      album.settings?.customWidth,
      album.settings?.customHeight
    );
  };

  // Filtering
  const filteredAlbums = albums.filter((album) => {
    // Status Filter
    if (filter === "published" && album.status !== "Published") return false;
    if (filter === "drafts" && album.status !== "Draft") return false;

    // Search Filter
    if (searchVal) {
      const query = searchVal.toLowerCase();
      const matchName = album.name.toLowerCase().includes(query);
      const matchCouple = album.coupleName.toLowerCase().includes(query);
      return matchName || matchCouple;
    }
    return true;
  });

  // Sorting
  const sortedAlbums = [...filteredAlbums].sort((a, b) => {
    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === "photos-desc") {
      return b.photos.length - a.photos.length;
    }
    if (sortBy === "photos-asc") {
      return a.photos.length - b.photos.length;
    }
    // Default date-desc
    return 0; 
  });

  const totalCount = albums.length;
  const publishedCount = albums.filter((a) => a.status === "Published").length;
  const draftCount = albums.filter((a) => a.status === "Draft").length;

  return (
    <div className="space-y-6">
      {/* 1. Modals Layer */}
      {/* Rename Modal */}
      {renameState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleRenameSubmit}
            className="rounded-2xl border border-slate-900 bg-slate-950 p-6 max-w-sm w-full space-y-4 shadow-2xl shadow-sky-500/5"
          >
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Rename Collection</h3>
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">New Name</label>
              <input
                type="text"
                required
                value={renameState.name}
                onChange={(e) => setRenameState({ ...renameState, name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-900 bg-slate-900 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRenameState({ isOpen: false, id: "", name: "" })}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteState.isOpen && (() => {
        const targetAlbum = albums.find((a) => a.id === deleteState.id);
        const hasCover = !!targetAlbum?.coverImage;
        const photoCount = targetAlbum?.photos.length || 0;
        const clientName = targetAlbum?.coupleName || "Unspecified";
        const status = targetAlbum?.status || "Draft";
        const coverImg = targetAlbum?.coverImage || "";
        const gradient = targetAlbum?.gradient || "from-sky-500 to-indigo-500";

        return (
          <div 
            onClick={() => setDeleteState({ isOpen: false, id: "", name: "" })}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
          >
            <div
              ref={deleteModalRef}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl border border-rose-500/20 bg-slate-950 p-6 text-center space-y-6 max-w-sm w-full shadow-2xl shadow-rose-500/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-transparent pointer-events-none" />

              {/* Cover Preview & Metadata Card */}
              <div className="rounded-2xl border border-slate-900 bg-slate-950 overflow-hidden relative h-28 flex flex-col justify-end p-4 text-left">
                {hasCover ? (
                  <img src={coverImg} alt="Preview" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-20`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
                
                <div className="relative z-10 space-y-1">
                  <div className="flex gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-bold uppercase tracking-wider">
                      {status}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[8px] font-bold uppercase tracking-wider">
                      {photoCount} photos
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-100 uppercase tracking-wide truncate">{deleteState.name}</h4>
                  <p className="text-[9px] text-slate-500 font-mono tracking-wider truncate">Client: {clientName}</p>
                </div>
              </div>

              {/* Danger Warning Message */}
              <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Delete Collection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to delete this album? <span className="text-rose-400 font-bold block mt-1">This action cannot be undone.</span>
                </p>
              </div>

              {/* Confirmation Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setDeleteState({ isOpen: false, id: "", name: "" })}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-350 border border-slate-850 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteConfirm()}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 cursor-pointer shadow-lg shadow-rose-500/15"
                >
                  Delete Album
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Publish Confirmation Modal */}
      {publishState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="rounded-2xl border border-sky-500/25 bg-slate-950 p-6 text-center space-y-6 max-w-sm w-full shadow-2xl shadow-sky-500/5">
            <div className="mx-auto h-11 w-11 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Send className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Publish Album</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to publish <span className="text-slate-200 font-bold">"{publishState.name}"</span>? Once published, it will become available through its share link.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setPublishState({ isOpen: false, id: "", name: "" })}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishConfirm}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer"
              >
                Publish Album
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned Share & Printable QR Code Modal (P5-015) */}
      {shareState.isOpen && shareState.album && (() => {
        const shareAlbum = shareState.album;
        const shareUrl = `${window.location.origin}/view/${shareAlbum.id}`;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="rounded-3xl border border-slate-900 bg-slate-950 p-6 max-w-md w-full space-y-6 shadow-2xl shadow-sky-500/5 flex flex-col text-slate-200">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-900/60 pb-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="h-4.5 w-4.5 text-sky-400" />
                  Share & Delivery Panel
                </h3>
                <button
                  onClick={() => setShareState({ isOpen: false, album: null, qrPng: "", qrSvg: "" })}
                  className="text-slate-500 hover:text-white text-xs font-bold font-mono border border-slate-900 px-2 py-1 rounded-lg bg-slate-900/40 cursor-pointer"
                >
                  ESC
                </button>
              </div>

              {/* Tab Selectors */}
              <div className="flex border-b border-slate-900">
                <button
                  onClick={() => setShareTab("link")}
                  className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer ${
                    shareTab === "link"
                      ? "border-sky-500 text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Share Link
                </button>
                <button
                  onClick={() => setShareTab("qr")}
                  className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-widest border-b-2 transition-colors cursor-pointer ${
                    shareTab === "qr"
                      ? "border-sky-500 text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Printable QR Card
                </button>
              </div>

              {/* Tabs Content */}
              {shareTab === "link" ? (
                /* TAB 1: SHARE LINK */
                <div className="space-y-4 py-2">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Send this physical-feel presentation link directly to your client:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 h-10 px-3 rounded-lg border border-slate-900 bg-slate-900 text-xs text-slate-400 focus:outline-none font-mono"
                    />
                    <button
                      onClick={() => handleCopyLink(shareUrl)}
                      className="h-10 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      Copy Link
                    </button>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`/view/${shareAlbum.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-11 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-200 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-sky-400" />
                      Open Viewer
                    </a>
                  </div>
                </div>
              ) : (
                /* TAB 2: PRINTABLE QR CARD */
                <div className="space-y-6 py-1">
                  {/* Premium Printable Glass QR Card Preview */}
                  <div className="border border-slate-900 bg-slate-950/80 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden max-w-[280px] mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Brand header */}
                    <div className="text-white font-black text-sm tracking-tight uppercase">
                      Snap<span className="text-sky-400">Flip</span>
                    </div>

                    {/* Album details */}
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider truncate">
                        {shareAlbum.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-mono tracking-widest truncate">
                        {shareAlbum.coupleName || "Collection"}
                      </p>
                    </div>

                    {/* QR Image */}
                    <div className="h-32 w-32 mx-auto bg-white p-2.5 rounded-xl flex items-center justify-center shadow-lg border border-slate-800">
                      <img src={shareState.qrPng} alt="QR Code" className="h-full w-full object-contain" />
                    </div>

                    {/* QR Scan Instructions */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-400">Scan to View Album</span>
                      <p className="text-[7px] text-slate-500 font-mono truncate">
                        {shareUrl}
                      </p>
                    </div>

                    <div className="text-[7px] font-mono text-slate-600 uppercase tracking-widest pt-2 border-t border-slate-900/60">
                      Powered by SnapFlip
                    </div>
                  </div>

                  {/* Printable QR Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider font-mono">
                    <button
                      onClick={handleDownloadPng}
                      className="h-10 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="h-4 w-4 text-sky-400" />
                      PNG
                    </button>
                    <button
                      onClick={handleDownloadSvg}
                      className="h-10 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="h-4 w-4 text-sky-400" />
                      SVG
                    </button>
                    <button
                      onClick={() => handleCopyLink(shareUrl)}
                      className="h-10 col-span-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="h-4 w-4 text-sky-400" />
                      Copy URL
                    </button>
                    <button
                      onClick={handlePrintQR}
                      className="h-11 col-span-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Printer className="h-4 w-4" />
                      Print QR Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Header controls with Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900/60 pb-4">
        {/* Tabs filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              filter === "all"
                ? "bg-[#0B3037]/25 text-sky-400 border-sky-500/20"
                : "bg-slate-950/30 border-slate-900 text-slate-500 hover:text-slate-300"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              filter === "published"
                ? "bg-[#0B3037]/25 text-sky-400 border-sky-500/20"
                : "bg-slate-950/30 border-slate-900 text-slate-500 hover:text-slate-300"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setFilter("drafts")}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              filter === "drafts"
                ? "bg-[#0B3037]/25 text-sky-400 border-sky-500/20"
                : "bg-slate-950/30 border-slate-900 text-slate-500 hover:text-slate-300"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Sort By</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-slate-900 bg-slate-950 text-xs text-slate-300 focus:outline-none focus:border-sky-500/30 cursor-pointer font-semibold"
            >
              <option value="date-desc">Date: Newest</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
              <option value="photos-desc">Photos: High-Low</option>
              <option value="photos-asc">Photos: Low-High</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Album Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Album Card */}
        {filter !== "published" && (
          <Link
            to="/create"
            className="relative group rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-sky-500/50 p-6 flex flex-col justify-center items-center gap-3 text-center min-h-[220px] transition-all hover:scale-[1.01]"
          >
            <div className="h-12 w-12 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-sky-400 group-hover:border-sky-400/35 transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Create New Album</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[180px] mx-auto">Upload files or drag templates to begin.</p>
            </div>
          </Link>
        )}

        {sortedAlbums.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-900 rounded-2xl bg-slate-950/20">
            <Inbox className="h-10 w-10 text-slate-700 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-slate-300">No Collections Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchVal ? "No albums match your search query." : "You don't have any albums in this category."}
            </p>
          </div>
        ) : (
          sortedAlbums.map((album) => {
            const hasCoverImage = !!album.coverImage;
            const sizeLabel = getBadgeLabel(album);
            const orientationLabel = getOrientationLabel(album);
            const isDraft = album.status === "Draft";

            return (
              <div
                key={album.id}
                onClick={() => navigate(`/view/${album.id}`)}
                className="rounded-2xl border border-slate-900 bg-slate-950 overflow-hidden flex flex-col justify-between min-h-[250px] shadow-lg group hover:border-[#0B3037]/60 transition-all hover:scale-[1.01] relative cursor-pointer"
              >
                {/* Cover Image header block */}
                <div
                  className="h-28 bg-slate-900 relative p-4 flex items-start justify-between border-b border-slate-900/60 overflow-hidden"
                >
                  {hasCoverImage && (
                    <img src={album.coverImage} alt={album.name} className="absolute inset-0 h-full w-full object-cover opacity-35 group-hover:opacity-45 transition-opacity" />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent ${!hasCoverImage ? album.gradient : ""}`} />
                  
                  <div className="flex flex-col gap-1.5 relative z-10 items-start">
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase border ${
                        isDraft
                          ? "bg-slate-900 text-slate-400 border-slate-800"
                          : "bg-sky-500/10 text-sky-400 border-sky-500/25"
                      }`}>
                        {album.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase bg-[#0B3037]/45 text-sky-400 border border-sky-500/10">
                        {orientationLabel}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase bg-slate-900/80 text-slate-350 border border-slate-850 flex items-center gap-1">
                      <BookOpen className="h-2.5 w-2.5 text-sky-400" />
                      {sizeLabel}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 relative z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/view/${album.id}`);
                      }}
                      className="h-7 w-7 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="View collection presentation"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    <div className="relative" ref={activeDropdown === album.id ? dropdownRef : undefined}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === album.id ? null : album.id);
                        }}
                        className="h-7 w-7 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Actions menu"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>

                      {/* Floating actions menu */}
                      {activeDropdown === album.id && (
                        <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-slate-900 bg-slate-950 py-1.5 shadow-2xl z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/create?id=${album.id}`);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-sky-400" />
                            Edit Album
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(album.id);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 flex items-center gap-2 cursor-pointer"
                          >
                            <FolderHeart className="h-3.5 w-3.5 text-sky-400" />
                            Duplicate
                          </button>
                          {isDraft ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPublishState({ isOpen: true, id: album.id, name: album.name });
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 flex items-center gap-2 cursor-pointer"
                            >
                              <Send className="h-3.5 w-3.5 text-sky-400" />
                              Publish
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnpublish(album.id);
                              }}
                              className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 flex items-center gap-2 cursor-pointer"
                            >
                              <Inbox className="h-3.5 w-3.5 text-sky-400" />
                              Unpublish
                            </button>
                          )}
                          {!isDraft && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenShare(album);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 flex items-center gap-2 cursor-pointer"
                            >
                              <QrCode className="h-3.5 w-3.5 text-sky-400" />
                              Share / QR
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteState({ isOpen: true, id: album.id, name: album.name });
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-slate-900/60 border-t border-slate-900 mt-1 pt-2 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash className="h-3.5 w-3.5 text-rose-400" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Album details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4
                      className="text-sm font-bold text-slate-100 group-hover:text-sky-400 transition-colors truncate"
                    >
                      {album.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">Clients: {album.coupleName || "Unspecified"}</p>
                    <div className="flex items-center gap-2 text-slate-450 text-[10px] pt-1">
                      <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span>{album.photos.length} photos</span>
                    </div>
                  </div>

                  {/* Actions Row depending on Status (Draft vs Published) */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-900 mt-4 text-[10px] text-slate-500 font-mono">
                    {isDraft ? (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinueEditing(album);
                          }}
                          className="flex-grow py-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Continue Editing
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPublishState({ isOpen: true, id: album.id, name: album.name });
                          }}
                          className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-md shadow-sky-500/5"
                        >
                          <Send className="h-3 w-3" />
                          Publish
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{album.updated}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenShare(album);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-850 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-[9px] uppercase tracking-wider cursor-pointer flex items-center gap-1"
                          >
                            <QrCode className="h-3 w-3 text-sky-400" />
                            Share / QR
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
