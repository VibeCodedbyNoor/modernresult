import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type DMCTemplateId = 'classic' | 'modern' | 'elegant' | 'compact' | 'premium';

export interface DMCSettings {
  template?: DMCTemplateId;
  watermark?: boolean;
  title?: string;
  footer_note?: string;
  address?: string;
  phone?: string;
  email?: string;
  accent_color?: string; // hex, optional override (else use school accent)
}

export interface DMCData {
  schoolName: string;
  logoUrl?: string | null;
  address?: string;
  phone?: string;
  email?: string;
  accentColor?: string;
  examName: string;
  year?: string | number;
  studentName: string;
  fatherName?: string;
  rollNumber: string;
  className: string;
  subjects: { subject: string; total_marks: number; obtained_marks: number; grade?: string }[];
  totalObtained: number;
  totalMarks: number;
  percentage: string;
  grade: string;
  position?: string | number;
  status: 'PASS' | 'FAIL';
}

export const DMC_TEMPLATES: { id: DMCTemplateId; name: string; description: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Traditional bordered certificate with serif title' },
  { id: 'modern', name: 'Modern', description: 'Clean minimal layout with accent bar' },
  { id: 'elegant', name: 'Elegant', description: 'Decorative corners with refined typography' },
  { id: 'compact', name: 'Compact', description: 'Dense layout, great for many subjects' },
  { id: 'premium', name: 'Premium', description: 'Bold colored header with grade badge' },
];

/* ============================================================
   SHARED HELPERS
   ============================================================ */

async function urlToDataUrl(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const blob = await r.blob();
    return await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = () => rej(new Error('FileReader error'));
      fr.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('urlToDataUrl failed:', url, e);
    return null;
  }
}

function hexToRgb(hex: string | undefined, fallback: [number, number, number] = [40, 40, 40]): [number, number, number] {
  if (!hex) return fallback;
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return fallback;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function drawWatermark(doc: jsPDF, text: string, W: number, H: number) {
  doc.saveGraphicsState();
  (doc as any).setGState?.(new (doc as any).GState({ opacity: 0.06 }));
  doc.setFont('helvetica', 'bold').setFontSize(72).setTextColor(0, 0, 0);
  doc.text(text, W / 2, H / 2, { align: 'center', angle: 30 });
  doc.restoreGraphicsState();
  doc.setTextColor(0, 0, 0);
}

function drawFooter(doc: jsPDF, settings: DMCSettings, W: number, H: number) {
  const footer = settings.footer_note || 'This is a computer generated result';
  doc.setFontSize(9).setTextColor(120, 120, 120).text(footer, W / 2, H - 25, { align: 'center' });
  doc.setTextColor(0, 0, 0);
}

function buildMetaLine(data: DMCData, settings: DMCSettings): string {
  return [
    data.address || settings.address,
    data.phone || settings.phone,
    data.email || settings.email,
  ].filter(Boolean).join(' | ');
}

/* ============================================================
   TEMPLATE: CLASSIC
   ============================================================ */
async function renderClassic(doc: jsPDF, data: DMCData, settings: DMCSettings) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Outer double border
  doc.setDrawColor(40, 40, 40).setLineWidth(2);
  doc.rect(25, 25, W - 50, H - 50);
  doc.setLineWidth(0.5);
  doc.rect(32, 32, W - 64, H - 64);

  // Logo
  if (data.logoUrl) {
    const img = await urlToDataUrl(data.logoUrl);
    if (img) try { doc.addImage(img, 'PNG', 45, 42, 55, 55); } catch {}
  }

  // School name (serif feel via times)
  doc.setFont('times', 'bold').setFontSize(22).setTextColor(20, 20, 20);
  doc.text(data.schoolName, W / 2, 65, { align: 'center' });
  doc.setFont('times', 'italic').setFontSize(10).setTextColor(80, 80, 80);
  const meta = buildMetaLine(data, settings);
  if (meta) doc.text(meta, W / 2, 82, { align: 'center' });

  doc.setDrawColor(40, 40, 40).setLineWidth(0.8).line(50, 105, W - 50, 105);
  doc.setLineWidth(0.3).line(50, 108, W - 50, 108);

  doc.setFont('times', 'bold').setFontSize(16).setTextColor(20, 20, 20);
  doc.text(settings.title || 'Detailed Marks Certificate', W / 2, 128, { align: 'center' });

  // Student info
  doc.setFont('helvetica', 'normal').setFontSize(11);
  const yInfo = 156;
  const rowH = 19;
  const cells: [string, string][] = [
    ['Student Name:', data.studentName],
    ['Roll Number:', data.rollNumber],
    ['Father Name:', data.fatherName || '-'],
    ['Class:', data.className],
    ['Exam:', data.examName],
    ['Year:', String(data.year || new Date().getFullYear())],
  ];
  cells.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 55 + col * ((W - 110) / 2);
    const y = yInfo + row * rowH;
    doc.setFont('helvetica', 'bold').text(c[0], x, y);
    doc.setFont('helvetica', 'normal').text(c[1], x + 90, y);
  });

  autoTable(doc, {
    startY: yInfo + 3 * rowH + 8,
    head: [['Subject', 'Total Marks', 'Obtained', 'Grade']],
    body: data.subjects.map(s => [s.subject, String(s.total_marks), String(s.obtained_marks), s.grade || '-']),
    styles: { fontSize: 10, halign: 'center', lineColor: [180, 180, 180], lineWidth: 0.2 },
    columnStyles: { 0: { halign: 'left' } },
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    margin: { left: 50, right: 50 },
  });

  let y = (doc as any).lastAutoTable.finalY + 22;
  doc.setFont('helvetica', 'bold').setFontSize(11);
  doc.text(`Total: ${data.totalObtained} / ${data.totalMarks}`, 55, y);
  doc.text(`Percentage: ${data.percentage}`, 230, y);
  doc.text(`Grade: ${data.grade}`, 410, y);
  y += 20;
  if (data.position && data.position !== '-') doc.text(`Position: ${data.position}`, 55, y);
  doc.setTextColor(data.status === 'PASS' ? 22 : 200, data.status === 'PASS' ? 130 : 30, 40);
  doc.text(`Result: ${data.status}`, 410, y);
  doc.setTextColor(0, 0, 0);

  if (settings.watermark !== false) drawWatermark(doc, data.schoolName, W, H);
  drawFooter(doc, settings, W, H);
}

