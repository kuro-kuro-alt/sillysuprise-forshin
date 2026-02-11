import { create } from "zustand";

export type ParticlePattern = "sphere" | "cube" | "torus" | "galaxy";

interface AppState {
  handOpenness: number; // 0 (closed) to 1 (open)
  particleColor: string;
  particlePattern: ParticlePattern;
  isFullscreen: boolean;

  // NEW: gesture flags
  isFingerHeart: boolean;
  isVSign: boolean;

  setHandOpenness: (value: number) => void;
  setParticleColor: (color: string) => void;
  setParticlePattern: (pattern: ParticlePattern) => void;
  toggleFullscreen: () => void;

  // NEW
  setIsFingerHeart: (value: boolean) => void;
  setIsVSign: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  handOpenness: 1,
  particleColor: "#00ffff",
  particlePattern: "sphere",
  isFullscreen: false,

  // NEW
  isFingerHeart: false,
  isVSign: false,

  setHandOpenness: (value) => set({ handOpenness: value }),
  setParticleColor: (color) => set({ particleColor: color }),
  setParticlePattern: (pattern) => set({ particlePattern: pattern }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  // NEW
  setIsFingerHeart: (value) => set({ isFingerHeart: value }),
  setIsVSign: (value) => set({ isVSign: value }),
}));