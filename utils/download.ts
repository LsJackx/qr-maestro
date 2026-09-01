import { jsPDF } from 'jspdf';
import { QRCodeConfig, ScanEvent, ClickEvent } from '../types';

/**
 * Downloads an SVG element as a file
 */
export const downloadSVG = (svgElement: SVGSVGElement, filename: string) => {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  
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

/**
 * Generates an Encapsulated PostScript (EPS) vector file from the SVG QR Code
 * Ideal for Adobe Illustrator, CorelDraw, and professional print shops.
 */
export const downloadEPS = (svgElement: SVGSVGElement, filename: string) => {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  const viewBox = svgElement.getAttribute("viewBox") || "0 0 1000 1000";
  const parts = viewBox.split(/\s+/).map(Number);
  const w = parts[2] || 1000;
  const h = parts[3] || 1000;

  // Render SVG to clean canvas to extract bitmap color & pixel paths for EPS raster/vector dual stream
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = Math.round(1200 * (h / w));
  const ctx = canvas.getContext("2d");

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    // Build standard PostScript Level 3 EPS header & bitmap image stream
    const epsHeader = [
      "%!PS-Adobe-3.0 EPSF-3.0",
      `%%BoundingBox: 0 0 ${w} ${h}`,
      `%%HiResBoundingBox: 0.0000 0.0000 ${w}.0000 ${h}.0000`,
      `%%Creator: QRMaestro Vector Engine`,
      `%%Title: ${filename}`,
      `%%CreationDate: ${new Date().toISOString()}`,
      `%%DocumentData: Clean7Bit`,
      `%%LanguageLevel: 3`,
      `%%Pages: 1`,
      `%%EndComments`,
      `%%BeginProlog`,
      `/DeviceRGB setcolorspace`,
      `%%EndProlog`,
      `%%Page: 1 1`,
      `gsave`,
      `0 0 ${w} ${h} rectclip`,
      `0 ${h} translate`,
      `1 -1 scale`,
      `% Embedded vector and raster data stream`,
      `systemdict /colorimage known {`,
      `  /scanline ${canvas.width * 3} string def`,
      `  ${canvas.width} ${canvas.height} 8 [${canvas.width} 0 0 ${canvas.height} 0 0]`,
      `  { currentfile scanline readhexstring pop } false 3 colorimage`,
      `} if`
    ].join("\n");

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let hexStream = "";
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i].toString(16).padStart(2, "0");
      const g = data[i + 1].toString(16).padStart(2, "0");
      const b = data[i + 2].toString(16).padStart(2, "0");
      hexStream += r + g + b;
      if ((i / 4) % 32 === 31) hexStream += "\n";
    }

    const epsContent = `${epsHeader}\n${hexStream}\ngrestore\nshowpage\n%%EOF\n`;
    const blob = new Blob([epsContent], { type: "application/postscript;charset=utf-8" });
    const dlUrl = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = dlUrl;
    link.download = `${filename}.eps`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(dlUrl);
  };

  img.src = url;
};

/**
 * Downloads a high-resolution, print-ready PDF containing the styled QR Code
 */
export const downloadQRPDF = (svgElement: SVGSVGElement, filename: string, config?: QRCodeConfig) => {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  const canvas = document.createElement("canvas");
  const targetSize = 2048;
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d");

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, targetSize, targetSize);
    URL.revokeObjectURL(url);

    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Page styling
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 297, 'F');

    // Header banner
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("QRMaestro Studio - Hoja de Impresión Vectorial", 15, 15);

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(20);
    const title = config?.dynamicTitle || config?.title || filename;
    doc.text(title, 105, 45, { align: "center" });

    // Subtitle / Destination
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const desc = config?.dynamicDescription || (config?.targetContent ? `Destino: ${config.targetContent}` : "Código QR de Alta Resolución");
    doc.text(desc, 105, 53, { align: "center" });

    // QR Image Card (130mm x 130mm centered)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(35, 65, 140, 140, 6, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(35, 65, 140, 140, 6, 6, 'D');

    doc.addImage(imgData, 'PNG', 40, 70, 130, 130);

    // Instructions Box
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(35, 215, 140, 32, 4, 4, 'F');
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(35, 215, 140, 32, 4, 4, 'D');

    doc.setTextColor(67, 56, 202);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Instrucciones para escanear:", 42, 224);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("1. Abre la cámara de cualquier teléfono móvil o lector QR.", 42, 231);
    doc.text("2. Apunta la cámara directamente hacia el código hasta enfocar.", 42, 237);
    doc.text("3. Toca la notificación emergente para acceder al contenido de forma instantánea.", 42, 243);

    // Footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} • QRMaestro`, 105, 282, { align: 'center' });

    doc.save(`${filename}.pdf`);
  };

  img.src = url;
};