/* ============================================================
   TEMPLATE: MODERN
   ============================================================ */
async function renderModern(doc: jsPDF, data: DMCData, settings: DMCSettings) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const accent = hexToRgb(settings.accent_color || data.accentColor, [59, 130, 246]);

  // Top accent bar
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.rect(0, 0, W, 6, 'F');

  // Logo
  if (data.logoUrl) {
    const img = await urlToDataUrl(data.logoUrl);
    if (img) try { doc.addImage(img, 'PNG', 40, 30, 48, 48); } catch {}
  }

  doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(25, 25, 25);
  doc.text(data.schoolName, 100, 55);
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(110, 110, 110);
  const meta = buildMetaLine(data, settings);
  if (meta) doc.text(meta, 100, 72);

  // Title
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(accent[0], accent[1], accent[2]);
  doc.text((settings.title || 'Detailed Marks Certificate').toUpperCase(), 40, 115);
  doc.setDrawColor(accent[0], accent[1], accent[2]).setLineWidth(1.2);
  doc.line(40, 119, 140, 119);

  // Student info - 2 col modern
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(120, 120, 120);
  const yInfo = 142;
  const rowH = 22;
  const cells: [string, string][] = [
    ['STUDENT NAME', data.studentName],
    ['ROLL NUMBER', data.rollNumber],
    ['FATHER NAME', data.fatherName || '-'],
    ['CLASS', data.className],
    ['EXAM', data.examName],
    ['YEAR', String(data.year || new Date().getFullYear())],
  ];
  cells.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 40 + col * ((W - 80) / 2);
    const y = yInfo + row * rowH;
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(140, 140, 140);
    doc.text(c[0], x, y);
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(25, 25, 25);
    doc.text(c[1], x, y + 12);
  });

  autoTable(doc, {
    startY: yInfo + 3 * rowH + 12,
    head: [['Subject', 'Total', 'Obtained', 'Grade']],
    body: data.subjects.map(s => [s.subject, String(s.total_marks), String(s.obtained_marks), s.grade || '-']),
    styles: { fontSize: 10, halign: 'center', cellPadding: 6, lineColor: [230, 230, 230], lineWidth: 0.3 },
    columnStyles: { 0: { halign: 'left' } },
    headStyles: { fillColor: [245, 245, 245], textColor: [60, 60, 60], fontStyle: 'bold' },
    margin: { left: 40, right: 40 },
  });

  let y = (doc as any).lastAutoTable.finalY + 25;
  // Summary cards row
  const boxW = (W - 80 - 30) / 4;
  const summary = [
    ['TOTAL', `${data.totalObtained} / ${data.totalMarks}`],
    ['PERCENTAGE', data.percentage],
    ['GRADE', data.grade],
    ['RESULT', data.status],
  ];
  summary.forEach((s, i) => {
    const x = 40 + i * (boxW + 10);
    const isResult = i === 3;
    if (isResult) {
      doc.setFillColor(data.status === 'PASS' ? 220 : 254, data.status === 'PASS' ? 252 : 226, data.status === 'PASS' ? 231 : 226);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.roundedRect(x, y, boxW, 38, 4, 4, 'F');
    doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(120, 120, 120);
    doc.text(s[0], x + boxW / 2, y + 13, { align: 'center' });
    doc.setFont('helvetica', 'bold').setFontSize(12);
    if (isResult) {
      doc.setTextColor(data.status === 'PASS' ? 22 : 200, data.status === 'PASS' ? 130 : 30, 40);
    } else {
      doc.setTextColor(25, 25, 25);
    }
    doc.text(s[1], x + boxW / 2, y + 28, { align: 'center' });
  });
  doc.setTextColor(0, 0, 0);

  if (data.position && data.position !== '-') {
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(110, 110, 110);
    doc.text(`Position: ${data.position}`, 40, y + 58);
  }

  if (settings.watermark !== false) drawWatermark(doc, data.schoolName, W, H);
  drawFooter(doc, settings, W, H);
}

