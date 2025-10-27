import React, { useEffect, useRef, useState } from "react";

export default function ImageMappingEditor({ imageSrc, onApply, onClose }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 600, h: 400 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      const ratio = img.width / img.height;
      const maxW = 800;
      const maxH = 600;
      let w = maxW;
      let h = maxW / ratio;
      if (h > maxH) {
        h = maxH;
        w = maxH * ratio;
      }
      setImgSize({ w, h });
      setAspect(ratio);
      setImgLoaded(true);
      draw(img, w, h);
    };
  }, [imageSrc]);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;
    if (!canvas || !ctx || !img) return;

    const { w, h } = imgSize;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2 + offset.x, h / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;

    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();

    // Crop frame
    ctx.save();
    ctx.strokeStyle = "#00BFFF";
    ctx.lineWidth = 2;
    const cropW = w * 0.85;
    const cropH = cropW / aspect;
    const x = (w - cropW) / 2;
    const y = (h - cropH) / 2;
    ctx.strokeRect(x, y, cropW, cropH);
    ctx.restore();
  };

  useEffect(() => {
    if (imgLoaded) draw();
  }, [zoom, rotation, offset, aspect, imgLoaded]);

  // Drag move
  const handleMouseDown = (e) => {
    setDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => setDragging(false);
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setLastPos({ x: e.clientX, y: e.clientY });
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const cropW = canvas.width * 0.85;
    const cropH = cropW / aspect;
    const x = (canvas.width - cropW) / 2;
    const y = (canvas.height - cropH) / 2;

    // === Render versi HD ===
    const hdCanvas = document.createElement("canvas");
    const scaleFactor = 4; // 4x lebih tajam
    hdCanvas.width = cropW * scaleFactor;
    hdCanvas.height = cropH * scaleFactor;
    const hdCtx = hdCanvas.getContext("2d");

    hdCtx.drawImage(
      canvas,
      x, y, cropW, cropH,
      0, 0, hdCanvas.width, hdCanvas.height
    );

    hdCanvas.toBlob((blob) => {
      onApply(blob);
    }, "image/png", 1.0);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-gray-900 text-gray-200 p-4 rounded-2xl shadow-lg"
        style={{ width: imgSize.w + 50, maxWidth: "95vw" }}
      >
        <h2 className="text-sm mb-3 font-semibold flex items-center gap-2">
          🖼️ Edit Posisi / Zoom Gambar
        </h2>

        <div
          className="bg-black rounded-lg mb-3 relative overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ width: imgSize.w, height: imgSize.h }}
        >
          <canvas
            ref={canvasRef}
            width={imgSize.w}
            height={imgSize.h}
            className="w-full h-full"
          />
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Memuat gambar...
            </div>
          )}
        </div>

        <div className="space-y-2 mb-3">
          <label className="block text-xs">Zoom</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full"
          />

          <label className="block text-xs">Rotate</label>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={rotation}
            onChange={(e) => setRotation(parseFloat(e.target.value))}
            className="w-full"
          />

          <label className="block text-xs">
            Aspect Ratio (W/H): {aspect.toFixed(2)} : 1
          </label>
          <input
            type="range"
            min="0.3"
            max="3"
            step="0.05"
            value={aspect}
            onChange={(e) => setAspect(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
