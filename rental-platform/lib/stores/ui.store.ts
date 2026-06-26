import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ModalName =
  | "create-project"
  | "edit-project"
  | "create-unit"
  | "create-owner"
  | "create-payment"
  | "create-payout"
  | "confirm"
  | null;

interface UIState {
  isSidebarOpen: boolean;
  activeModal: ModalName;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (name: Exclude<ModalName, null>) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      activeModal: null,

      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      openModal: (name) => set({ activeModal: name }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: "rental-ui-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      // ONLY persist sidebar state — never the modal state
      partialize: (state) => ({ isSidebarOpen: state.isSidebarOpen }),
    }
  )
);
