import React, { useState } from "react";
import { meshLabelMap } from "../config/meshMap.js";
import ImageMappingEditor from "./ImageMappingEditor.jsx";

export default function CustomizerPanel({
  activeModel = "Kosan_40.glb",
  onColorChange = () => {},
  onDecalChange = () => {},
  onHighlight = () => {},
}) {
  const [editTarget, setEditTarget] = useState(null); // mesh yg sedang di-edit
  const [previewImages, setPreviewImages] = useState({}); // thumbnail tiap mesh
  const [uploadProgress, setUploadProgress] = useState({}); // progress upload

  const modelKey = String(activeModel).replace(".glb", "");
  const meshMap = meshLabelMap[modelKey] || {};
  const meshKeys = Object.keys(meshMap);

  const decalMeshes = meshKeys.filter((m) => m.toLowerCase().includes("decal"));
  const colorMeshes = meshKeys.filter((m) => !m.toLowerCase().includes("decal"));

  // 🟢 Warna
  const handleColor = (meshName, e) => {
    onColorChange(meshName, { type: "color", value: e.target.value });
  };

  // 🟡 Upload gambar → tampilkan thumbnail
  const handleDecalUpload = (meshName, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const progress = Math.round((ev.loaded / ev.total) * 100);
        setUploadProgress((prev) => ({ ...prev, [meshName]: progress }));
      }
    };

    reader.onloadend = () => {
      const url = reader.result;
      setPreviewImages((prev) => ({ ...prev, [meshName]: url }));
      setUploadProgress((prev) => ({ ...prev, [meshName]: 100 }));
      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, [meshName]: null }));
      }, 600);
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 🟠 Simpan hasil crop dari editor
  const handleApplyCropped = (meshName, blob) => {
    const url = URL.createObjectURL(blob);
    setPreviewImages((prev) => ({ ...prev, [meshName]: url }));
    onDecalChange(meshName, { type: "decal", value: blob });
    setEditTarget(null);
  };

  return (
    <>
      <aside
        className="fixed top-0 right-0 h-full w-72 bg-gray-900/30 backdrop-blur-lg 
                   border-l border-gray-600/30 text-gray-200 p-4 overflow-y-auto 
                   shadow-[0_0_25px_rgba(0,0,0,0.4)]"
      >
        <h2 className="text-sm font-semibold mb-3 text-white drop-shadow-md">
          🎨 Kustomisasi Sangkar
        </h2>

        {/* ===== Custom Warna ===== */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-gray-100 uppercase tracking-wide mb-2">
            Custom Warna
          </h3>
          <div className="space-y-2">
            {colorMeshes.map((mesh) => (
              <div
                key={mesh}
                className="flex items-center justify-between gap-2 bg-white/5 hover:bg-white/10 
                           transition-all p-2 rounded-md border border-white/10"
              >
                <div className="flex-1 text-[11px] text-gray-200 truncate">
                  {meshMap[mesh]}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    onChange={(e) => handleColor(mesh, e)}
                    className="w-7 h-7 p-0 border border-gray-600/40 rounded cursor-pointer"
                  />
                  <button
                    onClick={() => onHighlight(mesh)}
                    className="text-[10px] px-1.5 py-0.5 bg-blue-600/70 
                               hover:bg-blue-500/90 rounded text-white"
                  >
                    🔍
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Custom Decals ===== */}
        <section>
          <h3 className="text-xs font-semibold text-gray-100 uppercase tracking-wide mb-2">
            Custom Decals
          </h3>
          <div className="space-y-2">
            {decalMeshes.map((mesh) => (
              <div
                key={mesh}
                className="bg-white/5 hover:bg-white/10 transition-all p-2 rounded-md 
                           border border-white/10 flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <div className="text-[11px] text-gray-200 truncate">
                    {meshMap[mesh]}
                  </div>
                  <button
                    onClick={() => onHighlight(mesh)}
                    className="text-[10px] px-1.5 py-0.5 bg-blue-600/70 hover:bg-blue-500/90 
                               rounded text-white"
                  >
                    🔍
                  </button>
                </div>

                {/* Upload + Preview */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`decal-${mesh}`}
                    className="text-[11px] px-2 py-1 bg-blue-600/70 hover:bg-blue-500/90 
                               rounded text-white cursor-pointer transition-all"
                  >
                    Browse
                  </label>
                  <input
                    id={`decal-${mesh}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDecalUpload(mesh, e)}
                    className="hidden"
                  />

                  {previewImages[mesh] && (
                    <>
                      <img
                        src={previewImages[mesh]}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded border border-gray-600/50 
                                   cursor-pointer hover:opacity-80"
                        onClick={() => setEditTarget(mesh)}
                      />
                      <button
                        onClick={() => setEditTarget(mesh)}
                        className="text-[10px] px-1.5 py-0.5 bg-amber-600/70 hover:bg-amber-500/90 
                                   rounded text-white"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                {uploadProgress[mesh] && uploadProgress[mesh] < 100 && (
                  <div className="w-full bg-gray-700/40 rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-150"
                      style={{ width: `${uploadProgress[mesh]}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* === Editor muncul setelah klik thumbnail === */}
      {editTarget && (
        <ImageMappingEditor
          imageSrc={previewImages[editTarget]}
          meshName={editTarget}
          onApply={(file) => handleApplyCropped(editTarget, file)}
          onClose={() => setEditTarget(null)}
        />
      )}
    </>
  );
}
