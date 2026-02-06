'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { ParamValues } from '../../types';

type Params = ParamValues & {
  width: number;
  height: number;
  depth: number;
  elevation: number;
  segments: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  wireframe: boolean;
  showShadow: boolean;
  color: string;
  roughness: number;
  metalness: number;
};

type ModelCubeRendererProps = {
  params: ParamValues;
};

export function ModelCubeRenderer({ params }: ModelCubeRendererProps) {
  const state = params as Params;
  const shadowMaterial = useMemo(() => new THREE.ShadowMaterial({
    color: '#000000',
    opacity: 0.25,
  }), []);

  return (
    <group>
      {state.showShadow ? (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]}>
          <planeGeometry args={[200, 200]} />
          <primitive object={shadowMaterial} />
        </mesh>
      ) : null}
      <mesh
        castShadow
        position={[0, state.height / 2 + state.elevation, 0]}
        rotation={[state.rotationX, state.rotationY, state.rotationZ]}
      >
        <boxGeometry args={[
          state.width,
          state.height,
          state.depth,
          state.segments,
          state.segments,
          state.segments,
        ]}
        />
        <meshStandardMaterial
          color={state.color}
          wireframe={state.wireframe}
          roughness={state.roughness}
          metalness={state.metalness}
        />
      </mesh>
    </group>
  );
}
