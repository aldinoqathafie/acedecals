import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function applyColorToMaterial(mat, hex) {
  if (!mat || !mat.color) return;
  mat.color.set(hex);
}

function applyTextureToMaterial(mat, texture) {
  if (!mat) return;
  mat.map = texture;
  mat.needsUpdate = true;
}

function setEmissive(mat, colorOrNull, intensity = 0.35) {
  if (!mat) return;
  if (!("emissive" in mat)) return;
  if (colorOrNull) {
    mat.emissive.set(colorOrNull);
    mat.emissiveIntensity = intensity;
  } else {
    if (mat.userData.__origEmissive) {
      mat.emissive.copy(mat.userData.__origEmissive);
      mat.emissiveIntensity = mat.userData.__origEmissiveIntensity ?? 1;
    } else {
      mat.emissive.set(0x000000);
      mat.emissiveIntensity = 0;
    }
  }
}

function KosanModel({ setHovered, setMeshes, selectedMesh, colors, decals, decalTransforms }) {
  const { scene } = useGLTF("/assets/kosan_bahan.glb");
  const originalColors = useRef({});
  const texturesRef = useRef({});

  // kumpulkan daftar mesh
  useEffect(() => {
    const names = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        names.push(child.name);
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          if (m && !originalColors.current[child.name]) {
            originalColors.current[child.name] = m.color?.clone?.() || null;
          }
          if (m && !m.userData.__origEmissive) {
            if ("emissive" in m) {
              m.userData.__origEmissive = m.emissive.clone();
              m.userData.__origEmissiveIntensity = m.emissiveIntensity ?? 1;
            }
          }
        });
      }
    });
    setMeshes(names);
  }, [scene, setMeshes]);

  // terapkan warna
  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      if (colors[child.name]) {
        mats.forEach((m) => applyColorToMaterial(m, colors[child.name]));
      } else {
        const orig = originalColors.current[child.name];
        if (orig) mats.forEach((m) => m?.color?.copy?.(orig));
      }
    });
  }, [colors, scene]);

  // terapkan decal + transform (offset & scale)
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    Object.entries(decals).forEach(([meshName, url]) => {
      if (!url) return;
      loader.load(url, (tex) => {
        tex.flipY = false;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

        // ambil offset & scale
        const t = decalTransforms[meshName] || { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
        tex.offset.set(t.offsetX, t.offsetY);
        tex.repeat.set(t.scaleX, t.scaleY);

        texturesRef.current[meshName] = tex;
        scene.traverse((child) => {
          if (!child.isMesh || child.name !== meshName) return;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => applyTextureToMaterial(m, tex));
        });
      });
    });
  }, [decals, decalTransforms, scene]);

  // highlight mesh
  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      if (selectedMesh && child.name === selectedMesh) {
        mats.forEach((m) => setEmissive(m, new THREE.Color(0xff8c00), 0.4));
      } else {
        mats.forEach((m) => setEmissive(m, null));
      }
    });
  }, [selectedMesh, scene]);

  // hover
  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(e.object.name);
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(null);
    document.body.style.cursor = "default";
  };

  return (
    <primitive
      object={scene}
      scale={0.8}
      position={[0, -1.3, 0]}
      rotation={[0, 0, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}

useGLTF.preload("/assets/kosan bahan.glb");

export default function Model({
  setHovered,
  setMeshes,
  selectedMesh,
  colors,
  decals,
  decalTransforms,
  resetCameraSignal,
}) {
  const controlsRef = useRef();

  // reset kamera
  useEffect(() => {
    if (resetCameraSignal && controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [resetCameraSignal]);

  return (
    <Canvas camera={{ position: [3, 3, 6], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <KosanModel
        setHovered={setHovered}
        setMeshes={setMeshes}
        selectedMesh={selectedMesh}
        colors={colors}
        decals={decals}
        decalTransforms={decalTransforms}
      />
      <OrbitControls ref={controlsRef} />
    </Canvas>
  );
}
