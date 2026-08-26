/**
 * Downloads an SVG element as a file
 */
export const downloadSVG = (svgElement: SVGSVGElement, filename: string) => {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Extract viewBox if available
  const viewBox = svgElement.getAttribute("viewBox");
  let width = 1024;
  let height = 1024;

  if (viewBox) {
    const parts = viewBox.split(/\s+/).map(Number);
    if (parts.length === 4) {
      const vbWidth = parts[2];
      const vbHeight = parts[3];
      const aspect = vbHeight / vbWidth;
      width = 1200;
      height = Math.round(1200 * aspect);
    }
  }

  clone.setAttribute("width", width.toString());
  clone.setAttribute("height", height.toString());
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const svgData = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Converts an SVG element to a high-resolution PNG and downloads it
 */
export const downloadPNG = (svgElement: SVGSVGElement, filename: string, baseSize = 2048) => {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Calculate proper canvas dimensions according to aspect ratio
  const viewBox = svgElement.getAttribute("viewBox");
  let targetWidth = baseSize;
  let targetHeight = baseSize;

  if (viewBox) {
    const parts = viewBox.split(/\s+/).map(Number);
    if (parts.length === 4) {
      const vbWidth = parts[2];
      const vbHeight = parts[3];
      const aspect = vbHeight / vbWidth;
      if (aspect > 1) {
        targetHeight = baseSize;
        targetWidth = Math.round(baseSize / aspect);
      } else {
        targetWidth = baseSize;
        targetHeight = Math.round(baseSize * aspect);
      }
    }
  }

  clone.setAttribute("width", targetWidth.toString());
  clone.setAttribute("height", targetHeight.toString());
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const svgData = new XMLSerializer().serializeToString(clone);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    if (ctx) {
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  img.src = url;
};

