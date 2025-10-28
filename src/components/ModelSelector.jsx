import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ModelSelector Carousel — smooth infinite scroll
 * Props:
 * - models: [{id,name,file}]
 * - activeModel
 * - onSelect(file)
 * - highlightedMesh (optional)
 */

export default function ModelSelector({
  models = [],
  activeModel,
  onSelect,
  highlightedMesh,
}) {
  const [index, setIndex] = useState(0);

  // Sinkronkan index dengan model aktif
  useEffect(() => {
    const activeIdx = models.findIndex((m) => m.file === activeModel);
    if (activeIdx >= 0) setIndex(activeIdx);
  }, [activeModel, models]);

  const prevModel = () =>
    setIndex((prev) => (prev === 0 ? models.length - 1 : prev - 1));
  const nextModel = () =>
    setIndex((prev) => (prev === models.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    if (models[index]) onSelect(models[index].file);
  }, [index]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* === Carousel Container === */}
      <div
        className="relative flex items-center justify-center bg-black/50 
                   backdrop-blur-lg border border-white/10 rounded-2xl 
                   px-5 py-3 shadow-[0_0_25px_rgba(0,0,0,0.5)]"
        style={{ width: "min(90%, 500px)" }}
      >
        {/* Tombol kiri */}
        <button
          onClick={prevModel}
          className="absolute left-2 text-gray-400 hover:text-white transition"
        >
          <ChevronLeft size={34} />
        </button>

        {/* Carousel isi */}
        <div className="flex items-center justify-center w-full overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={models[index]?.id || "none"}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-center text-white text-lg font-semibold tracking-wide"
            >
              {models[index]?.name?.toUpperCase() || "No Model"}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tombol kanan */}
        <button
          onClick={nextModel}
          className="absolute right-2 text-gray-400 hover:text-white transition"
        >
          <ChevronRight size={34} />
        </button>
      </div>

      {/* Info mesh */}
      <div className="mt-2 text-xs text-white/70 text-center">
        {highlightedMesh
          ? `Selected mesh: ${highlightedMesh}`
          : "Klik bagian model untuk memilih mesh (lihat tooltip)."}
      </div>
    </div>
  );
}
