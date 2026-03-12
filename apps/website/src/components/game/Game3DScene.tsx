import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Bridge3DProps {
  progress?: number;
  onInteract?: () => void;
}

function BridgeSegment({ index, total, built }: { index: number; total: number; built: boolean }) {
  const x1 = -2 + (4 * index) / total;
  const x2 = -2 + (4 * (index + 1)) / total;
  const xMid = (x1 + x2) / 2;
  const y = Math.sin(((index + 0.5) / total) * Math.PI) * 0.3;
  const width = (x2 - x1) * 1.05;

  if (!built) return null;

  return (
    <mesh position={[xMid, y, 0]}>
      <boxGeometry args={[width, 0.1, 0.4]} />
      <meshStandardMaterial color="#c81919" metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

function Pillar({ x }: { x: number }) {
  return (
    <mesh position={[x, -0.25, 0]}>
      <boxGeometry args={[0.3, 0.5, 0.4]} />
      <meshStandardMaterial color="#6b5b50" roughness={0.8} />
    </mesh>
  );
}

function Water() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.75 + Math.sin(clock.elapsedTime * 0.8) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.75, 0]} rotation={[-Math.PI / 12, 0, 0]}>
      <planeGeometry args={[6, 1, 16, 4]} />
      <meshStandardMaterial
        color="#2563eb"
        transparent
        opacity={0.7}
        metalness={0.4}
        roughness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function BridgeScene({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const segCount = 20;
  const builtSegs = Math.floor(segCount * Math.min(progress / 100, 1));

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const segments = useMemo(() => {
    return Array.from({ length: segCount }, (_, i) => (
      <BridgeSegment key={i} index={i} total={segCount} built={i < builtSegs} />
    ));
  }, [builtSegs, segCount]);

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {segments}
        <Pillar x={-2.15} />
        <Pillar x={2.15} />
        <Water />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 2]} intensity={1} castShadow />
        <pointLight position={[-3, 2, 4]} intensity={0.4} color="#ff9040" />
      </group>
    </Float>
  );
}

export default function Game3DScene({ progress = 0, onInteract }: Bridge3DProps) {
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
      style={{ aspectRatio: '16/9' }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        onClick={onInteract}
        style={{ cursor: 'pointer' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <BridgeScene progress={progress} />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">Brücken Bauen</h3>
            <p className="text-white/70 text-xs">Demokratie-Lernspiel in 3D</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full px-3 py-1">
              <span className="text-white text-xs font-medium">{Math.round(progress)}% Fortschritt</span>
            </div>
          </div>
        </div>
        <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
