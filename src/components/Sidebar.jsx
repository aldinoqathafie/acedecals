import React, { useState } from "react";

export default function Sidebar({
  meshes,
  onColorChange,
  onDecalUpload,
  onDecalTransform,
  decalTransforms,
  onResetCamera,
  onResetColors,
  onResetDecals,
}) {
  const colorMeshes = meshes.filter(
    (name) => !name.toLowerCase().includes("decal")
  );
  const decalMeshes = meshes.filter((name) =>
    name.toLowerCase().includes("decal")
  );

  const [decalPreview, setDecalPreview] = useState({});

  const handleColor = (name, value) => {
    onColorChange(name, value);
  };

  const handleDecal = (name, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDecalPreview((prev) => ({ ...prev, [name]: url }));
    onDecalUpload(name, file);
  };

  return (
    <div className="w-96 h-screen flex flex-col shadow-lg text-white bg-gradient-to-b from-gray-900 to-gray-700">
      {/* Bagian atas: scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-3xl font-extrabold mb-0 text-center">ACE DECAL</h2>
        <h2 className="text-3xl font-bold mb-8 text-center">E D I T O R</h2>

        {/* Warna */}
        <div className="mb-10">
          <h3 className="text-xl font-extrabold mb-0">WARNA</h3>
          <h3 className="text-xl font-regular mb-4">SANGKAR</h3>
          <div className="space-y-3">
            {colorMeshes.map((name) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm flex-1">{name.replaceAll("_", " ")}</span>
                <input
                  type="color"
                  defaultValue="#000000"
                  onChange={(e) => handleColor(name, e.target.value)}
                  className="w-16 h-6 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Decal */}
        <div className="mb-10">
          <h3 className="text-xl font-extrabold mb-0">DECAL</h3>
          <h3 className="text-xl font-regular mb-4">SANGKAR</h3>
          <div className="space-y-6">
            {decalMeshes.map((name) => (
              <div key={name} className="mb-6 border-b border-gray-700 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex-1">{name.replaceAll("_", " ")}</span>
                  <div className="w-20 h-6 bg-gray-600 rounded mr-2 overflow-hidden flex items-center justify-center border border-gray-500">
                    {decalPreview[name] ? (
                      <img
                        src={decalPreview[name]}
                        alt="preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-xs text-gray-300">N/A</span>
                    )}
                  </div>
                  <label className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs cursor-pointer">
                    Browse
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleDecal(name, e.target.files?.[0])}
                    />
                  </label>
                </div>

                {/* Slider kontrol posisi & scale */}
                <div className="ml-2 mt-2 space-y-2">
                  <div>
                    <label className="text-xs">Pos X</label>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.01"
                      defaultValue={0}
                      onChange={(e) =>
                        onDecalTransform(name, "offsetX", parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs">Pos Y</label>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.01"
                      defaultValue={0}
                      onChange={(e) =>
                        onDecalTransform(name, "offsetY", parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs">Scale X</label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.01"
                      defaultValue={1}
                      onChange={(e) =>
                        onDecalTransform(name, "scaleX", parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs">Scale Y</label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.01"
                      defaultValue={1}
                      onChange={(e) =>
                        onDecalTransform(name, "scaleY", parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bagian bawah: tombol reset */}
      <div className="p-4 flex justify-around border-t border-gray-600">
        <button
          onClick={onResetCamera}
          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded shadow"
        >
          Reset Cam
        </button>
        <button
          onClick={onResetColors}
          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded shadow"
        >
          Reset Color
        </button>
        <button
          onClick={onResetDecals}
          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded shadow"
        >
          Reset Decal
        </button>
      </div>
    </div>
  );
}
