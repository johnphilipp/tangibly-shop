import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

type GLTFResult = {
  scene: THREE.Scene;
};

interface MugModelProps {
  svgDataURL: string;
}

const MugModel: React.FC<MugModelProps> = ({ svgDataURL }) => {
  const { scene } = useGLTF("untitled.glb") as unknown as GLTFResult;
  const texture = useTexture(svgDataURL);

  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      if (
        child instanceof THREE.Mesh &&
        (child.material instanceof THREE.MeshBasicMaterial ||
          child.material instanceof THREE.MeshStandardMaterial) &&
        child.material.name === "texture_material"
      ) {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });

    // Rotate the mug a few degrees from head on center
    scene.rotation.x = Math.PI / 6;
    scene.rotation.y = -Math.PI / 2.3;
  }, [scene, texture]);

  return <primitive object={scene} />;
};

const Camera: React.FC<CameraProps> = ({ fov, aspect, near, far }) => {
  const ref = useRef<THREE.PerspectiveCamera>(null);
  const { scene } = useGLTF("untitled.glb") as unknown as GLTFResult;

  useEffect(() => {
    if (ref.current && scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxSize = Math.max(size.x, size.y, size.z);
      const fitHeightDistance =
        maxSize / (2 * Math.atan((Math.PI * fov) / 360));
      const fitWidthDistance = fitHeightDistance / aspect;
      const distance = Math.max(fitHeightDistance, fitWidthDistance);

      const direction = ref.current.position
        .clone()
        .sub(center)
        .normalize()
        .multiplyScalar(distance);
      ref.current.position.copy(center).add(direction);
      ref.current.lookAt(center);

      ref.current.updateProjectionMatrix();

      ref.current.position.setLength(10);
    }
  }, [fov, aspect, near, far, scene]);

  return (
    <PerspectiveCamera
      ref={ref}
      fov={fov}
      aspect={aspect}
      near={near}
      far={far}
    />
  );
};

const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight groundColor={0x080820} intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <directionalLight position={[-5, 5, 5]} intensity={0.1} />
      <directionalLight position={[5, -5, 5]} intensity={0.5} />
      <directionalLight position={[-5, -5, 5]} intensity={0.2} />
    </>
  );
};

interface CameraProps {
  fov: number;
  aspect: number;
  near: number;
  far: number;
}

interface MugSceneProps {
  svgDataURL: string;
}

const MugScene: React.FC<MugSceneProps> = ({ svgDataURL }) => {
  return (
    <Canvas>
      <Camera
        fov={50}
        aspect={window.innerWidth / window.innerHeight}
        near={0.1}
        far={100}
      />
      <Lights />
      <OrbitControls />
      <MugModel svgDataURL={svgDataURL} />
    </Canvas>
  );
};

export default MugScene;
