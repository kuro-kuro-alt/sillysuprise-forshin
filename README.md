# YOUWARE.md

# Gesture-Based 3D Particle System

This project is a real-time interactive 3D particle system controlled by hand gestures using computer vision.

## Project Overview

- **Core Tech**: React 18, Three.js (via @react-three/fiber), MediaPipe Tasks Vision.
- **Interaction**: Webcam-based hand tracking detects "open" vs "closed" hand gestures to control particle expansion/contraction.
- **Visuals**: Custom GLSL shaders for high-performance particle rendering (15k+ particles).

## Key Features

1.  **Gesture Control**:
    - Uses MediaPipe HandLandmarker to detect hand landmarks in real-time.
    - Calculates "openness" ratio based on finger tip distances relative to palm size.
    - Controls particle expansion and breathing effects.

2.  **3D Particle Engine**:
    - **Sphere**: Particles distributed on a spherical surface.
    - **Cube**: Volumetric distribution.
    - **Torus**: Donut-shaped distribution.
    - **Galaxy**: Spiral arm distribution.
    - **Shaders**: Custom vertex/fragment shaders for performant animation and soft-particle rendering.

3.  **UI & Customization**:
    - **Pattern Selector**: Switch between different geometric formations.
    - **Color Picker**: Real-time color adjustment.
    - **Fullscreen Mode**: Immersive experience toggle.

## Development Guide

### Commands

- **Install Dependencies**: `npm install`
- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Production Build**: `npm run preview`

### Architecture

- **`src/components/ParticleScene.tsx`**: Main 3D scene. Handles geometry generation and shader updates.
  - **Note**: Uses custom GLSL shaders. Avoid redefining built-in attributes like `position` in `ShaderMaterial`.
- **`src/components/HandTracker.tsx`**: Manages webcam stream and MediaPipe inference loop. Updates global store.
- **`src/components/UIOverlay.tsx`**: HUD for user controls.
- **`src/store/useAppStore.ts`**: Zustand store for shared state (hand openness, color, pattern).

### Configuration

- **Particle Count**: Adjustable in `ParticleScene.tsx` (`PARTICLE_COUNT` constant).
- **Gesture Sensitivity**: Tunable in `HandTracker.tsx` (min/max ratio thresholds).

## Notes

- **Webcam Permissions**: The app requires camera access to function.
- **Performance**: Runs best on devices with a dedicated GPU due to the number of particles and real-time CV inference.
- **Dependencies**: Ensure `@react-three/drei` version is compatible with `@react-three/fiber`. Currently using `drei` v9.x with `fiber` v8.x.
