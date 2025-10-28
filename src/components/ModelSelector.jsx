import React, { useRef } from "react";

/**
 Props:
 - models: [{id,name,file}]
 - activeModel
 - onSelect(file)
 - highlightedMesh (string|null)
 - onUploadDecalForHighlighted(file) -> should return true/false
 - onResetModel()
 - onResetHighlightedMesh()
*/

export default function ModelSelector({
  models = [],
  activeModel,
  onSelect,
  highlightedMesh,
  onUploadDecalForHighlighted,
  onResetModel,
  onResetHighlightedMesh,
}) {
  const fileRef = useRef();

  const triggerFile = () => {
    fileRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-white/5 backdrop-blur rounded-2xl px-3 py-2 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* model list */}
        <div className="flex gap-2 overflow-x-auto py-1">
          {models.map((m) => {
            const active = activeModel === m.file;
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m.file)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? "bg-indigo-600 text-white" : "bg-white/8 text-white"
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        {/* action buttons (sejajar di kanan pada md, di bawah pada mobile) */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              if (highlightedMesh) {
                onResetHighlightedMesh?.();
              } else {
                onResetModel?.();
              }
            }}
            className="px-3 py-2 rounded-lg text-sm bg-rose-600 text-white"
            title={highlightedMesh ? "Reset highlighted mesh" : "Reset model"}
          >
            {highlightedMesh ? "Reset Mesh" : "Reset Model"}
          </button>

          <button
            onClick={triggerFile}
            className="px-3 py-2 rounded-lg text-sm bg-emerald-500 text-black"
            title={highlightedMesh ? "Upload decal to highlighted mesh" : "Select mesh first to upload decal"}
            disabled={!highlightedMesh}
          >
            Upload Decal
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const ok = onUploadDecalForHighlighted?.(f);
              if (!ok) {
                alert("Tidak ada mesh yang dipilih untuk decal. Klik mesh di model untuk memilih.");
              }
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* helper tip */}
      <div className="mt-2 text-xs text-white/70 text-center">
        {highlightedMesh ? `Selected mesh: ${highlightedMesh}` : "Klik bagian model untuk memilih mesh (lihat tooltip)."}
      </div>
    </div>
  );
}
