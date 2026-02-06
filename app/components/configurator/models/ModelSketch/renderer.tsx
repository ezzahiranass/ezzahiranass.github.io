'use client';

import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { ParamValues } from '../../types';

type Mode = 'draw' | 'edit';

type ModelSketchRendererProps = {
  params: ParamValues;
};

type Params = ParamValues & {
  towerType: string;
  bevel: number;
  ghostSubdivisions: number;
  floorHeight: number;
  floors: number;
  twist: number;
  scale: number;
};

type TowerParams = {
  towerType: string;
  bevel: number;
  ghostSubdivisions: number;
  floorHeight: number;
  floors: number;
  twist: number;
  scale: number;
};

type Tower = {
  points: THREE.Vector3[];
  isClosed: boolean;
  params: TowerParams;
};

const degToRad = (deg: number) => (deg * Math.PI) / 180;

export function ModelSketchRenderer({ params }: ModelSketchRendererProps) {
  const state = params as Params;
  const [mode, setMode] = useState<Mode>('draw');
  const [isDrawing, setIsDrawing] = useState(true);
  const [tower, setTower] = useState<Tower>({
    points: [],
    isClosed: false,
    params: {
      towerType: state.towerType,
      bevel: state.bevel,
      ghostSubdivisions: Math.round(state.ghostSubdivisions ?? 10),
      floorHeight: state.floorHeight,
      floors: Math.round(state.floors),
      twist: state.twist,
      scale: state.scale,
    },
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const floorHeight = Math.max(state.floorHeight ?? 0, 0);
  const floors = Math.max(Math.round(state.floors ?? 0), 0);
  const twistFactor = Math.max(state.twist ?? 0, 0);
  const scaleFactor = Math.max(state.scale ?? 0, 0);
  const bevel = Math.max(state.bevel ?? 0, 0);
  const ghostSubdivisions = Math.max(Math.round(state.ghostSubdivisions ?? 0), 0);

  useEffect(() => {
    setTower((prev) => ({
      ...prev,
      params: {
        towerType: state.towerType,
        bevel,
        ghostSubdivisions,
        floorHeight,
        floors,
        twist: twistFactor,
        scale: scaleFactor,
      },
    }));
  }, [bevel, floorHeight, floors, ghostSubdivisions, scaleFactor, state.towerType, twistFactor]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && mode === 'draw') {
        setIsDrawing(false);
        setTower((prev) => ({
          ...prev,
          isClosed: prev.points.length > 1,
        }));
      }
    };
    const onDraw = () => {
      setTower((prev) => ({
        ...prev,
        points: [],
        isClosed: false,
      }));
      setMode('draw');
      setIsDrawing(true);
    };
    const onEdit = () => {
      setMode('edit');
      setIsDrawing(false);
    };
    const onDelete = () => {
      setTower((prev) => ({
        ...prev,
        points: [],
        isClosed: false,
      }));
      setIsDrawing(true);
      setMode('draw');
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('sketch:draw', onDraw as EventListener);
    window.addEventListener('sketch:edit', onEdit as EventListener);
    window.addEventListener('sketch:delete', onDelete as EventListener);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('sketch:draw', onDraw as EventListener);
      window.removeEventListener('sketch:edit', onEdit as EventListener);
      window.removeEventListener('sketch:delete', onDelete as EventListener);
    };
  }, [mode]);

  const addPointFromEvent = (event: ThreeEvent<PointerEvent>) => {
    const point = new THREE.Vector3();
    const hasIntersection = event.ray.intersectPlane(plane, point);
    if (!hasIntersection) return;
    setTower((prev) => ({ ...prev, points: [...prev.points, point.clone()] }));
  };

  const updatePointFromEvent = (event: ThreeEvent<PointerEvent>, index: number) => {
    const point = new THREE.Vector3();
    const hasIntersection = event.ray.intersectPlane(plane, point);
    if (!hasIntersection) return;
    setTower((prev) => ({
      ...prev,
      points: prev.points.map((existing, i) => (i === index ? point.clone() : existing)),
    }));
  };

  const handlePlanePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (mode !== 'draw' || !isDrawing) return;
    event.stopPropagation();
    addPointFromEvent(event);
  };

  const handlePlanePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (mode !== 'edit' || dragIndex === null) return;
    event.stopPropagation();
    updatePointFromEvent(event, dragIndex);
  };

  const handlePlanePointerUp = () => {
    if (dragIndex !== null) {
      setDragIndex(null);
    }
  };

  const rotatePoint = (point: THREE.Vector3, angleRad: number) => {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return new THREE.Vector3(
      point.x * cos - point.z * sin,
      point.y,
      point.x * sin + point.z * cos
    );
  };

  const baseProfilePoints = useMemo(() => {
    if (tower.points.length === 0) return [];
    if (!tower.isClosed || bevel <= 0 || tower.points.length < 3) {
      return tower.isClosed ? [...tower.points, tower.points[0]] : tower.points;
    }

    const points = tower.points.map((point) => new THREE.Vector3(point.x, point.y, point.z));
    const chamfered: THREE.Vector3[] = [];

    for (let i = 0; i < points.length; i += 1) {
      const prev = points[(i - 1 + points.length) % points.length];
      const current = points[i];
      const next = points[(i + 1) % points.length];

      const vPrev = new THREE.Vector3(prev.x - current.x, 0, prev.z - current.z);
      const vNext = new THREE.Vector3(next.x - current.x, 0, next.z - current.z);

      const lenPrev = vPrev.length();
      const lenNext = vNext.length();
      if (lenPrev < 1e-4 || lenNext < 1e-4) {
        chamfered.push(current.clone());
        continue;
      }

      const dirPrev = vPrev.clone().normalize();
      const dirNext = vNext.clone().normalize();
      const maxD = Math.min(lenPrev, lenNext) * 0.45;
      const d = bevel <= 1 ? bevel * maxD : Math.min(bevel, maxD);

      const p1 = new THREE.Vector3(
        current.x + dirPrev.x * d,
        current.y,
        current.z + dirPrev.z * d
      );
      const p2 = new THREE.Vector3(
        current.x + dirNext.x * d,
        current.y,
        current.z + dirNext.z * d
      );

      chamfered.push(p1, p2);
    }

    if (chamfered.length > 0) {
      chamfered.push(chamfered[0].clone());
    }

    return chamfered;
  }, [bevel, tower.isClosed, tower.points]);

  const baseLineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    if (baseProfilePoints.length > 0) {
      geometry.setFromPoints(baseProfilePoints);
    }
    return geometry;
  }, [baseProfilePoints]);

  const towerData = useMemo(() => {
    const basePoints = baseProfilePoints;
    if (!tower.isClosed || basePoints.length < 2 || tower.params.floors < 1) {
      return {
        sideLineGeometries: [] as THREE.BufferGeometry[],
        sideFaceGeometry: null as THREE.BufferGeometry | null,
      };
    }

    const totalTwist = 180 * tower.params.twist;
    const floorsCount = Math.max(tower.params.floors, 2);
    const ghostSegments = Math.max(tower.params.ghostSubdivisions, 0);
    const stepsPerSegment = ghostSegments + 1;
    const totalSteps = (floorsCount - 1) * stepsPerSegment;
    const totalLevels = totalSteps + 1;
    const centroid = basePoints.reduce(
      (acc, point) => new THREE.Vector3(acc.x + point.x, acc.y + point.y, acc.z + point.z),
      new THREE.Vector3(0, 0, 0)
    ).multiplyScalar(1 / basePoints.length);

    const levelPoints = Array.from({ length: totalLevels }, (_, level) => {
      const t = totalSteps === 0 ? 0 : level / totalSteps;
      const angle = degToRad(totalTwist * t);
      const scale = Math.max(1 - tower.params.scale * t, 0.05);
      const height = tower.params.floorHeight * (level / stepsPerSegment);
      return basePoints.map((point) => {
        const local = new THREE.Vector3(point.x - centroid.x, point.y, point.z - centroid.z);
        const scaled = new THREE.Vector3(local.x * scale, local.y, local.z * scale);
        const rotated = rotatePoint(scaled, angle);
        return new THREE.Vector3(
          rotated.x + centroid.x,
          rotated.y + height,
          rotated.z + centroid.z
        );
      });
    });

    const sideLineGeometries: THREE.BufferGeometry[] = [];
    for (let level = 0; level < levelPoints.length - 1; level += 1) {
      const current = levelPoints[level];
      const next = levelPoints[level + 1];
      for (let i = 0; i < current.length - 1; i += 1) {
        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints([current[i], next[i]]);
        sideLineGeometries.push(geometry);
      }
    }

    const positions: number[] = [];
    for (let level = 0; level < levelPoints.length - 1; level += 1) {
      const current = levelPoints[level];
      const next = levelPoints[level + 1];
      for (let i = 0; i < current.length - 1; i += 1) {
        const p0 = current[i];
        const p1 = current[i + 1];
        const p0t = next[i];
        const p1t = next[i + 1];
        positions.push(
          p0.x, p0.y, p0.z,
          p1.x, p1.y, p1.z,
          p1t.x, p1t.y, p1t.z,
          p0.x, p0.y, p0.z,
          p1t.x, p1t.y, p1t.z,
          p0t.x, p0t.y, p0t.z,
        );
      }
    }

    const sideFaceGeometry = new THREE.BufferGeometry();
    sideFaceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    sideFaceGeometry.computeVertexNormals();

    return {
      sideLineGeometries,
      sideFaceGeometry,
    };
  }, [tower, baseProfilePoints]);

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onPointerDown={handlePlanePointerDown}
        onPointerMove={handlePlanePointerMove}
        onPointerUp={handlePlanePointerUp}
      >
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {baseProfilePoints.length > 1 ? (
        <lineSegments geometry={baseLineGeometry}>
          <lineBasicMaterial color="#f59e0b" linewidth={2} />
        </lineSegments>
      ) : null}

      {towerData.sideLineGeometries.map((geometry, index) => (
        <lineSegments key={`side-${index}`} geometry={geometry}>
          <lineBasicMaterial color="#d1d5db" linewidth={1} transparent opacity={0.6} />
        </lineSegments>
      ))}

      {towerData.sideFaceGeometry ? (
        <mesh geometry={towerData.sideFaceGeometry}>
          <meshStandardMaterial color="#ffffff" transparent opacity={1} side={THREE.DoubleSide} />
        </mesh>
      ) : null}

      {tower.points.map((point, index) => (
        <mesh
          key={`point-${index}`}
          position={[point.x, point.y, point.z]}
          onPointerDown={(event) => {
            if (mode !== 'edit') return;
            event.stopPropagation();
            setDragIndex(index);
          }}
          onPointerUp={handlePlanePointerUp}
        >
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color={mode === 'edit' ? '#22d3ee' : '#94a3b8'} />
        </mesh>
      ))}
    </group>
  );
}
