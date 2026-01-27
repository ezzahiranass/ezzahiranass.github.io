'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ParamValues } from '../../types';
import Roof from './parts/roof';

type Params = ParamValues & {
  floors: number;
  floorHeight: number;
  groundFloorHeight: number;
  roofHeight: number;
  rotationY: number;
};

export function ModelCRenderer({ params }: { params: ParamValues }) {
  const typed = params as Params;
  const { scene } = useGLTF('/assets/city_rabat.glb');
  const rotationY = (typed.rotationY * Math.PI) / 180;
  const sizeX = 17.5;
  const baseHeight = typed.groundFloorHeight + typed.floors * typed.floorHeight;
  const totalHeight = baseHeight + typed.roofHeight;
  const sizeZ = 13.1;
  const boxEdges = useMemo(() => {
    const boxGeometry = new THREE.BoxGeometry(sizeX, baseHeight, sizeZ);
    const edges = new THREE.EdgesGeometry(boxGeometry, 30);
    boxGeometry.dispose();
    return edges;
  }, [sizeX, baseHeight, sizeZ]);

  useEffect(() => {
    return () => {
      boxEdges.dispose();
    };
  }, [boxEdges]);

  useEffect(() => {
    const overlayGroup = new THREE.Group();
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const material = child.material;
      if (Array.isArray(material)) {
        material.forEach((mat) => {
          mat.polygonOffset = true;
          mat.polygonOffsetFactor = 1;
          mat.polygonOffsetUnits = 1;
        });
      } else if (material) {
        material.polygonOffset = true;
        material.polygonOffsetFactor = 1;
        material.polygonOffsetUnits = 1;
      }

      if (child.geometry) {
        const wireGeom = new THREE.EdgesGeometry(child.geometry, 30);
        const wireMat = new THREE.LineBasicMaterial({
          color: 0x2b2b2b,
          transparent: true,
          opacity: 0.5,
        });
        const wireframe = new THREE.LineSegments(wireGeom, wireMat);
        wireframe.name = '__wireframe_overlay';
        wireframe.renderOrder = 1;
        child.add(wireframe);
      }
    });

    scene.add(overlayGroup);

    return () => {
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.children
          .filter((node) => node.name === '__wireframe_overlay')
          .forEach((node) => {
            child.remove(node);
            const line = node as THREE.LineSegments;
            line.geometry.dispose();
            if (Array.isArray(line.material)) {
              line.material.forEach((mat) => mat.dispose());
            } else {
              line.material.dispose();
            }
          });
      });
      scene.remove(overlayGroup);
    };
  }, [scene]);

  return (
    <>
      <primitive object={scene} position={[0, -0.45, 0]} />
      <mesh
        castShadow
        position={[0, baseHeight / 2, 0]}
        rotation={[0, rotationY, 0]}
      >
        <boxGeometry args={[sizeX, baseHeight, sizeZ]} />
        <meshStandardMaterial color="#d1d1d1" />
        <lineSegments geometry={boxEdges}>
          <lineBasicMaterial color={0x2b2b2b} transparent opacity={0.5} />
        </lineSegments>
      </mesh>
      <Roof
        totalHeight={totalHeight}
        roofHeight={typed.roofHeight}
        rotationY={rotationY}
      />
    </>
  );
}

useGLTF.preload('/assets/city_rabat.glb');
