'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls as DreiOrbitControls,
  OrthographicCamera as DreiOrthographicCamera,
  PerspectiveCamera as DreiPerspectiveCamera,
} from '@react-three/drei';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import GUI from 'lil-gui';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import type { ModelDefinition, ParamValues } from './types';
import {
  ConfiguratorThemeProvider,
} from './theme';

type ConfiguratorShellProps = {
  model: ModelDefinition;
};
type ViewPreset = 'front' | 'top' | 'side';

const HERO_EDGE_THRESHOLD_DEG = 20;
const HERO_OUTLINE_STRENGTH = 1.5;
const HERO_OUTLINE_THICKNESS = 0.2;
const HERO_OUTLINE_GLOW = 0.0;

function ZoomOnSketchCommit() {
  const { camera } = useThree();

  useEffect(() => {
    let raf = 0;
    let startTime = 0;

    const handleCommit = () => {
      if (raf) cancelAnimationFrame(raf);
      const from = camera.position.clone();
      const to = new THREE.Vector3(-50, 2, -50);
      const duration = 700;
      startTime = performance.now();

      const tick = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        camera.position.lerpVectors(from, to, eased);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        }
      };

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('sketch:commit', handleCommit as EventListener);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('sketch:commit', handleCommit as EventListener);
    };
  }, [camera]);

  return null;
}

function SceneBootstrap() {
  const { invalidate } = useThree();

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      invalidate();
    });
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [invalidate]);

  return null;
}

function SceneTheme() {
  const gridRef = useRef<THREE.GridHelper | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const materials = Array.isArray(grid.material) ? grid.material : [grid.material];
    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.18;
      material.depthWrite = false;
      material.needsUpdate = true;
    });
  }, []);

  return (
    <>
      <color attach="background" args={['#0d0f14']} />
      <fog attach="fog" args={['#0d0f14', 50, 500]} />
      <ambientLight intensity={0.6} color="#d5d8df" />
      <directionalLight
        castShadow
        color="#f5f7fc"
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
      <gridHelper
        ref={gridRef}
        args={[400, 200, '#2c313d', '#1d232d']}
        position={[0, 0, 0]}
      />
    </>
  );
}

