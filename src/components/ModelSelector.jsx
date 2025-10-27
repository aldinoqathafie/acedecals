import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModelSelector({ models, activeModel, onSelect }) {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const changeModel = (dir) => {
    let newIndex = currentIndex + (dir === "left" ? -1 : 1);
    if (newIndex < 0) newIndex = models.length - 1;
    if (newIndex >= models.length) newIndex = 0;
    setCurrentIndex(newIndex);
    onSelect(models[newIndex].file);
    scrollToIndex(newIndex);
  };

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const child = scrollRef.current.children[index];
    if (child) {
      scrollRef.current.scrollTo({
        left: child.offsetLeft - scrollRef.current.offsetWidth / 2 + child.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToIndex(currentIndex);
  }, [currentIndex]);

  return (
    <div className="relative w-full flex justify-center items-center mt-2 select-none">
      {/* 🔹 Tombol panah kiri (melayang di luar box) */}
      <button
        onClick={() => changeModel("left")}
        className="absolute -left-10 md:-left-14 p-3 rounded-full bg-gray-900/40 
                   hover:bg-gray-800/60 transition shadow-lg backdrop-blur-sm border border-gray-700/30"
      >
        <ChevronLeft size={28} className="text-white" />
      </button>

      {/* 🔹 Container utama selector */}
      <div
        className="relative flex items-center justify-center
                   bg-gray-900/40 backdrop-blur-md border border-gray-700/30
                   rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.4)]
                   text-gray-200 py-3"
        style={{
          width: "92%", // 🔹 Lebar besar biar proporsional dan tanpa bar
          height: "85px",
          overflow: "hidden",
        }}
      >
        <div
          ref={scrollRef}
          className="flex gap-10 overflow-hidden w-full justify-center items-center"
          style={{ scrollBehavior: "smooth" }}
        >
          <AnimatePresence initial={false}>
            {models.map((model, index) => (
              <motion.div
                key={model.id}
                onClick={() => {
                  setCurrentIndex(index);
                  onSelect(model.file);
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className={`flex items-center justify-center cursor-pointer
                            transition-all rounded-xl
                            ${
                              activeModel === model.file
                                ? "bg-blue-600/70 text-white shadow-md scale-105"
                                : "bg-white/10 hover:bg-white/20"
                            }`}
                style={{
                  minWidth: "200px", // 🔹 Cukup lebar agar teks panjang muat
                  height: "55px",
                  fontSize: "15px",
                  fontWeight: "500",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {model.name}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 🔹 Tombol panah kanan (melayang di luar box) */}
      <button
        onClick={() => changeModel("right")}
        className="absolute -right-10 md:-right-14 p-3 rounded-full bg-gray-900/40 
                   hover:bg-gray-800/60 transition shadow-lg backdrop-blur-sm border border-gray-700/30"
      >
        <ChevronRight size={28} className="text-white" />
      </button>
    </div>
  );
}
