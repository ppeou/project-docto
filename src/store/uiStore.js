import { create } from 'zustand';

export const useUIStore = create((set) => ({
  selectedItineraryId: null,
  setSelectedItinerary: (id) => set({ selectedItineraryId: id }),

  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  isModalOpen: false,
  modalContent: null,
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
}));

