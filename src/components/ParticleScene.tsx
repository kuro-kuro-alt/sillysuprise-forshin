import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "../store/useAppStore";

const PARTICLE_COUNT = 15000;

const Particles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const { handOpenness, particleColor, particlePattern, isFingerHeart } =
    useAppStore();

  const effectivePattern = isFingerHeart ? ("heart" as const) : particlePattern;

  // NEW: force remount geometry when pattern changes
  const geometryKey = useMemo(
    () => `pattern:${effectivePattern}`,
    [effectivePattern],
  );

  // Generate positions based on pattern
  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = 0,
        y = 0,
        z = 0;

      if (effectivePattern === "heart") {
        // 2D heart curve -> extrude thickness in Z
        // x = 16 sin^3(t)
        // y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
        const t = Math.random() * Math.PI * 2;

        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy =
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          1 * Math.cos(4 * t);

        // normalize + scale
        x = (hx / 16) * 4.0 + (Math.random() - 0.5) * 0.15;
        y = (hy / 17) * 4.0 + (Math.random() - 0.5) * 0.15;
        z = (Math.random() - 0.5) * 1.2;
      } else if (particlePattern === "sphere") {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 4 * Math.cbrt(Math.random());
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      } else if (particlePattern === "cube") {
        x = (Math.random() - 0.5) * 6;
        y = (Math.random() - 0.5) * 6;
        z = (Math.random() - 0.5) * 6;
      } else if (particlePattern === "torus") {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        const R = 3;
        const r = 1;
        x = (R + r * Math.cos(v)) * Math.cos(u);
        y = (R + r * Math.cos(v)) * Math.sin(u);
        z = r * Math.sin(v);
        x += (Math.random() - 0.5) * 0.5;
        y += (Math.random() - 0.5) * 0.5;
        z += (Math.random() - 0.5) * 0.5;
      } else if (particlePattern === "galaxy") {
        const branches = 3;
        const radius = Math.random() * 5;
        const spin = radius * 2;
        const branchAngle = (i % branches) * ((Math.PI * 2) / branches);
        const randomX =
          Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
        const randomY =
          Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
        const randomZ =
          Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;

        x = Math.cos(branchAngle + spin) * radius + randomX;
        y = randomY * 2;
        z = Math.sin(branchAngle + spin) * radius + randomZ;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, [particlePattern, effectivePattern]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(particleColor) },
      uExpansion: { value: 1.0 },
      uSize: { value: 4.0 },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uColor.value.set(particleColor);
  }, [particleColor, uniforms]);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();

      const targetExpansion = 0.2 + handOpenness * 1.8;
      material.uniforms.uExpansion.value = THREE.MathUtils.lerp(
        material.uniforms.uExpansion.value,
        targetExpansion,
        0.1,
      );

      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.z += 0.0005;
    }
  });

  const vertexShader = `
    uniform float uTime;
    uniform float uExpansion;
    uniform float uSize;

    varying float vDistance;

    void main() {
      vec3 pos = position;

      // Breathing effect
      float breath = sin(uTime * 2.0 + length(pos)) * 0.1;

      // Expansion effect controlled by hand
      pos = pos * (uExpansion + breath);

      // Add some noise/movement
      pos.x += sin(uTime * 0.5 + pos.y) * 0.1;
      pos.y += cos(uTime * 0.3 + pos.x) * 0.1;
      pos.z += sin(uTime * 0.4 + pos.z) * 0.1;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Size attenuation
      gl_PointSize = uSize * (30.0 / -mvPosition.z);

      vDistance = length(pos);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    varying float vDistance;

    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;

      // Soft edge
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

      // Color variation based on distance from center
      vec3 finalColor = uColor + vDistance * 0.05;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return (
    <points ref={pointsRef} key={geometryKey}>
      <bufferGeometry key={geometryKey}>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const ParticleScene = () => {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <color attach="background" args={["#050505"]} />
        <Particles />
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
};
