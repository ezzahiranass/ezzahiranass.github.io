"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GUI from "lil-gui";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

type CubeControls = {
  size: number;
  posX: number;
  posY: number;
  posZ: number;
  rotXSpeed: number;
  rotYSpeed: number;
  color: string;
  opacity: number;
  edgePower: number;
  edgeStrength: number;
  wireframe: boolean;
};

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

function Cube({ controls }: { controls: CubeControls }) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(controls.color) },
      uEdgeColor: { value: new THREE.Color("#ffffff") },
      uOpacity: { value: controls.opacity },
      uEdgePower: { value: controls.edgePower },
      uEdgeStrength: { value: controls.edgeStrength },
    }),
    [controls.color, controls.edgePower, controls.edgeStrength, controls.opacity]
  );

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.rotation.x += controls.rotXSpeed;
    mesh.rotation.y += controls.rotYSpeed;
  });

  return (
    <mesh
      ref={meshRef}
      position={[controls.posX, controls.posY, controls.posZ]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[controls.size, controls.size, controls.size]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        wireframe={controls.wireframe}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vWorldPos;

          void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform vec3 uEdgeColor;
          uniform float uOpacity;
          uniform float uEdgePower;
          uniform float uEdgeStrength;

          varying vec3 vNormal;
          varying vec3 vWorldPos;

          void main() {
            vec3 viewDir = normalize(cameraPosition - vWorldPos);
            float facing = max(dot(normalize(vNormal), viewDir), 0.0);
            float edge = pow(1.0 - facing, uEdgePower);
            float edgeMix = clamp(edge * uEdgeStrength, 0.0, 1.0);
            vec3 color = mix(uColor, uEdgeColor, edgeMix);
            float alpha = clamp(uOpacity + edge * 0.35, 0.0, 1.0);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

const initialControls: CubeControls = {
  size: 1.6,
  posX: 0,
  posY: 0,
  posZ: 0,
  rotXSpeed: 0.01,
  rotYSpeed: 0.015,
  color: "#8bd3ff",
  opacity: 0.3,
  edgePower: 2.8,
  edgeStrength: 1.2,
  wireframe: false,
};

export default function HeroCubeViewer() {
  const guiRef = useRef<HTMLDivElement | null>(null);
  const [controls, setControls] = useState<CubeControls>(initialControls);
  const controlsRef = useRef<CubeControls>(initialControls);
  const [isCanvasEnabled, setIsCanvasEnabled] = useState(false);

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

    if (document.visibilityState === "visible") {
      enableCanvas();
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        enableCanvas();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!guiRef.current) return undefined;

    const gui = new GUI({
      container: guiRef.current,
      width: 220,
      title: "Cube Controls",
    });

    const sync = () => {
      setControls({ ...controlsRef.current });
    };

    const transforms = gui.addFolder("Transform");
    transforms.add(controlsRef.current, "size", 0.4, 3, 0.05).name("Size").onChange(sync);
    transforms.add(controlsRef.current, "posX", -2, 2, 0.01).name("X").onChange(sync);
    transforms.add(controlsRef.current, "posY", -2, 2, 0.01).name("Y").onChange(sync);
    transforms.add(controlsRef.current, "posZ", -2, 2, 0.01).name("Z").onChange(sync);
    transforms.open();

    const motion = gui.addFolder("Motion");
    motion.add(controlsRef.current, "rotXSpeed", -0.08, 0.08, 0.001).name("Spin X").onChange(sync);
    motion.add(controlsRef.current, "rotYSpeed", -0.08, 0.08, 0.001).name("Spin Y").onChange(sync);
    motion.open();

    const material = gui.addFolder("Material");
    material.addColor(controlsRef.current, "color").name("Color").onChange(sync);
    material.add(controlsRef.current, "opacity", 0.05, 0.9, 0.01).name("Opacity").onChange(sync);
    material.add(controlsRef.current, "edgePower", 0.5, 8, 0.1).name("Edge Power").onChange(sync);
    material.add(controlsRef.current, "edgeStrength", 0.2, 3, 0.05).name("Edge Strength").onChange(sync);
    material.add(controlsRef.current, "wireframe").name("Wireframe").onChange(sync);
    material.open();

    return () => {
      gui.destroy();
    };
  }, []);

  return (
    <div className="hero-cube-viewer" aria-label="Hero cube viewer">
      <div ref={guiRef} className="hero-cube-viewer__gui" />
      {isCanvasEnabled ? (
        <Canvas
          className="hero-cube-viewer__canvas"
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [3.2, 2.4, 4.2], fov: 45 }}
          frameloop="always"
          resize={{ scroll: true, debounce: { scroll: 0, resize: 0 } }}
        >
          <SceneBootstrap />
          <ambientLight intensity={0.75} />
          <directionalLight position={[4, 5, 3]} intensity={1.15} />
          <Cube controls={controls} />
          <OrbitControls enablePan={false} />
        </Canvas>
      ) : null}
    </div>
  );
}