function HouseVisualEffects() {
  const { gl, scene, camera, size } = useThree();
  const targetRef = useRef<THREE.Object3D | null>(null);
  const houseMeshCountRef = useRef(0);
  const composerRef = useRef<EffectComposer | null>(null);
  const outlinePassRef = useRef<OutlinePass | null>(null);
  const styledMeshesRef = useRef<THREE.Mesh[]>([]);
  const originalMaterialMapRef = useRef(
    new WeakMap<
      THREE.Material,
      {
        transparent: boolean;
        opacity: number;
        depthWrite: boolean;
        color?: THREE.Color;
        map?: THREE.Texture | null;
        roughness?: number;
        metalness?: number;
        emissive?: THREE.Color;
      }
    >()
  );

  const hasAncestorWithName = (object: THREE.Object3D, targetName: string) => {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (current.name === targetName) return true;
      current = current.parent;
    }
    return false;
  };
  const getAncestorAssetType = useCallback((object: THREE.Object3D) => {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (current.name.startsWith('__asset_')) {
        return current.name.replace('__asset_', '');
      }
      current = current.parent;
    }
    return null;
  }, []);
  const getMeshTypeKey = useCallback((mesh: THREE.Mesh) => {
    const assetType = getAncestorAssetType(mesh);
    if (assetType) return `asset:${assetType}`;

    const geom = mesh.geometry;
    if (geom instanceof THREE.BoxGeometry) {
      const p = geom.parameters as { width?: number; height?: number; depth?: number };
      const width = Number((p.width ?? 0).toFixed(2));
      const height = Number((p.height ?? 0).toFixed(2));
      const depth = Number((p.depth ?? 0).toFixed(2));
      return `box:${width}x${height}x${depth}`;
    }

    if (geom instanceof THREE.ExtrudeGeometry) {
      const p = geom.parameters as { options?: { depth?: number } };
      const depth = Number((p.options?.depth ?? 0).toFixed(2));
      return `extrude:${depth}`;
    }

    return geom.type || 'mesh';
  }, [getAncestorAssetType]);
  const shadeFromTypeKey = useCallback((typeKey: string) => {
    let hash = 0;
    for (let i = 0; i < typeKey.length; i += 1) {
      hash = (hash * 31 + typeKey.charCodeAt(i)) >>> 0;
    }
    const unit = (hash % 1000) / 999;
    return 0.12 + unit * 0.06;
  }, []);
  const edgeColor = '#ffffff';
  const edgeOpacity = 0.1;
  const humanColor = edgeColor;

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    const outlinePass = new OutlinePass(
      new THREE.Vector2(size.width, size.height),
      scene,
      camera
    );
    outlinePass.edgeStrength = HERO_OUTLINE_STRENGTH;
    outlinePass.edgeThickness = HERO_OUTLINE_THICKNESS;
    outlinePass.edgeGlow = HERO_OUTLINE_GLOW;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set(edgeColor);
    outlinePass.hiddenEdgeColor.set(edgeColor);
    composer.addPass(outlinePass);

    composerRef.current = composer;
    outlinePassRef.current = outlinePass;

    return () => {
      composer.dispose();
      composerRef.current = null;
      outlinePassRef.current = null;
    };
  }, [gl, scene, camera, size.width, size.height, edgeColor]);

  const syncTarget = useCallback((forceRefresh = false) => {
    const previousTarget = targetRef.current;
    const nextTarget =
      scene.getObjectByName('__house_root') ??
      scene.getObjectByName('__sketch_tower_root');
    if (previousTarget === nextTarget && !forceRefresh) return;

    styledMeshesRef.current.forEach((mesh) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        const original = originalMaterialMapRef.current.get(mat);
        if (!original) return;
        mat.transparent = original.transparent;
        mat.opacity = original.opacity;
        mat.depthWrite = original.depthWrite;
        if ('color' in mat && original.color) {
          (mat as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial).color.copy(original.color);
        }
      });
      mesh.children
        .filter((node) => node.name === '__hero_wire_overlay')
        .forEach((node) => {
          mesh.remove(node);
          const line = node as THREE.LineSegments;
          line.geometry.dispose();
          if (Array.isArray(line.material)) {
            line.material.forEach((material) => material.dispose());
          } else {
            line.material.dispose();
          }
        });
    });
    styledMeshesRef.current = [];

    targetRef.current = nextTarget;
    if (!nextTarget) {
      if (outlinePassRef.current) {
        outlinePassRef.current.selectedObjects = [];
      }
      houseMeshCountRef.current = 0;
      return;
    }

    nextTarget?.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mesh = child as THREE.Mesh;
      mesh.children
        .filter((node) => node.name === '__wireframe_overlay')
        .forEach((node) => {
          mesh.remove(node);
          const line = node as THREE.LineSegments;
          line.geometry.dispose();
          if (Array.isArray(line.material)) {
            line.material.forEach((material) => material.dispose());
          } else {
            line.material.dispose();
          }
        });
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        if (!originalMaterialMapRef.current.has(mat)) {
          const original: {
            transparent: boolean;
            opacity: number;
            depthWrite: boolean;
            color?: THREE.Color;
            map?: THREE.Texture | null;
            roughness?: number;
            metalness?: number;
            emissive?: THREE.Color;
          } = {
            transparent: mat.transparent,
            opacity: mat.opacity,
            depthWrite: mat.depthWrite,
          };
          if ('color' in mat) {
            original.color = (mat as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial).color.clone();
          }
          if ('map' in mat) {
            original.map = (mat as THREE.MeshStandardMaterial).map ?? null;
          }
          if ('roughness' in mat) {
            original.roughness = (mat as THREE.MeshStandardMaterial).roughness;
          }
          if ('metalness' in mat) {
            original.metalness = (mat as THREE.MeshStandardMaterial).metalness;
          }
          if ('emissive' in mat) {
            original.emissive = (mat as THREE.MeshStandardMaterial).emissive.clone();
          }
          originalMaterialMapRef.current.set(mat, original);
        }

        const isHuman = hasAncestorWithName(mesh, '__asset_human');
        const shade = shadeFromTypeKey(getMeshTypeKey(mesh));
        const grayColor = isHuman
          ? new THREE.Color(humanColor)
          : new THREE.Color().setScalar(shade);
        if (mat instanceof THREE.ShaderMaterial) {
          const uniforms = mat.uniforms as Record<string, { value: unknown }>;
          if (uniforms.uBaseColor?.value instanceof THREE.Color) {
            uniforms.uBaseColor.value.copy(grayColor);
          }
          if (uniforms.uAccent?.value instanceof THREE.Color) {
            uniforms.uAccent.value.copy(grayColor);
          }
          if (uniforms.uAccent2?.value instanceof THREE.Color) {
            uniforms.uAccent2.value.copy(grayColor);
          }
          if (uniforms.uAccentStrength) {
            uniforms.uAccentStrength.value = 0;
          }
          if (uniforms.uOpacity) {
            uniforms.uOpacity.value = 1;
          }
        } else {
          if ('color' in mat) {
            (mat as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial).color.copy(grayColor);
          }
          if ('map' in mat) {
            (mat as THREE.MeshStandardMaterial).map = null;
          }
          if ('roughness' in mat) {
            (mat as THREE.MeshStandardMaterial).roughness = 0.78;
          }
          if ('metalness' in mat) {
            (mat as THREE.MeshStandardMaterial).metalness = 0.04;
          }
          if ('emissive' in mat) {
            (mat as THREE.MeshStandardMaterial).emissive.set(0x000000);
          }
        }
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      });

      const skipEdgeOverlay =
        hasAncestorWithName(mesh, '__asset_awning') ||
        hasAncestorWithName(mesh, '__asset_garage_door');
      if (
        !skipEdgeOverlay &&
        mesh.geometry &&
        !mesh.children.some((node) => node.name === '__hero_wire_overlay')
      ) {
        const wireGeom = new THREE.EdgesGeometry(mesh.geometry, HERO_EDGE_THRESHOLD_DEG);
        const wireMat = new THREE.LineBasicMaterial({
          color: edgeColor,
          transparent: true,
          opacity: edgeOpacity,
          depthWrite: false,
        });
        const wireframe = new THREE.LineSegments(wireGeom, wireMat);
        wireframe.name = '__hero_wire_overlay';
        wireframe.renderOrder = 1;
        mesh.add(wireframe);
      }

      styledMeshesRef.current.push(mesh);
    });

    nextTarget?.traverse((child) => {
      if (!(child instanceof THREE.LineSegments)) return;
      if (child.name === '__hero_wire_overlay') return;
      const lineMaterials = Array.isArray(child.material) ? child.material : [child.material];
      lineMaterials.forEach((mat) => {
        if (!originalMaterialMapRef.current.has(mat)) {
          const original: {
            transparent: boolean;
            opacity: number;
            depthWrite: boolean;
            color?: THREE.Color;
            map?: THREE.Texture | null;
            roughness?: number;
            metalness?: number;
            emissive?: THREE.Color;
          } = {
            transparent: mat.transparent,
            opacity: mat.opacity,
            depthWrite: mat.depthWrite,
          };
          if ('color' in mat) {
            original.color = (mat as THREE.LineBasicMaterial).color.clone();
          }
          originalMaterialMapRef.current.set(mat, original);
        }

        if ('color' in mat) {
          (mat as THREE.LineBasicMaterial).color.set(edgeColor);
        }
        mat.transparent = true;
        mat.opacity = edgeOpacity;
        mat.depthWrite = false;
        mat.needsUpdate = true;
      });
    });

    houseMeshCountRef.current = styledMeshesRef.current.length;

    if (outlinePassRef.current) {
      outlinePassRef.current.selectedObjects = nextTarget ? [nextTarget] : [];
    }
  }, [scene, edgeColor, edgeOpacity, humanColor, shadeFromTypeKey, getMeshTypeKey]);

  useEffect(() => {
    syncTarget();
    const interval = window.setInterval(syncTarget, 400);
    return () => window.clearInterval(interval);
  }, [syncTarget]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
    outlinePassRef.current?.setSize(size.width, size.height);
  }, [size]);

  useEffect(() => {
    const originalMaterialMap = originalMaterialMapRef.current;
    return () => {
      styledMeshesRef.current.forEach((mesh) => {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          const original = originalMaterialMap.get(mat);
          if (!original) return;
          mat.transparent = original.transparent;
          mat.opacity = original.opacity;
          mat.depthWrite = original.depthWrite;
          if ('color' in mat && original.color) {
            (mat as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial).color.copy(original.color);
          }
          if ('map' in mat) {
            (mat as THREE.MeshStandardMaterial).map = original.map ?? null;
          }
          if ('roughness' in mat && typeof original.roughness === 'number') {
            (mat as THREE.MeshStandardMaterial).roughness = original.roughness;
          }
          if ('metalness' in mat && typeof original.metalness === 'number') {
            (mat as THREE.MeshStandardMaterial).metalness = original.metalness;
          }
          if ('emissive' in mat && original.emissive) {
            (mat as THREE.MeshStandardMaterial).emissive.copy(original.emissive);
          }
        });
        mesh.children
          .filter((node) => node.name === '__hero_wire_overlay')
          .forEach((node) => {
            mesh.remove(node);
            const line = node as THREE.LineSegments;
            line.geometry.dispose();
            if (Array.isArray(line.material)) {
              line.material.forEach((material) => material.dispose());
            } else {
              line.material.dispose();
            }
          });
      });
      styledMeshesRef.current = [];
      houseMeshCountRef.current = 0;
    };
  }, []);

  useFrame(() => {
    const target =
      targetRef.current ??
      scene.getObjectByName('__house_root') ??
      scene.getObjectByName('__sketch_tower_root');
    if (!targetRef.current && target) {
      syncTarget(true);
    } else if (target) {
      let meshCount = 0;
      target.traverse((child) => {
        if (child instanceof THREE.Mesh) meshCount += 1;
      });
      if (meshCount !== houseMeshCountRef.current) {
        syncTarget(true);
      }
    }
    if (outlinePassRef.current) {
      outlinePassRef.current.selectedObjects = targetRef.current ? [targetRef.current] : [];
    }
    composerRef.current?.render();
  }, 1);

  return null;
}

