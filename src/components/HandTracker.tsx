import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useAppStore } from "../store/useAppStore";

type Landmark = { x: number; y: number; z: number };

const dist3 = (a: Landmark, b: Landmark) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);

// Finger "extended" heuristic: tip farther from wrist than PIP (works decently cross-orientation)
const isFingerExtended = (
  landmarks: Landmark[],
  tipIndex: number,
  pipIndex: number,
  wristIndex = 0,
  epsilon = 0.015,
) => {
  const wrist = landmarks[wristIndex];
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];
  return dist3(wrist, tip) > dist3(wrist, pip) + epsilon;
};

export const HandTracker = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const setHandOpenness = useAppStore((s) => s.setHandOpenness);
  const setIsFingerHeart = useAppStore((s) => s.setIsFingerHeart);
  const setIsVSign = useAppStore((s) => s.setIsVSign);

  const requestRef = useRef<number>();

  // small debouncers to reduce flicker
  const heartDebounceRef = useRef({ last: false, frames: 0 });
  const vDebounceRef = useRef({ last: false, frames: 0 });

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;

    const setupHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
        setIsLoaded(true);
        startWebcam(handLandmarker);
      } catch (error) {
        console.error("Error initializing hand landmarker:", error);
      }
    };

    setupHandLandmarker();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (handLandmarker) handLandmarker.close();
    };
  }, []);

  const startWebcam = async (landmarker: HandLandmarker) => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", () => {
        predictWebcam(landmarker);
      });
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const predictWebcam = (landmarker: HandLandmarker) => {
    if (!videoRef.current) return;

    const startTimeMs = performance.now();
    if (videoRef.current.videoWidth > 0) {
      const results = landmarker.detectForVideo(videoRef.current, startTimeMs);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0] as Landmark[];

        // --- openness (existing) ---
        const wrist = landmarks[0];
        const palmSize = dist3(landmarks[9], wrist);

        const tips = [4, 8, 12, 16, 20];
        let totalTipDistance = 0;

        tips.forEach((tipIndex) => {
          totalTipDistance += dist3(landmarks[tipIndex], wrist);
        });

        const avgTipDistance = totalTipDistance / 5;
        const ratio = avgTipDistance / palmSize;

        const minRatio = 0.9;
        const maxRatio = 2.0;

        let openness = (ratio - minRatio) / (maxRatio - minRatio);
        openness = Math.max(0, Math.min(1, openness));
        setHandOpenness(openness);

        // --- NEW: gesture detection ---
        const indexExtended = isFingerExtended(landmarks, 8, 6);
        const middleExtended = isFingerExtended(landmarks, 12, 10);
        const ringExtended = isFingerExtended(landmarks, 16, 14);
        const pinkyExtended = isFingerExtended(landmarks, 20, 18);

        // V sign: index + middle up; ring + pinky down (thumb ignored)
        const vNow = indexExtended && middleExtended && !ringExtended && !pinkyExtended;

        // Finger heart: thumb tip close to index tip; other fingers mostly down
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const thumbIndexNorm = dist3(thumbTip, indexTip) / palmSize;

        const heartNow =
          thumbIndexNorm < 0.35 && // tune if needed
          !middleExtended &&
          !ringExtended &&
          !pinkyExtended;

        // debounce ~3 frames
        const hd = heartDebounceRef.current;
        if (heartNow === hd.last) hd.frames++;
        else {
          hd.last = heartNow;
          hd.frames = 1;
        }
        if (hd.frames === 3) setIsFingerHeart(heartNow);

        const vd = vDebounceRef.current;
        if (vNow === vd.last) vd.frames++;
        else {
          vd.last = vNow;
          vd.frames = 1;
        }
        if (vd.frames === 3) setIsVSign(vNow);
      }
    }

    requestRef.current = requestAnimationFrame(() => predictWebcam(landmarker));
  };

  return (
    <div className="fixed z-50 w-32 h-24 overflow-hidden border rounded-lg bottom-4 right-4 bg-black/50 border-white/20">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
          Loading AI...
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="object-cover w-full h-full opacity-80"
      />
    </div>
  );
};