"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { assetPath } from "../../lib/assetPath";

// Loaded on demand (next/dynamic) when the visitor opens the book viewer, so
// three-stdlib's FBXLoader, Book.fbx and the page textures stay off the boot path.

export type BookViewerCanvasProps = {
  currentPageIndex: number;
  resetKey: number;
  active: boolean;
  onActionsReady: (playAction: (actionName: string) => void) => void;
  onDefaultChange: (isDefault: boolean) => void;
};

// The FBX references its own PNG textures (cover/back/page, ~5 MB). Every one of
// them is replaced by our page textures right after load, so serve a 1px stand-in.
const BLANK_TEXTURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

const pageTexturePath = (name: string | number) => assetPath(`/pdf-pages/${name}.webp`);

function CameraController({ resetKey }: { resetKey: number }) {
  const get = useThree((state) => state.get);

  useEffect(() => {
    const { camera } = get();
    camera.position.set(0, 50, 0);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 1, 0);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 25;
      camera.updateProjectionMatrix();
    }
  }, [get, resetKey]);

  return null;
}

function LimitedOrbitControls({
  resetKey,
  onDefaultChange,
}: {
  resetKey: number;
  onDefaultChange: (isDefault: boolean) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const panBoundsRef = useRef({ minX: -7, maxX: 7, minY: -7, maxY: 7, minZ: -7, maxZ: 7 });
  const defaultTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const defaultDirectionRef = useRef(
    new THREE.Spherical().setFromVector3(new THREE.Vector3(0, 50, 0))
  );
  const lastDefaultStateRef = useRef<boolean | null>(null);
  const scratch = useMemo(
    () => ({ direction: new THREE.Vector3(), spherical: new THREE.Spherical() }),
    []
  );

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    controlsRef.current.saveState();
    controlsRef.current.reset();
  }, [resetKey]);

  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: -1 as unknown as THREE.MOUSE,
    };
  }, []);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const { minX, maxX, minY, maxY, minZ, maxZ } = panBoundsRef.current;
    const target = controls.target;

    const clampedX = Math.min(Math.max(target.x, minX), maxX);
    const clampedY = Math.min(Math.max(target.y, minY), maxY);
    const clampedZ = Math.min(Math.max(target.z, minZ), maxZ);

    if (clampedX !== target.x || clampedY !== target.y || clampedZ !== target.z) {
      const deltaX = clampedX - target.x;
      const deltaY = clampedY - target.y;
      const deltaZ = clampedZ - target.z;

      target.set(clampedX, clampedY, clampedZ);
      controls.object.position.x += deltaX;
      controls.object.position.y += deltaY;
      controls.object.position.z += deltaZ;
      controls.update();
    }

    const position = controls.object.position as THREE.Vector3;
    const targetDistance = target.distanceTo(defaultTargetRef.current);
    scratch.direction.copy(position).sub(target);
    scratch.spherical.setFromVector3(scratch.direction);
    const defaultSpherical = defaultDirectionRef.current;
    const angleEpsilon = 0.002;
    const thetaMatch = Math.abs(scratch.spherical.theta - defaultSpherical.theta) < angleEpsilon;
    const phiMatch = Math.abs(scratch.spherical.phi - defaultSpherical.phi) < angleEpsilon;
    const isDefault = targetDistance < 0.01 && thetaMatch && phiMatch;
    if (lastDefaultStateRef.current !== isDefault) {
      lastDefaultStateRef.current = isDefault;
      onDefaultChange(isDefault);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      minDistance={15}
      maxDistance={60}
      dampingFactor={0.08}
      enableDamping
    />
  );
}

