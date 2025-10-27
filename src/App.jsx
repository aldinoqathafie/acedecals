// ============================================================
// src/App.jsx
// ============================================================

import React, { useState } from "react";
import Viewer3D from "./components/Viewer3D.jsx";
import CustomizerPanel from "./components/CustomizerPanel.jsx";
import ModelSelector from "./components/ModelSelector.jsx";

// ============================================================
// 🧩 DAFTAR MODEL GLB
// ============================================================
const models = [
  { id: 1, name: "Kosan 40", file: "Kosan_40.glb" },
  { id: 2, name: "Gunungan 37x43", file: "Gunungan_37x43.glb" },
  { id: 3, name: "Nepak Cagak Oval", file: "Nepak_Cagak_Oval.glb" },
  { id: 4, name: "Sangkar Murai", file: "Sangkar_Murai.glb" },
  { id: 5, name: "Tebok Lovebird", file: "Tebok_Lovebird.glb" },
];

// ============================================================
// 🧠 KOMPONEN UTAMA APP
// ============================================================
export default function App() {
  const [activeModel, setActiveModel] = useState(models[0].file);
  const [highlightMesh, setHighlightMesh] = useState(null);

  // Data warna & decal masing-masing model
  const [colorDataMap, setColorDataMap] = useState({});
  const [decalDataMap, setDecalDataMap] = useState({});

  // ============================================================
  // 🎨 Handler: ubah warna mesh
  // ============================================================
  const handleColorChange = (meshName, conf) => {
    setColorDataMap((prev) => ({
      ...prev,
      [activeModel]: {
        ...(prev[activeModel] || {}),
        [meshName]: conf,
      },
    }));
  };

  // ============================================================
  // 🖼️ Handler: ubah decal mesh
  // ============================================================
  const handleDecalChange = (meshName, conf) => {
    setDecalDataMap((prev) => ({
      ...prev,
      [activeModel]: {
        ...(prev[activeModel] || {}),
        [meshName]: conf,
      },
    }));
  };

  // ============================================================
  // 🔄 Handler: ganti model aktif
  // ============================================================
  const handleModelChange = (modelFile) => {
    setActiveModel(modelFile);
    setHighlightMesh(null);
  };

  // ============================================================
  // 💠 Render App
  // ============================================================
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-800 to-black relative overflow-hidden">
      {/* 🧱 3D Viewer */}
      <Viewer3D
        key={activeModel} // reload setiap kali model ganti
        modelPath={`/models/${activeModel}`}
        colorData={colorDataMap[activeModel] || {}}
        decalData={decalDataMap[activeModel] || {}}
        highlightMesh={highlightMesh}
      />

      {/* 🎚️ Sidebar Customizer */}
      <CustomizerPanel
        key={`panel-${activeModel}`}
        activeModel={activeModel}
        onColorChange={handleColorChange}
        onDecalChange={handleDecalChange}
        onHighlight={(mesh) =>
          setHighlightMesh((prev) => (prev === mesh ? null : mesh))
        }
      />

      {/* 🔽 Model Selector (Bar bawah) */}
      <div
        className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <div className="pointer-events-auto">
          <ModelSelector
            activeModel={activeModel}
            onSelect={(file) => handleModelChange(file)}
            models={models}
          />
        </div>
      </div>
    </div>
  );
}