/* ============================================================
   TEMPLATE: ELEGANT
   ============================================================ */
async function renderElegant(doc: jsPDF, data: DMCData, settings: DMCSettings) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const gold: [number, number, number] = [180, 140, 60];

  // Decorative corners
  doc.setDrawColor(gold[0], gold[1], gold[2]).setLineWidth(1.2);
  const corner = 35;
  // top-left
  doc.line(30, 30 + corner, 30, 30); doc.line(30, 30, 30 + corner, 30);
  // top-right
  doc.line(W - 30 - corner, 30, W - 30, 30); doc.line(W - 30, 30, W - 30, 30 + corner);
  // bottom-left
  doc.line(30, H - 30 - corner, 30, H - 30); doc.line(30, H - 30, 30 + corner, H - 30);
  // bottom-right
  doc.line(W - 30 - corner, H - 30, W - 30, H - 30); doc.line(W - 30, H - 30, W - 30, H - 30 - corner);

  // Logo centered
  if (data.logoUrl) {
    const img = await urlToDataUrl(data.logoUrl);
    if (img) try { doc.addImage(img, 'PNG', W / 2 - 25, 50, 50, 50); } catch {}
  }

  // School name
  doc.setFont('times', 'bold').setFontSize(24).setTextColor(40, 40, 40);
  doc.text(data.schoolName, W / 2, 118, { align: 'center' });

  // Ornamental divider
  doc.setDrawColor(gold[0], gold[1], gold[2]).setLineWidth(0.6);
  doc.line(W / 2 - 60, 128, W / 2 - 10, 128);
  doc.line(W / 2 + 10, 128, W / 2 + 60, 128);
  doc.setFillColor(gold[0], gold[1], gold[2]);
  doc.circle(W / 2, 128, 1.5, 'F');

  doc.setFont('times', 'italic').setFontSize(10).setTextColor(110, 110, 110);
  const meta = buildMetaLine(data, settings);
  if (meta) doc.text(meta, W / 2, 142, { align: 'center' });

  doc.setFont('times', 'italic').setFontSize(15).setTextColor(gold[0], gold[1], gold[2]);
  doc.text(settings.title || 'Detailed Marks Certificate', W / 2, 168, { align: 'center' });

  // Student info
  doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(40, 40, 40);
  const yInfo = 195;
  const rowH = 18;
  const cells: [string, string][] = [
    ['Student Name', data.studentName],
    ['Roll Number', data.rollNumber],
    ['Father Name', data.fatherName || '-'],
    ['Class', data.className],
    ['Exam', data.examName],
    ['Year', String(data.year || new Date().getFullYear())],
  ];
  cells.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 60 + col * ((W - 120) / 2);
    const y = yInfo + row * rowH;
    doc.setFont('times', 'italic').setTextColor(120, 120, 120).text(c[0] + ':', x, y);
    doc.setFont('times', 'bold').setTextColor(40, 40, 40).text(c[1], x + 90, y);
  });

  autoTable(doc, {
    startY: yInfo + 3 * rowH + 8,
    head: [['Subject', 'Total', 'Obtained', 'Grade']],
    body: data.subjects.map(s => [s.subject, String(s.total_marks), String(s.obtained_marks), s.grade || '-']),
    styles: { fontSize: 10, halign: 'center', font: 'times', lineColor: [gold[0], gold[1], gold[2]], lineWidth: 0.2 },
    columnStyles: { 0: { halign: 'left' } },
    headStyles: { fillColor: [gold[0], gold[1], gold[2]], textColor: 255, font: 'times', fontStyle: 'bold' },
    margin: { left: 55, right: 55 },
  });

  let y = (doc as any).lastAutoTable.finalY + 22;
  doc.setFont('times', 'bold').setFontSize(11).setTextColor(40, 40, 40);
  doc.text(`Total: ${data.totalObtained} / ${data.totalMarks}`, 60, y);
  doc.text(`Percentage: ${data.percentage}`, 240, y);
  doc.text(`Grade: ${data.grade}`, 410, y);
  y += 20;
  if (data.position && data.position !== '-') doc.text(`Position: ${data.position}`, 60, y);
  doc.setTextColor(data.status === 'PASS' ? 22 : 200, data.status === 'PASS' ? 130 : 30, 40);
  doc.text(`Result: ${data.status}`, 410, y);
  doc.setTextColor(0, 0, 0);

  if (settings.watermark !== false) drawWatermark(doc, data.schoolName, W, H);
  drawFooter(doc, settings, W, H);
}

