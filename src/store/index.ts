import { create } from "zustand";

interface Profile {
  fullName: string;
  email: string;
  phone: string;
}

interface AppState {
  brandLogo: string | null;
  setBrandLogo: (logo: string | null) => void;
  userAvatar: string | null;
  setUserAvatar: (avatar: string | null) => void;
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

export const useAppStore = create<AppState>((set) => {
  // Migration logic (BUG-008): studioLogo -> brandLogo
  let savedBrandLogo = localStorage.getItem("brandLogo") || null;
  const oldStudioLogo = localStorage.getItem("studioLogo");
  if (oldStudioLogo && !savedBrandLogo) {
    savedBrandLogo = oldStudioLogo;
    localStorage.setItem("brandLogo", oldStudioLogo);
    localStorage.removeItem("studioLogo");
  }

  const savedUserAvatar = localStorage.getItem("userAvatar") || null;

  const savedProfileStr = localStorage.getItem("snapflip_settings_profile");
  const savedProfile = savedProfileStr ? JSON.parse(savedProfileStr) : {
    fullName: "John Doe",
    email: "john@aurastudios.com",
    phone: "+1 (555) 234-5678",
  };

  return {
    brandLogo: savedBrandLogo,
    userAvatar: savedUserAvatar,
    profile: savedProfile,
    
    setBrandLogo: (logo) => {
      if (logo) {
        localStorage.setItem("brandLogo", logo);
      } else {
        localStorage.removeItem("brandLogo");
      }
      set({ brandLogo: logo });
    },

    setUserAvatar: (avatar) => {
      if (avatar) {
        localStorage.setItem("userAvatar", avatar);
      } else {
        localStorage.removeItem("userAvatar");
      }
      set({ userAvatar: avatar });
    },

    setProfile: (newProfile) => {
      localStorage.setItem("snapflip_settings_profile", JSON.stringify(newProfile));
      set({ profile: newProfile });
    }
  };
});

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type: Toast["type"], action?: Toast["action"]) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type, action) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, type, message, action }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
