'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import GUI from 'lil-gui';
import * as THREE from 'three';
import type { ModelDefinition, ParamValues } from './types';

type ConfiguratorShellProps = {
  model: ModelDefinition;
};

export default function ConfiguratorShell({ model }: ConfiguratorShellProps) {
  const guiRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [params, setParams] = useState<ParamValues>(() => ({ ...model.defaults }));
  const cameraPosition = model.camera?.position ?? ([1, 1, 1] as [number, number, number]);
  const cameraFov = model.camera?.fov ?? 50;

  useEffect(() => {
    setParams({ ...model.defaults });
  }, [model]);

  useEffect(() => {
    if (!guiRef.current) return undefined;

    const gui = new GUI({ container: guiRef.current, width: 240, title: model.name });
    const statsGui = model.buildStats && statsRef.current
      ? new GUI({ container: statsRef.current, width: 240, title: 'Stats' })
      : null;

    const state: ParamValues = { ...model.defaults };
    const onChange = (next: ParamValues) => setParams({ ...next });

    model.buildGui(gui, state, onChange);
    if (statsGui && model.buildStats) {
      model.buildStats(statsGui, state, onChange);
    }

    return () => {
      gui.destroy();
      statsGui?.destroy();
    };
  }, [model]);

  return (
    <div className="relative h-128 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)]">
      <div ref={statsRef} className="absolute left-3 top-3 z-10" />
      <div
        ref={guiRef}
        className="absolute right-3 top-3 z-10 max-h-[calc(100%-24px)] overflow-auto"
      />
      <Canvas
        shadows
        camera={{
          position: cameraPosition,
          fov: cameraFov,
          near: 0.5,
          far: 10000,
        }}
      >
        <color attach="background" args={['#3f3f3f']} />
        <fog attach="fog" args={['#3f3f3f', 50, 500]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          castShadow
          intensity={1.0}
          position={[3, 5, 2]}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.1}
          shadow-camera-far={20}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />
        <gridHelper args={[400, 200, 0x5a5a5a, 0x2a2a2a]} position={[0, 0, 0]} />
        {model.render(params)}
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom
          enableRotate
          mouseButtons={{
            LEFT: THREE.MOUSE.NONE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
          maxDistance={300}
        />
      </Canvas>
    </div>
  );
}
