import { create } from 'zustand';

interface UiState {
  // Textarea state
  messageInput: string;
  isTextareaFocused: boolean;

  // Optional UI flags
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;

  // Actions
  setMessageInput: (value: string) => void;
  clearMessageInput: () => void;
  setTextareaFocused: (focused: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  // Initial state
  messageInput: '',
  isTextareaFocused: false,
  isSidebarCollapsed: false,
  isDarkMode: false,

  // Actions
  setMessageInput: (value: string) => {
    set({ messageInput: value });
  },

  clearMessageInput: () => {
    set({ messageInput: '' });
  },

  setTextareaFocused: (focused: boolean) => {
    set({ isTextareaFocused: focused });
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ isSidebarCollapsed: collapsed });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  },

  setDarkMode: (enabled: boolean) => {
    set({ isDarkMode: enabled });
  },

  toggleDarkMode: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }));
  },
}));