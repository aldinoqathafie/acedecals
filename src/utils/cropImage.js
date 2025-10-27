// src/utils/cropImage.js
export default function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const safeArea = Math.max(image.width, image.height) * 2;
      canvas.width = safeArea;
      canvas.height = safeArea;

      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-safeArea / 2, -safeArea / 2);
      ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2);

      const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.putImageData(data, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Gagal membuat blob dari hasil crop"));
          return;
        }
        const file = new File([blob], "cropped-image.png", { type: "image/png" });
        resolve(file);
      }, "image/png");
    };
    image.onerror = reject;
  });
}
