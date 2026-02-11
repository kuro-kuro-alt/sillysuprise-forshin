import { ParticleScene } from "./components/ParticleScene";
import { HandTracker } from "./components/HandTracker";
import { UIOverlay } from "./components/UIOverlay";

function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <ParticleScene />
      </div>

      {/* Logic Layer (Webcam) */}
      <HandTracker />

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <UIOverlay />
      </div>
    </div>
  );
}

export default App;