/* ============================================================
   TEMPLATE: COMPACT
   ============================================================ */
async function renderCompact(doc: jsPDF, data: DMCData, settings: DMCSettings) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Thin border
  doc.setDrawColor(60, 60, 60).setLineWidth(0.5).rect(20, 20, W - 40, H - 40);

  // Compact header
  if (data.logoUrl) {
    const img = await urlToDataUrl(data.logoUrl);
    if (img) try { doc.addImage(img, 'PNG', 28, 26, 38, 38); } catch {}
  }
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(25, 25, 25);
  doc.text(data.schoolName, 75, 42);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(100, 100, 100);
  const meta = buildMetaLine(data, settings);
  if (meta) doc.text(meta, 75, 54);
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(60, 60, 60);
  doc.text(settings.title || 'Detailed Marks Certificate', W - 30, 42, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(120, 120, 120);
  doc.text(`${data.examName} • ${data.year || new Date().getFullYear()}`, W - 30, 54, { align: 'right' });

  doc.setDrawColor(200, 200, 200).line(28, 72, W - 28, 72);

  // Side-by-side: info table | marks table
  const infoY = 84;
  doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(80, 80, 80);
  const infoCells: [string, string][] = [
    ['Name', data.studentName],
    ['Roll No', data.rollNumber],
    ['Father', data.fatherName || '-'],
    ['Class', data.className],
  ];
  infoCells.forEach((c, i) => {
    const y = infoY + i * 16;
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(120, 120, 120);
    doc.text(c[0], 28, y);
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(30, 30, 30);
    doc.text(c[1], 28, y + 10);
  });

  autoTable(doc, {
    startY: infoY - 4,
    head: [['Subject', 'Tot', 'Obt', 'Gr']],
    body: data.subjects.map(s => [s.subject, String(s.total_marks), String(s.obtained_marks), s.grade || '-']),
    styles: { fontSize: 9, cellPadding: 3, halign: 'center', lineColor: [220, 220, 220], lineWidth: 0.2 },
    columnStyles: { 0: { halign: 'left', cellWidth: 'auto' }, 1: { cellWidth: 35 }, 2: { cellWidth: 35 }, 3: { cellWidth: 30 } },
    headStyles: { fillColor: [50, 50, 50], textColor: 255, fontSize: 9 },
    margin: { left: 175, right: 28 },
    tableWidth: W - 175 - 28,
  });

  let y = (doc as any).lastAutoTable.finalY + 16;
  // Compact summary strip
  doc.setFillColor(245, 245, 247);
  doc.roundedRect(28, y, W - 56, 36, 3, 3, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(50, 50, 50);
  const items = [
    `Total: ${data.totalObtained}/${data.totalMarks}`,
    `Percentage: ${data.percentage}`,
    `Grade: ${data.grade}`,
    data.position && data.position !== '-' ? `Position: ${data.position}` : '',
  ].filter(Boolean);
  const stepX = (W - 56) / (items.length + 1);
  items.forEach((it, i) => {
    doc.text(it, 28 + stepX * (i + 0.5) + 20, y + 22);
  });

  // Result badge
  const badgeW = 70, badgeH = 26;
  doc.setFillColor(data.status === 'PASS' ? 22 : 200, data.status === 'PASS' ? 130 : 30, 40);
  doc.roundedRect(W / 2 - badgeW / 2, y + 44, badgeW, badgeH, 4, 4, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(255, 255, 255);
  doc.text(data.status, W / 2, y + 61, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  if (settings.watermark !== false) drawWatermark(doc, data.schoolName, W, H);
  drawFooter(doc, settings, W, H);
}

/* ============================================================
   TEMPLATE: PREMIUM
   ============================================================ */
async function renderPremium(doc: jsPDF, data: DMCData, settings: DMCSettings) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const accent = hexToRgb(settings.accent_color || data.accentColor, [88, 28, 135]);

  // Bold colored header band
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.rect(0, 0, W, 110, 'F');

  // Logo
  if (data.logoUrl) {
    const img = await urlToDataUrl(data.logoUrl);
    if (img) try { doc.addImage(img, 'PNG', 40, 30, 50, 50); } catch {}
  }

  doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(255, 255, 255);
  doc.text(data.schoolName, 105, 55);
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(255, 255, 255);
  const meta = buildMetaLine(data, settings);
  if (meta) doc.text(meta, 105, 72);

  // Title on band
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(255, 255, 255);
  doc.text((settings.title || 'Detailed Marks Certificate').toUpperCase(), W - 40, 95, { align: 'right' });

  // Student info card
  doc.setFillColor(248, 248, 250);
  doc.roundedRect(40, 130, W - 80, 78, 4, 4, 'F');

  doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(40, 40, 40);
  const yInfo = 150;
  const rowH = 19;
  const cells: [string, string][] = [
    ['Student', data.studentName],
    ['Roll No', data.rollNumber],
    ['Father', data.fatherName || '-'],
    ['Class', data.className],
    ['Exam', data.examName],
    ['Year', String(data.year || new Date().getFullYear())],
  ];
  cells.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 55 + col * ((W - 110) / 2);
    const y = yInfo + row * rowH;
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(130, 130, 130);
    doc.text(c[0].toUpperCase(), x, y);
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(30, 30, 30);
    doc.text(c[1], x + 60, y);
  });

  autoTable(doc, {
    startY: 222,
    head: [['Subject', 'Total', 'Obtained', 'Grade']],
    body: data.subjects.map(s => [s.subject, String(s.total_marks), String(s.obtained_marks), s.grade || '-']),
    styles: { fontSize: 10, halign: 'center', cellPadding: 5, lineColor: [accent[0], accent[1], accent[2]], lineWidth: 0.15 },
    columnStyles: { 0: { halign: 'left' } },
    headStyles: { fillColor: [accent[0], accent[1], accent[2]], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    margin: { left: 40, right: 40 },
  });

  let y = (doc as any).lastAutoTable.finalY + 22;

  // Grade badge (prominent circle)
  const badgeR = 32;
  const badgeX = W - 80;
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.circle(badgeX, y + badgeR, badgeR, 'F');
  doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(255, 255, 255);
  doc.text('GRADE', badgeX, y + badgeR - 8, { align: 'center' });
  doc.setFont('helvetica', 'bold').setFontSize(20);
  doc.text(data.grade, badgeX, y + badgeR + 8, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(40, 40, 40);
  doc.text(`Total: ${data.totalObtained} / ${data.totalMarks}`, 50, y + 12);
  doc.text(`Percentage: ${data.percentage}`, 50, y + 32);
  if (data.position && data.position !== '-') doc.text(`Position: ${data.position}`, 50, y + 52);

  doc.setFont('helvetica', 'bold').setFontSize(13);
  doc.setTextColor(data.status === 'PASS' ? 22 : 200, data.status === 'PASS' ? 130 : 30, 40);
  doc.text(`Result: ${data.status}`, 50, y + 74);
  doc.setTextColor(0, 0, 0);

  // Premium = mandatory watermark
  drawWatermark(doc, data.schoolName, W, H);
  drawFooter(doc, settings, W, H);
}

/* ============================================================
   DISPATCHER
   ============================================================ */
const RENDERERS: Record<DMCTemplateId, (doc: jsPDF, data: DMCData, settings: DMCSettings) => Promise<void>> = {
  classic: renderClassic,
  modern: renderModern,
  elegant: renderElegant,
  compact: renderCompact,
  premium: renderPremium,
};

export async function generateDMC(data: DMCData, settings: DMCSettings = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const tpl: DMCTemplateId = (settings.template && RENDERERS[settings.template]) ? settings.template : 'classic';
  const renderer = RENDERERS[tpl];
  await renderer(doc, data, settings);
  doc.save(`DMC_${data.studentName.replace(/\s+/g, '_')}_${data.rollNumber}.pdf`);
}