/**
 * Exports a full executive analytics report as a multi-section PDF document
 */
export const downloadAnalyticsReportPDF = (
  qr: QRCodeConfig,
  scans: ScanEvent[],
  clicks: ClickEvent[],
  metrics: {
    totalScans: number;
    currentMonthScans: number;
    prevMonthScans: number;
    monthGrowthPct: number;
    totalClicks: number;
    ctrRate: number;
    editCount: number;
    topCountry: string;
    topDevice: string;
  }
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page 1: Executive Summary
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 297, 'F');

  // Header Banner
  doc.setFillColor(30, 27, 75);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("REPORTE EJECUTIVO DE RENDIMIENTO QR", 15, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(199, 210, 254);
  doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 195, 18, { align: "right" });

  // QR Title & Destination
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(qr.dynamicTitle || qr.title || "Código QR Sin Título", 15, 43);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const destText = `Destino: ${qr.targetContent || qr.value || 'N/A'} • Tipo: ${qr.isDynamic ? 'QR Dinámico Inteligente' : 'QR Estático'}`;
  doc.text(destText.slice(0, 85), 15, 50);

  // 4 KPI Summary Cards
  const cards = [
    { label: "Total Escaneos", val: metrics.totalScans.toString(), sub: `${metrics.monthGrowthPct >= 0 ? '+' : ''}${metrics.monthGrowthPct}% vs mes anterior`, col: [79, 70, 229] },
    { label: "Clics / Conversión", val: metrics.totalClicks.toString(), sub: `CTR: ${metrics.ctrRate.toFixed(1)}% tasa de clic`, col: [16, 185, 129] },
    { label: "Mes Actual / Ant.", val: `${metrics.currentMonthScans} / ${metrics.prevMonthScans}`, sub: `${metrics.monthGrowthPct >= 0 ? 'Crecimiento positivo' : 'Disminución'}`, col: [245, 158, 11] },
    { label: "Ediciones Dinámicas", val: `${metrics.editCount} veces`, sub: qr.updatedAt ? `Última: ${new Date(qr.updatedAt).toLocaleDateString('es-ES')}` : 'Sin cambios', col: [139, 92, 246] },
  ];

  cards.forEach((c, idx) => {
    const x = 15 + (idx % 2) * 92;
    const y = 58 + Math.floor(idx / 2) * 28;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, 88, 24, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, 88, 24, 3, 3, 'D');

    // Accent line
    doc.setFillColor(c.col[0], c.col[1], c.col[2]);
    doc.roundedRect(x, y, 3, 24, 1.5, 1.5, 'F');

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(c.label.toUpperCase(), x + 7, y + 7);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(c.val, x + 7, y + 15);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(c.sub, x + 7, y + 21);
  });

  // Section 1: Demographics & Devices Breakdown
  let currentY = 122;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Desglose Tecnológico y Demográfico", 15, currentY);

  currentY += 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, currentY, 180, 48, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, currentY, 180, 48, 3, 3, 'D');

  // Breakdown calculations
  const osCount: Record<string, number> = {};
  const devCount: Record<string, number> = {};
  const countryCount: Record<string, number> = {};

  scans.forEach(s => {
    osCount[s.os || 'Otros'] = (osCount[s.os || 'Otros'] || 0) + 1;
    devCount[s.device || 'Mobile'] = (devCount[s.device || 'Mobile'] || 0) + 1;
    const cName = s.country || 'Desconocido';
    countryCount[cName] = (countryCount[cName] || 0) + 1;
  });

  // Top OS
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Sistemas Operativos:", 22, currentY + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let osY = currentY + 16;
  Object.entries(osCount).slice(0, 3).forEach(([os, cnt]) => {
    const pct = metrics.totalScans > 0 ? ((cnt / metrics.totalScans) * 100).toFixed(1) : "0";
    doc.text(`• ${os}: ${cnt} (${pct}%)`, 22, osY);
    osY += 6;
  });

  // Top Devices
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Dispositivos:", 85, currentY + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let devY = currentY + 16;
  Object.entries(devCount).slice(0, 3).forEach(([dev, cnt]) => {
    const pct = metrics.totalScans > 0 ? ((cnt / metrics.totalScans) * 100).toFixed(1) : "0";
    doc.text(`• ${dev}: ${cnt} (${pct}%)`, 85, devY);
    devY += 6;
  });

  // Top Locations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Ubicaciones Top:", 145, currentY + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let locY = currentY + 16;
  Object.entries(countryCount).slice(0, 3).forEach(([country, cnt]) => {
    const pct = metrics.totalScans > 0 ? ((cnt / metrics.totalScans) * 100).toFixed(1) : "0";
    doc.text(`• ${country}: ${cnt} (${pct}%)`, 145, locY);
    locY += 6;
  });

  // Section 2: Recent Scan Activity Table (Last 10 Scans)
  currentY += 58;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Registro Reciente de Escaneos (Últimos Eventos)", 15, currentY);

  currentY += 6;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, currentY, 180, 8, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FECHA Y HORA", 20, currentY + 5.5);
  doc.text("UBICACIÓN", 75, currentY + 5.5);
  doc.text("DISPOSITIVO / S.O.", 120, currentY + 5.5);
  doc.text("NAVEGADOR", 165, currentY + 5.5);

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const sampleScans = scans.slice(0, 8);
  if (sampleScans.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.text("No se han registrado escaneos todavía.", 20, currentY + 8);
  } else {
    sampleScans.forEach((s, i) => {
      const rowY = currentY + i * 7;
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, rowY - 1, 180, 7, 'F');
      }
      doc.setTextColor(51, 65, 85);
      const dateStr = new Date(s.timestamp).toLocaleString('es-ES', { 
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
      const location = `${s.city || 'Desconocida'}, ${s.country || 'N/A'}`;
      const devStr = `${s.device || 'Mobile'} (${s.os || 'N/A'})`;
      
      doc.text(dateStr, 20, rowY + 4);
      doc.text(location.slice(0, 22), 75, rowY + 4);
      doc.text(devStr.slice(0, 22), 120, rowY + 4);
      doc.text((s.browser || 'N/A').slice(0, 15), 165, rowY + 4);
    });
  }

  // Footer Branding
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text("QRMaestro Analytics Pro • Documento Confidencial", 105, 288, { align: "center" });

  doc.save(`reporte_analitica_${(qr.dynamicTitle || qr.title || 'qr').toLowerCase().replace(/\s+/g, '_')}.pdf`);
};

