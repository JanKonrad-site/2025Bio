/* /assets/js/features/img-viewer.js */
export function initImgViewers() {
  // Nový styl: <canvas data-img-viewer data-src="/assets/img/...png"></canvas>
  const canvases = Array.from(document.querySelectorAll("canvas[data-img-viewer]"));

  // Kompatibilita se starým: canvas#preview + natvrdo src
  const legacy = document.getElementById("preview");
  if (legacy && !canvases.includes(legacy)) {
    legacy.dataset.imgViewer = "1";
    legacy.dataset.src = legacy.dataset.src || "/assets/img/gimp/image1.png";
    canvases.push(legacy);
  }

  canvases.forEach((canvas) => {
    if (canvas.dataset._imgViewerInit === "1") return;
    canvas.dataset._imgViewerInit = "1";

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = canvas.dataset.src;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  });
}
