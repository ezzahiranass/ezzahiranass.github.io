'use client';

type RoofProps = {
  totalHeight: number;
  roofHeight: number;
  rotationY: number;
};

export default function Roof({ totalHeight, roofHeight, rotationY }: RoofProps) {
  return (
    <mesh
      position={[0, totalHeight - roofHeight / 2, 0]}
      rotation={[0, rotationY, 0]}
      castShadow
    >
      <boxGeometry args={[5, roofHeight, 4]} />
      <meshStandardMaterial color="#d1d1d1" />
    </mesh>
  );
}