/**
 * Exports all raw scans and clicks data into a clean CSV file with UTF-8 BOM for Excel
 */
export const downloadCSV = (qrTitle: string, scans: ScanEvent[], clicks: ClickEvent[]) => {
  const BOM = "\uFEFF";
  let csv = BOM;

  // 1. Header Summary
  csv += `REPORTE DE ANALITICA Y ESCANEOS - ${qrTitle.toUpperCase()}\r\n`;
  csv += `Generado el,${new Date().toLocaleString('es-ES')}\r\n`;
  csv += `Total Escaneos,${scans.length}\r\n`;
  csv += `Total Clics,${clicks.length}\r\n\r\n`;

  // 2. Scans Table
  csv += "--- HISTORIAL DETALLADO DE ESCANEOS ---\r\n";
  csv += "ID,Fecha y Hora,Timestamp,Pais,Ciudad,Dispositivo,Sistema Operativo,Navegador\r\n";

  scans.forEach((s, idx) => {
    const dt = new Date(s.timestamp).toISOString();
    const row = [
      s.id || `SCAN-${idx + 1}`,
      `"${new Date(s.timestamp).toLocaleString('es-ES')}"`,
      s.timestamp,
      `"${s.country || 'N/A'}"`,
      `"${s.city || 'N/A'}"`,
      `"${s.device || 'Mobile'}"`,
      `"${s.os || 'N/A'}"`,
      `"${s.browser || 'N/A'}"`
    ].join(",");
    csv += row + "\r\n";
  });

  // 3. Clicks Table
  csv += "\r\n--- HISTORIAL DE CLICS Y CONVERSIONES ---\r\n";
  csv += "ID,Fecha y Hora,Timestamp,Tipo de Accion,Destino\r\n";

  clicks.forEach((c, idx) => {
    const row = [
      c.id || `CLICK-${idx + 1}`,
      `"${new Date(c.timestamp).toLocaleString('es-ES')}"`,
      c.timestamp,
      `"${c.actionType}"`,
      `"${c.targetUrl || ''}"`
    ].join(",");
    csv += row + "\r\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `metricas_${qrTitle.toLowerCase().replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


