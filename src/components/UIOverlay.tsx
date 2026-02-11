import { useState } from "react";
import { useAppStore, type ParticlePattern } from "../store/useAppStore";
import {
  Maximize,
  Minimize,
  Box,
  Circle,
  Disc,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";

export const UIOverlay = () => {
  const {
    particlePattern,
    setParticlePattern,
    particleColor,
    setParticleColor,
    handOpenness,
    isFullscreen,
    toggleFullscreen,
    isVSign,
    isFingerHeart,
  } = useAppStore();

  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const patterns: { id: ParticlePattern; icon: any; label: string }[] = [
    { id: "sphere", icon: Circle, label: "Sphere" },
    { id: "cube", icon: Box, label: "Cube" },
    { id: "torus", icon: Disc, label: "Torus" },
    { id: "galaxy", icon: Sparkles, label: "Galaxy" },
  ];

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    toggleFullscreen();
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none sm:p-6">
      {/* Center message for V sign */}
      {isVSign && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-6 py-3 border rounded-2xl bg-black/40 border-white/10 backdrop-blur-md">
            <span className="text-white font-semibold tracking-[0.25em]">
              I LOVE U
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between pointer-events-auto">
        <div className="pr-2">
          <h1 className="text-xl font-bold tracking-wider text-white sm:text-2xl">
            PARTICLE<span className="text-cyan-400">FLOW</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Gesture-Controlled 3D System
          </p>

          <p className="mt-1 text-[11px] sm:text-xs text-white/40">
            Finger heart:{" "}
            <span className={isFingerHeart ? "text-pink-400" : "text-white/20"}>
              {isFingerHeart ? "ON" : "OFF"}
            </span>
            {" · "}
            V sign:{" "}
            <span className={isVSign ? "text-cyan-300" : "text-white/20"}>
              {isVSign ? "ON" : "OFF"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile: toggle panel button */}
          <button
            onClick={() => setIsMobilePanelOpen((v) => !v)}
            className="p-2 text-white transition-colors rounded-lg pointer-events-auto sm:hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            aria-label="Toggle settings"
          >
            {isMobilePanelOpen ? <X size={20} /> : <SlidersHorizontal size={20} />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-2 text-white transition-colors rounded-lg pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile backdrop (tap to close) */}
      {isMobilePanelOpen && (
        <button
          className="absolute inset-0 pointer-events-auto sm:hidden bg-black/40"
          onClick={() => setIsMobilePanelOpen(false)}
          aria-label="Close settings backdrop"
        />
      )}

      {/* Controls */}
      <div
        className={[
          "pointer-events-auto",
          // Desktop: keep current layout
          "sm:flex sm:flex-col sm:gap-4 sm:max-w-xs",
          // Mobile: bottom-sheet style, hidden unless opened
          "sm:static sm:translate-y-0",
          "fixed left-3 right-3 bottom-3",
          isMobilePanelOpen ? "block" : "hidden sm:block",
        ].join(" ")}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex flex-col gap-4 max-h-[45vh] overflow-auto rounded-xl">
          {/* Hand Status */}
          <div className="p-4 border bg-black/40 backdrop-blur-md rounded-xl border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">
                Gesture Control
              </span>
              <span className="font-mono text-xs text-cyan-400">
                {Math.round(handOpenness * 100)}%
              </span>
            </div>
            <div className="w-full h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full transition-all duration-100 ease-out bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${handOpenness * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/40">
              Open/Close hand to expand/contract
            </p>
          </div>

          {/* Pattern Selector */}
          <div className="p-4 border bg-black/40 backdrop-blur-md rounded-xl border-white/10">
            <span className="block mb-3 text-sm font-medium text-white/80">
              Pattern
            </span>
            <div className="grid grid-cols-2 gap-2">
              {patterns.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setParticlePattern(p.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-all ${
                    particlePattern === p.id
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <p.icon size={16} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="p-4 border bg-black/40 backdrop-blur-md rounded-xl border-white/10">
            <span className="block mb-3 text-sm font-medium text-white/80">
              Color Tone
            </span>
            <div className="flex items-center gap-3">
              <div className="relative w-full h-10 overflow-hidden border rounded-lg border-white/20">
                <input
                  type="color"
                  value={particleColor}
                  onChange={(e) => setParticleColor(e.target.value)}
                  className="absolute -top-2 -left-2 w-[120%] h-[150%] cursor-pointer p-0 border-0"
                />
              </div>
              <span className="font-mono text-xs uppercase text-white/60">
                {particleColor}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};