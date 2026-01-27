'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';
import type { ParamValues } from '../../types';
import Roof from './parts/roof';
import Floor from './parts/floor';
import GroundFloor from './parts/groundFloor';
import Overhang from './parts/overhang';
import Slab from './parts/slab';
import Coating from './parts/coating';
import Arch from './parts/arch';
import HorizontalStrips from './parts/horizontalStrips';
import VerticalStrips from './parts/verticalStrips';
import GlassRailing from './parts/glassRailing';
import WindowBig from './parts/windowBig';
import WindowSmall from './parts/windowSmall';

type Params = ParamValues & {
  floors: number;
  floorHeight: number;
  groundFloorHeight: number;
  roofHeight: number;
  rotationY: number;
  overhang: number;
  roofWallHeight: number;
  slabThickness: number;
  balconyLeft: boolean;
  balconyRight: boolean;
  balconyWidth: number;
  balconyRailing: string;
  windowWidth: number;
  stripHeight: number;
  stripSpacing: number;
};

export function ModelCRenderer({ params }: { params: ParamValues }) {
  const typed = params as Params;
  const { scene } = useGLTF('/assets/city_rabat.glb');
  const rotationY = (typed.rotationY * Math.PI) / 180;
  const sizeX = 17.5;
  const slabCount = typed.floors + 1;
  const baseHeight = typed.groundFloorHeight
    + typed.floors * typed.floorHeight
    + slabCount * typed.slabThickness;
  const totalHeight = baseHeight + typed.roofHeight;
  const sizeZ = 13.1;
  const overhangLength = typed.overhang;
  const overhangZ = -sizeZ / 2 - overhangLength / 2;
  const coatingThickness = 0.1;
  const coatingZ = -sizeZ / 2 - typed.overhang - coatingThickness / 2;
  const coatingHeight = typed.floors * typed.floorHeight
    + typed.floors * typed.slabThickness
    + typed.roofWallHeight;
  const coatingY = typed.groundFloorHeight + coatingHeight / 2;
  const balconyLeft = typed.balconyLeft ? typed.balconyWidth : 0;
  const balconyRight = typed.balconyRight ? typed.balconyWidth : 0;
  const overhangWidth = Math.max(sizeX - balconyLeft - balconyRight, 0.1);
  const overhangX = (balconyRight - balconyLeft) / 2;
  const coatingSegmentWidth = Math.max((overhangWidth - 2 * typed.windowWidth) / 3, 0.1);
  const coatingX1 = -overhangWidth / 2 + coatingSegmentWidth / 2;
  const coatingX2 = coatingX1 + coatingSegmentWidth + typed.windowWidth;
  const coatingX3 = coatingX2 + coatingSegmentWidth + typed.windowWidth;
  const archThickness = coatingThickness;
  const archWidth = typed.windowWidth;
  const archHeight = typed.floorHeight + typed.slabThickness;
  const archGapX1 = coatingX1 + coatingSegmentWidth / 2 + typed.windowWidth / 2;
  const archGapX2 = coatingX2 + coatingSegmentWidth / 2 + typed.windowWidth / 2;
  const archBalconyXLeft = -sizeX / 2 + typed.balconyWidth / 2;
  const archBalconyXRight = sizeX / 2 - typed.balconyWidth / 2;
  const balconyArchCount = typed.balconyWidth > 2.5 ? 2 : 1;
  const balconyArchGap = 0;
  const balconyArchWidth = balconyArchCount === 1
    ? Math.max(typed.balconyWidth - 0.1, 0.2)
    : Math.max((typed.balconyWidth - balconyArchGap) / 2, 0.2);
  const balconyArchOffsets = balconyArchCount === 1
    ? [0]
    : [-(balconyArchWidth / 2 + balconyArchGap / 2), (balconyArchWidth / 2 + balconyArchGap / 2)];
  const slabLength = sizeZ + typed.overhang;
  const slabOffsetZ = -typed.overhang / 2;
  const stripThickness = typed.stripHeight;
  const stripSpacing = typed.stripSpacing;
  const railingThickness = 0.05;
  const railingHeight = 0.9;
  const railingZ = overhangZ - overhangLength / 2 + railingThickness / 2;
  const windowZ = -sizeZ / 2 - typed.overhang + 0.02;
  const balconyWindowZ = -sizeZ / 2 + 0.02;
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
      <GroundFloor
        width={sizeX}
        length={sizeZ}
        height={typed.groundFloorHeight}
        rotationY={rotationY}
      />
      {Array.from({ length: typed.floors }).map((_, index) => {
        const slabBaseY = typed.groundFloorHeight
          + index * (typed.floorHeight + typed.slabThickness);
        const floorBaseY = slabBaseY + typed.slabThickness;
        const floorBalconyWall = typed[`balconyWall_${index}`] !== false;
        const floorBalconyCoating = (typed[`balconyCoating_${index}`] as string | undefined) ?? 'None';
        const floorWindowCoating = (typed[`windowCoating_${index}`] as string | undefined) ?? 'None';
        const floorWindowType = (typed[`windowType_${index}`] as string | undefined) ?? 'Big';
        const railingY = slabBaseY + typed.slabThickness + railingHeight / 2;

        return (
        <group key={`floor-${index}`}>
          <Floor
            y={floorBaseY + typed.floorHeight / 2}
            z={0}
            width={sizeX}
            length={sizeZ}
            height={typed.floorHeight}
            rotationY={rotationY}
          />
          <Overhang
            y={floorBaseY + typed.floorHeight / 2}
            x={overhangX}
            z={overhangZ}
            width={overhangWidth}
            fullWidth={sizeX}
            length={overhangLength}
            height={typed.floorHeight}
            rotationY={rotationY}
            balconyLeft={typed.balconyLeft}
            balconyRight={typed.balconyRight}
            balconyWall={floorBalconyWall}
          />
          {typed.balconyRailing === 'Glass' && typed.balconyLeft ? (
            <GlassRailing
              x={archBalconyXRight}
              y={railingY}
              z={railingZ}
              width={typed.balconyWidth}
              thickness={railingThickness}
              rotationY={rotationY}
            />
          ) : null}
          {typed.balconyRailing === 'Glass' && typed.balconyRight ? (
            <GlassRailing
              x={archBalconyXLeft}
              y={railingY}
              z={railingZ}
              width={typed.balconyWidth}
              thickness={railingThickness}
              rotationY={rotationY}
            />
          ) : null}
          <Slab
            y={slabBaseY + typed.slabThickness / 2 + 0.01}
            z={slabOffsetZ}
            width={sizeX}
            length={slabLength}
            height={typed.slabThickness}
            rotationY={rotationY}
          />
          {floorWindowType === 'Big' ? (
            <>
              <WindowBig
                x={overhangX + archGapX1}
                y={slabBaseY + archHeight / 2}
                z={windowZ}
                width={archWidth}
                height={archHeight}
                rotationY={rotationY}
              />
              <WindowBig
                x={overhangX + archGapX2}
                y={slabBaseY + archHeight / 2}
                z={windowZ}
                width={archWidth}
                height={archHeight}
                rotationY={rotationY}
              />
              {typed.balconyLeft ? (
                <WindowBig
                  x={archBalconyXRight}
                  y={slabBaseY + archHeight / 2}
                  z={balconyWindowZ}
                  width={typed.balconyWidth}
                  height={archHeight}
                  rotationY={rotationY}
                />
              ) : null}
              {typed.balconyRight ? (
                <WindowBig
                  x={archBalconyXLeft}
                  y={slabBaseY + archHeight / 2}
                  z={balconyWindowZ}
                  width={typed.balconyWidth}
                  height={archHeight}
                  rotationY={rotationY}
                />
              ) : null}
            </>
          ) : null}
          {floorWindowType === 'Small' ? (
            <>
              <WindowSmall
                x={overhangX + archGapX1}
                y={slabBaseY + archHeight / 2}
                z={windowZ}
                rotationY={rotationY}
              />
              <WindowSmall
                x={overhangX + archGapX2}
                y={slabBaseY + archHeight / 2}
                z={windowZ}
                rotationY={rotationY}
              />
              {typed.balconyLeft ? (
                <WindowSmall
                  x={archBalconyXRight}
                  y={slabBaseY + archHeight / 2}
                  z={balconyWindowZ}
                  rotationY={rotationY}
                />
              ) : null}
              {typed.balconyRight ? (
                <WindowSmall
                  x={archBalconyXLeft}
                  y={slabBaseY + archHeight / 2}
                  z={balconyWindowZ}
                  rotationY={rotationY}
                />
              ) : null}
            </>
          ) : null}
          {floorWindowCoating === 'Arch' ? (
            <>
              <Arch
                x={overhangX + archGapX1}
                y={slabBaseY + archHeight / 2}
                z={coatingZ}
                width={archWidth}
                height={archHeight}
                thickness={archThickness}
                rotationY={rotationY}
              />
              <Arch
                x={overhangX + archGapX2}
                y={slabBaseY + archHeight / 2}
                z={coatingZ}
                width={archWidth}
                height={archHeight}
                thickness={archThickness}
                rotationY={rotationY}
              />
            </>
          ) : null}
          {floorWindowCoating === 'Horizontal Strips' ? (
            <>
              <HorizontalStrips
                x={overhangX + archGapX1}
                y={slabBaseY + archHeight / 2}
                z={coatingZ}
                width={archWidth}
                height={archHeight}
                thickness={stripThickness}
                spacing={stripSpacing}
                rotationY={rotationY}
              />
              <HorizontalStrips
                x={overhangX + archGapX2}
                y={slabBaseY + archHeight / 2}
                z={coatingZ}
                width={archWidth}
                height={archHeight}
                thickness={stripThickness}
                spacing={stripSpacing}
                rotationY={rotationY}
              />
            </>
          ) : null}
          {floorWindowCoating === 'Vertical Strips' ? (
            <>
              <VerticalStrips
                x={overhangX + archGapX1}
                y={slabBaseY + archHeight / 2}
                z={coatingZ}
                width={archWidth}
                height={archHeight}
                thickness={stripThickness}
                spacing={stripSpacing}
                rotationY={rotationY}
              />
              <VerticalStrips
                x={overhangX + archGapX2}
                y={slabBaseY + archHeight / 2}
                z={coatingZ}
                width={archWidth}
                height={archHeight}
                thickness={stripThickness}
                spacing={stripSpacing}
                rotationY={rotationY}
              />
            </>
          ) : null}
          {floorBalconyCoating === 'Arch' && typed.balconyLeft
            ? balconyArchOffsets.map((offset) => (
              <Arch
                key={`balcony-left-${index}-${offset}`}
                x={archBalconyXRight + offset}
                y={slabBaseY + archHeight / 2}
                z={coatingZ}
                width={balconyArchWidth}
                height={archHeight}
                thickness={archThickness}
                rotationY={rotationY}
              />
            ))
            : null}
          {floorBalconyCoating === 'Horizontal Strips' && typed.balconyLeft ? (
            <HorizontalStrips
              x={archBalconyXRight}
              y={slabBaseY + archHeight / 2}
              z={coatingZ}
              width={typed.balconyWidth}
              height={archHeight}
              thickness={stripThickness}
              spacing={stripSpacing}
              rotationY={rotationY}
            />
          ) : null}
          {floorBalconyCoating === 'Vertical Strips' && typed.balconyLeft ? (
            <VerticalStrips
              x={archBalconyXRight}
              y={slabBaseY + archHeight / 2}
              z={coatingZ}
              width={typed.balconyWidth}
              height={archHeight}
              thickness={stripThickness}
              spacing={stripSpacing}
              rotationY={rotationY}
            />
          ) : null}
          {floorBalconyCoating === 'Arch' && typed.balconyRight
            ? balconyArchOffsets.map((offset) => (
              <Arch
                key={`balcony-right-${index}-${offset}`}
                x={archBalconyXLeft + offset}
                y={slabBaseY + archHeight / 2}
                z={coatingZ}
                width={balconyArchWidth}
                height={archHeight}
                thickness={archThickness}
                rotationY={rotationY}
              />
            ))
            : null}
          {floorBalconyCoating === 'Horizontal Strips' && typed.balconyRight ? (
            <HorizontalStrips
              x={archBalconyXLeft}
              y={slabBaseY + archHeight / 2}
              z={coatingZ}
              width={typed.balconyWidth}
              height={archHeight}
              thickness={stripThickness}
              spacing={stripSpacing}
              rotationY={rotationY}
            />
          ) : null}
          {floorBalconyCoating === 'Vertical Strips' && typed.balconyRight ? (
            <VerticalStrips
              x={archBalconyXLeft}
              y={slabBaseY + archHeight / 2}
              z={coatingZ}
              width={typed.balconyWidth}
              height={archHeight}
              thickness={stripThickness}
              spacing={stripSpacing}
              rotationY={rotationY}
            />
          ) : null}
        </group>
        );
      })}
      <Coating
        y={coatingY}
        x={overhangX + coatingX1}
        z={coatingZ}
        width={coatingSegmentWidth}
        length={coatingThickness}
        height={coatingHeight}
        rotationY={rotationY}
      />
      <Coating
        y={coatingY}
        x={overhangX + coatingX2}
        z={coatingZ}
        width={coatingSegmentWidth}
        length={coatingThickness}
        height={coatingHeight}
        rotationY={rotationY}
      />
      <Coating
        y={coatingY}
        x={overhangX + coatingX3}
        z={coatingZ}
        width={coatingSegmentWidth}
        length={coatingThickness}
        height={coatingHeight}
        rotationY={rotationY}
      />
      <Slab
        y={
          typed.groundFloorHeight
          + typed.floors * typed.floorHeight
          + typed.floors * typed.slabThickness
          + typed.slabThickness / 2
        }
        z={slabOffsetZ}
        width={sizeX}
        length={slabLength}
        height={typed.slabThickness}
        rotationY={rotationY}
      />
      <Roof
        totalHeight={totalHeight}
        roofHeight={typed.roofHeight}
        rotationY={rotationY}
        sizeX={sizeX}
        sizeZ={sizeZ}
        overhang={typed.overhang}
        roofWallHeight={typed.roofWallHeight}
      />
    </>
  );
}

useGLTF.preload('/assets/city_rabat.glb');