function CameraViewApplier({
  viewPreset,
  controlsRef,
  viewRotationYDeg,
}: {
  viewPreset: { type: ViewPreset; nonce: number } | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  viewRotationYDeg: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (!viewPreset) return;

    const target = controlsRef.current?.target.clone() ?? new THREE.Vector3(0, 0, 0);
    const distance = Math.max(camera.position.distanceTo(target), 1);
    const direction = new THREE.Vector3();

    if (viewPreset.type === 'front') direction.set(0, 0, -1);
    if (viewPreset.type === 'top') direction.set(0, 1, 0);
    if (viewPreset.type === 'side') direction.set(1, 0, 0);
    if (viewPreset.type !== 'top') {
      direction.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        THREE.MathUtils.degToRad(viewRotationYDeg)
      );
    }

    const nextPosition = target.clone().addScaledVector(direction, distance);
    const cam = camera as THREE.PerspectiveCamera | THREE.OrthographicCamera;
    cam.position.copy(nextPosition);
    cam.up.set(0, 1, 0);
    cam.lookAt(target);
    cam.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }
  }, [camera, controlsRef, viewPreset, viewRotationYDeg]);

  return null;
}

export default function ConfiguratorShell({ model }: ConfiguratorShellProps) {
  const guiRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [params, setParams] = useState<ParamValues>(() => ({ ...model.defaults }));
  const [isCanvasEnabled, setIsCanvasEnabled] = useState(false);
  const [isSketchDrawing, setIsSketchDrawing] = useState(false);
  const [orthographicEnabled, setOrthographicEnabled] = useState(true);
  const [viewPreset, setViewPreset] = useState<{ type: ViewPreset; nonce: number } | null>(null);
  const viewRotationYDeg = typeof params.rotationY === 'number' ? params.rotationY : 0;
  const cameraPosition = model.camera?.position ?? ([1, 1, 1] as [number, number, number]);
  const cameraFov = model.camera?.fov ?? 50;
  const orbitMouseButtons =
    model.id === 'model-sketch' && isSketchDrawing
      ? {
          LEFT: -1 as unknown as THREE.MOUSE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: -1 as unknown as THREE.MOUSE,
        }
      : {
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: -1 as unknown as THREE.MOUSE,
        };
  const applyViewPreset = useCallback((type: ViewPreset) => {
    setOrthographicEnabled(true);
    setViewPreset({ type, nonce: Date.now() });
  }, []);

  useEffect(() => {
    let rafA = 0;
    let rafB = 0;

    const enableCanvas = () => {
      rafA = requestAnimationFrame(() => {
        rafB = requestAnimationFrame(() => {
          setIsCanvasEnabled(true);
        });
      });
    };

    if (document.visibilityState === 'visible') {
      enableCanvas();
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        enableCanvas();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (model.id !== 'model-sketch') return undefined;

    const onDrawingState = (event: Event) => {
      const drawing = Boolean((event as CustomEvent<boolean>).detail);
      setIsSketchDrawing(drawing);
    };

    window.addEventListener('sketch:drawing', onDrawingState as EventListener);
    return () => {
      window.removeEventListener('sketch:drawing', onDrawingState as EventListener);
    };
  }, [model.id]);

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
    <div
      className="configurator-shell"
      id={`configurator-${model.id}`}
      onContextMenu={(event) => event.preventDefault()}
      onMouseDown={(event) => {
        if (event.button === 1) {
          event.preventDefault();
        }
      }}
      onAuxClick={(event) => {
        if (event.button === 1) {
          event.preventDefault();
        }
      }}
    >
      <div ref={statsRef} className="configurator-shell__stats" />
      <div ref={guiRef} className="configurator-shell__gui" />
      <div className="configurator-shell__view-presets" aria-label="Camera view presets">
        <button
          className="configurator-shell__view-button"
          type="button"
          aria-label="Front view"
          onClick={() => applyViewPreset('front')}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          className="configurator-shell__view-button"
          type="button"
          aria-label="Top view"
          onClick={() => applyViewPreset('top')}
        >
          <ChevronUp aria-hidden="true" />
        </button>
        <button
          className="configurator-shell__view-button"
          type="button"
          aria-label="Side view"
          onClick={() => applyViewPreset('side')}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <button
        className="configurator-shell__projection-toggle"
        type="button"
        aria-label={orthographicEnabled ? 'Switch to perspective camera' : 'Switch to orthographic camera'}
        onClick={() => setOrthographicEnabled((prev) => !prev)}
      >
        {orthographicEnabled ? 'ORTHO' : 'PERSP'}
      </button>
      <ConfiguratorThemeProvider>
        {isCanvasEnabled ? (
          <Canvas
            shadows
            frameloop="always"
            resize={{ scroll: true, debounce: { scroll: 0, resize: 0 } }}
          >
            {orthographicEnabled ? (
              <DreiOrthographicCamera
                makeDefault
                position={cameraPosition}
                zoom={22}
                near={0.5}
                far={10000}
              />
            ) : (
              <DreiPerspectiveCamera
                makeDefault
                position={cameraPosition}
                fov={cameraFov}
                near={0.5}
                far={10000}
              />
            )}
            <SceneBootstrap />
            <ZoomOnSketchCommit />
            <SceneTheme />
            <Suspense fallback={null}>
              {model.render(params)}
            </Suspense>
            <HouseVisualEffects />
            <CameraViewApplier
              viewPreset={viewPreset}
              controlsRef={controlsRef}
              viewRotationYDeg={viewRotationYDeg}
            />
            <DreiOrbitControls
              makeDefault
              enablePan
              enableZoom
              enableRotate
              ref={controlsRef}
              mouseButtons={orbitMouseButtons}
              maxDistance={300}
            />
          </Canvas>
        ) : null}
      </ConfiguratorThemeProvider>
    </div>
  );
}