function BookModel({
  currentPageIndex,
  onActionsReady,
}: {
  currentPageIndex: number;
  onActionsReady: (playAction: (actionName: string) => void) => void;
}) {
  const fbx = useLoader(FBXLoader, assetPath("/assets/Book.fbx"), (loader) => {
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => (url.includes(".fbm/") ? BLANK_TEXTURE : url));
    loader.manager = manager;
    loader.setResourcePath(assetPath("/assets/Book.fbm/"));
  });
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const initializedRef = useRef(false);
  const pageMaterialsRef = useRef<{
    leftMesh: THREE.Mesh | null;
    rightMesh: THREE.Mesh | null;
    leftIndex: number;
    rightIndex: number;
  }>({ leftMesh: null, rightMesh: null, leftIndex: -1, rightIndex: -1 });
  const pageTexturesRef = useRef<THREE.Texture[]>([]);

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const cover = loader.load(pageTexturePath("Cover"));
    const back = loader.load(pageTexturePath("back"));

    for (const texture of [cover, back]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.flipY = true;
    }
    return { cover, back, loader };
  }, []);

  const assignTextureToMaterial = useCallback(
    (texture: THREE.Texture, mesh: THREE.Mesh, index: number) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;

      const pageMat = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, toneMapped: false });

      if (Array.isArray(mesh.material)) {
        const next = [...mesh.material];
        next[index]?.dispose();
        next[index] = pageMat;
        mesh.material = next;
      } else {
        mesh.material.dispose();
        mesh.material = pageMat;
      }
    },
    []
  );

  const loadPageTextures = useCallback(
    (pageIndex: number) => {
      const leftPageNum = pageIndex * 2 + 1;
      const rightPageNum = pageIndex * 2 + 2;
      const { leftMesh, rightMesh, leftIndex, rightIndex } = pageMaterialsRef.current;

      const load = (pageNum: number) =>
        new Promise<THREE.Texture | null>((resolve) => {
          textures.loader.load(
            pageTexturePath(pageNum),
            (texture) => {
              texture.wrapS = THREE.ClampToEdgeWrapping;
              texture.wrapT = THREE.ClampToEdgeWrapping;
              texture.flipY = true;
              resolve(texture);
            },
            undefined,
            () => resolve(null)
          );
        });

      Promise.all([load(leftPageNum), load(rightPageNum)]).then(([leftTexture, rightTexture]) => {
        // free the previous spread's textures (GPU memory) before swapping in the new ones
        for (const old of pageTexturesRef.current) old.dispose();
        pageTexturesRef.current = [leftTexture, rightTexture].filter(Boolean) as THREE.Texture[];
        if (leftTexture && leftMesh) assignTextureToMaterial(leftTexture, leftMesh, leftIndex);
        if (rightTexture && rightMesh) assignTextureToMaterial(rightTexture, rightMesh, rightIndex);
      });
    },
    [assignTextureToMaterial, textures]
  );

  useEffect(() => {
    if (!fbx || initializedRef.current) return;
    initializedRef.current = true;

    const box = new THREE.Box3().setFromObject(fbx);
    const center = box.getCenter(new THREE.Vector3());
    fbx.position.sub(center);

    fbx.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const mesh = object as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      materials.forEach((material, index) => {
        const name = material.name || "";
        if (name.includes("CoverMaterial")) assignTextureToMaterial(textures.cover, mesh, index);
        if (name.includes("BackMaterial")) assignTextureToMaterial(textures.back, mesh, index);
        if (name.includes("LeftPageMaterial")) {
          pageMaterialsRef.current.leftMesh = mesh;
          pageMaterialsRef.current.leftIndex = index;
        }
        if (name.includes("RightPageMaterial")) {
          pageMaterialsRef.current.rightMesh = mesh;
          pageMaterialsRef.current.rightIndex = index;
        }
      });
    });

    if (fbx.animations && fbx.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(fbx);
      mixerRef.current = mixer;
      fbx.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce, 0);
        action.clampWhenFinished = true;
        actionsRef.current.set(clip.name, action);
        actionsRef.current.set(clip.name.replace(/^Book Armature\|/, ""), action);
      });
    }

    loadPageTextures(currentPageIndex);

    onActionsReady((actionName: string) => {
      const action = actionsRef.current.get(actionName);
      if (!action || !mixerRef.current) return;
      mixerRef.current.stopAllAction();
      action.reset();
      action.enabled = true;
      action.setLoop(THREE.LoopOnce, 0);
      action.clampWhenFinished = true;
      action.setEffectiveTimeScale(1);
      action.setEffectiveWeight(1);
      action.fadeIn(0.15);
      action.play();
    });
  }, [fbx, assignTextureToMaterial, textures, onActionsReady, currentPageIndex, loadPageTextures]);

  useEffect(() => {
    if (!initializedRef.current) return;
    loadPageTextures(currentPageIndex);
  }, [currentPageIndex, loadPageTextures]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive object={fbx} />;
}

export default function BookViewerCanvas({
  currentPageIndex,
  resetKey,
  active,
  onActionsReady,
  onDefaultChange,
}: BookViewerCanvasProps) {
  const sceneBackground = useMemo(
    () => getComputedStyle(document.documentElement).getPropertyValue("--surface-canvas").trim(),
    []
  );

  return (
    <Canvas
      camera={{ position: [0, 50, 0], fov: 25 }}
      dpr={[1, 1.5]}
      // Paused while the viewer is scrolled off screen.
      frameloop={active ? "always" : "never"}
      resize={{ scroll: false }}
    >
      <Suspense fallback={null}>
        {sceneBackground ? <color attach="background" args={[sceneBackground]} /> : null}
        <CameraController resetKey={resetKey} />
        <ambientLight intensity={0.7} />
        <hemisphereLight intensity={0.6} color={0xffffff} groundColor={0x2b3138} />
        <directionalLight position={[10, 12, 6]} intensity={0.9} />
        <directionalLight position={[-10, 6, -6]} intensity={0.5} />
        <BookModel currentPageIndex={currentPageIndex} onActionsReady={onActionsReady} />
        <LimitedOrbitControls resetKey={resetKey} onDefaultChange={onDefaultChange} />
      </Suspense>
    </Canvas>
  );
}
