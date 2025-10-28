import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
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

function BirdCage({ modelPath, colorData, decalData, onHoverMesh, highlightMesh, isMobile }) {
  const { scene } = useGLTF(modelPath);
  const modelName = modelPath.split("/").pop().replace(".glb", "");
  const labelMap = meshLabelMap[modelName] || {};

  useEffect(() => {
    if (!scene) return;

    scene.traverse((node) => {
      if (!node.isMesh) return;
      node.material = node.material.clone();

      node.material.roughness = 0.1;
      node.material.metalness = 0.9;
      node.material.envMapIntensity = 2.8;
      node.castShadow = true;
      node.receiveShadow = true;

      const meshName = node.name;
      const decalConf = decalData[meshName];
      const colorConf = colorData[meshName];

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
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = isMobile ? 4 : 16;
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
  }, [scene, JSON.stringify(colorData), JSON.stringify(decalData), highlightMesh, isMobile]);

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

function RotatingEnvironment({ envMap }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
    }
  });
  return <primitive ref={ref} object={envMap} />;
}

export default function Viewer3D({ modelPath, colorData, decalData, highlightMesh, user, onLogout }) {
  const [hoveredMesh, setHoveredMesh] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const envMap = useLoader(RGBELoader, "/textures/studio_small_08_2k.hdr");
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.encoding = THREE.sRGBEncoding;

  useEffect(() => {
    const handleMove = (e) => setCursorPos({ x: e.clientX + 15, y: e.clientY + 15 });
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="relative w-full h-full" style={{ zIndex: 1 }}>
      {/* 🪶 Background tetap tampil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/images/workshop.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.9) sepia(0.25) saturate(1.15)",
          zIndex: 0,
        }}
      />

      {/* Tooltip hover */}
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

      {/* === 3D Scene === */}
      <Canvas
        shadows={!isMobile}
        camera={{
          position: isMobile ? [4.5, 3, 5.5] : [3.5, 2.4, 4.0],
          fov: isMobile ? 46 : 38,
        }}
        gl={{
          toneMappingExposure: isMobile ? 1.2 : 1.5,
          outputEncoding: THREE.sRGBEncoding,
          antialias: true,
        }}
        style={{
          position: "relative",
          zIndex: 1,
          pointerEvents: "auto",
        }}
      >
        <ambientLight intensity={0.7} color={"#ffe4b3"} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} color={"#ffd9a6"} castShadow />
        <spotLight position={[0, 5, 2]} angle={0.45} penumbra={0.5} intensity={2.5} color={"#fff2dd"} castShadow />
        <pointLight position={[0, 1.5, 1.2]} intensity={0.7} color={"#ffdca8"} />

        <Suspense fallback={<Html center>Loading model...</Html>}>
          <Environment files="/textures/studio_small_08_2k.hdr" background={false} />
          <RotatingEnvironment envMap={new THREE.Group()} />
          <BirdCage
            modelPath={modelPath}
            colorData={colorData}
            decalData={decalData}
            onHoverMesh={setHoveredMesh}
            highlightMesh={highlightMesh}
            isMobile={isMobile}
          />
          <ContactShadows
            position={[0, -0.35, 0]}
            opacity={0.45}
            scale={isMobile ? 4.2 : 4.8}
            blur={2.8}
            far={1.8}
          />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} target={[0, 0.1, 0]} />

        {!isMobile && (
          <EffectComposer>
            <Bloom intensity={0.25} luminanceThreshold={0.5} luminanceSmoothing={0.25} />
            <ToneMapping adaptive={true} />
          </EffectComposer>
        )}
      </Canvas>

      {/* 👤 User Info + Logout + Fullscreen (Desktop Only) */}
      {!isMobile && user && (
        <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm border border-white/10 z-40">
          <img src={user.photoURL} alt="user" className="w-6 h-6 rounded-full border border-gray-500" />
          <span>{user.displayName}</span>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs"
          >
            Logout
          </button>
          <button
            onClick={toggleFullscreen}
            className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-xs"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      )}
    </div>
  );
}
