import React, { Suspense, useEffect, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { meshLabelMap } from "../config/meshMap.js";

function BirdCage({ modelPath, colorData, decalData, onHoverMesh, highlightMesh }) {
  const { scene } = useGLTF(modelPath);
  const modelName = modelPath.split("/").pop().replace(".glb", "");
  const labelMap = meshLabelMap[modelName] || {};

  useEffect(() => {
    if (!scene) return;

    scene.traverse((node) => {
      if (!node.isMesh) return;
      node.material = node.material.clone();

      // 🌟 Material glossy
      node.material.roughness = 0.12;
      node.material.metalness = 0.9;
      node.material.envMapIntensity = 1.8;
      node.castShadow = true;
      node.receiveShadow = true;

      const meshName = node.name;
      const decalConf = decalData[meshName];
      const colorConf = colorData[meshName];

      // Decal > Warna
      if (decalConf?.type === "decal" && decalConf?.value) {
        const url =
          typeof decalConf.value === "string"
            ? decalConf.value
            : URL.createObjectURL(decalConf.value);

        new THREE.TextureLoader().load(
          url,
          (texture) => {
            texture.flipY = false;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = 16;
            node.material.map = texture;
            node.material.color.set("#ffffff");
            node.material.needsUpdate = true;
          },
          undefined,
          (err) => console.error("❌ Gagal load texture:", meshName, err)
        );
      } else if (colorConf?.type === "color") {
        node.material.map = null;
        node.material.color = new THREE.Color(colorConf.value);
        node.material.needsUpdate = true;
      }

      if (highlightMesh && highlightMesh === meshName) {
        node.material.emissive = new THREE.Color("#00ffff");
        node.material.emissiveIntensity = 0.6;
      } else {
        node.material.emissive = new THREE.Color(0x000000);
        node.material.emissiveIntensity = 0;
      }
    });
  }, [scene, colorData, decalData, highlightMesh]);

  return (
    <primitive
      object={scene}
      scale={0.3}
      position={[0, -0.9, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        const meshName = e.object.name;
        onHoverMesh(labelMap[meshName]?.label || meshName);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHoverMesh(null);
        document.body.style.cursor = "default";
      }}
    />
  );
}

function WoodenTable() {
  const tex = useLoader(THREE.TextureLoader, "/textures/wood.jpg");
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = 8;

  return (
    <mesh position={[0, -1, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.4, 1.4, 0.08, 64]} />
      <meshStandardMaterial map={tex} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

export default function Viewer3D({ modelPath, colorData, decalData, highlightMesh }) {
  const [hoveredMesh, setHoveredMesh] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const envMap = useLoader(RGBELoader, "/textures/studio_small_08_2k.hdr");

  envMap.mapping = THREE.EquirectangularReflectionMapping;

  useEffect(() => {
    const handleMove = (e) => setCursorPos({ x: e.clientX + 15, y: e.clientY + 15 });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Background static image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/images/workshop.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.85)",
          zIndex: 0,
        }}
      />

      {hoveredMesh && (
        <div
          style={{
            position: "fixed",
            top: cursorPos.y,
            left: cursorPos.x,
            background: "rgba(0,0,0,0.75)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 1000,
            textTransform: "capitalize",
          }}
        >
          {hoveredMesh}
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [3, 2.2, 3.8], fov: 38 }}
        gl={{ toneMappingExposure: 1.1, outputEncoding: THREE.sRGBEncoding }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 4]} intensity={0.8} castShadow />
        <directionalLight position={[-4, 3, -3]} intensity={0.4} />
        <hemisphereLight intensity={0.2} />

        <Suspense fallback={<Html center>Loading model...</Html>}>
          {/* HDRI lighting only */}
          <Environment map={envMap} background={false} />
          <WoodenTable />
          <BirdCage
            modelPath={modelPath}
            colorData={colorData}
            decalData={decalData}
            onHoverMesh={setHoveredMesh}
            highlightMesh={highlightMesh}
          />
          <ContactShadows
            position={[0, -0.35, 0]}
            opacity={0.45}
            scale={4.5}
            blur={3.5}
            far={1.6}
          />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0.1, 0]}
        />

        <EffectComposer>
          <Bloom intensity={0.15} luminanceThreshold={0.6} luminanceSmoothing={0.25} />
          <ToneMapping adaptive={true} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
