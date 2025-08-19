import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Model from "./components/Model";

export default function App() {
  const [hovered, setHovered] = useState(null);
  const [meshes, setMeshes] = useState([]);
  const [selectedMesh, setSelectedMesh] = useState(null);
  const [colors, setColors] = useState({});
  const [decals, setDecals] = useState({});
  const [decalTransforms, setDecalTransforms] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [resetCameraSignal, setResetCameraSignal] = useState(0);

  // ubah warna mesh
  const handleColorChange = (meshName, colorHex) => {
    setColors((prev) => ({ ...prev, [meshName]: colorHex }));
  };

  // upload decal
  const handleDecalUpload = (meshName, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDecals((prev) => ({ ...prev, [meshName]: url }));
  };

  // ubah transformasi decal (offset & scale)
  const handleDecalTransform = (meshName, key, value) => {
    setDecalTransforms((prev) => ({
      ...prev,
      [meshName]: {
        offsetX: 0,
        offsetY: 0,
        scaleX: 1,
        scaleY: 1,
        ...prev[meshName],
        [key]: value,
      },
    }));
  };

  // reset
  const resetColors = () => setColors({});
  const resetDecals = () => setDecals({});
  const resetCamera = () => setResetCameraSignal((s) => s + 1);

  return (
    <div
      className="flex h-screen relative bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/background.jpg')" }}
    >
      {/* Sidebar wrapper */}
      <div
        className={`h-screen transition-transform duration-300 z-40 relative ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          meshes={meshes}
          selectedMesh={selectedMesh}
          setSelectedMesh={setSelectedMesh}
          onColorChange={handleColorChange}
          onDecalUpload={handleDecalUpload}
          onDecalTransform={handleDecalTransform}
          decalTransforms={decalTransforms}
          onResetCamera={resetCamera}
          onResetColors={resetColors}
          onResetDecals={resetDecals}
        />

        {/* Tombol toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-0 -right-4 h-full w-6 bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center shadow-md rounded-r"
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* Area Model */}
      <div className="flex-1 relative">
        <Model
          setHovered={setHovered}
          setMeshes={setMeshes}
          selectedMesh={selectedMesh}
          colors={colors}
          decals={decals}
          decalTransforms={decalTransforms}
          resetCameraSignal={resetCameraSignal}
        />

        {/* Tooltip hover */}
        {hovered && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded shadow">
            {hovered}
          </div>
        )}
      </div>
    </div>
  );
}
