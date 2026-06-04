import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DMCSettings {
  watermark?: boolean;
  title?: string;
  footer_note?: string;
  controller_signature_url?: string | null;
  principal_signature_url?: string | null;
}

export interface DMCData {
  schoolName: string;
  logoUrl?: string | null;
  address?: string;
  phone?: string;
  email?: string;
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

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { mode: 'cors' });
    const blob = await r.blob();
    return await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateDMC(data: DMCData, settings: DMCSettings = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Header
  if (data.logoUrl) {
    const img = await urlToDataUrl(data.logoUrl);
    if (img) try { doc.addImage(img, 'PNG', 40, 30, 60, 60); } catch {}
  }
  doc.setFont('helvetica', 'bold').setFontSize(20).text(data.schoolName, W / 2, 55, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(10);
  const meta = [data.address, data.phone, data.email].filter(Boolean).join(' | ');
  if (meta) doc.text(meta, W / 2, 72, { align: 'center' });

  doc.setLineWidth(0.8).line(40, 100, W - 40, 100);

  doc.setFont('helvetica', 'bold').setFontSize(14)
    .text(settings.title || 'Detailed Marks Certificate', W / 2, 122, { align: 'center' });

  // Student info grid
  doc.setFont('helvetica', 'normal').setFontSize(11);
  const yInfo = 150;
  const rowH = 18;
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
    const x = 50 + col * ((W - 100) / 2);
    const y = yInfo + row * rowH;
    doc.setFont('helvetica', 'bold').text(c[0], x, y);
    doc.setFont('helvetica', 'normal').text(c[1], x + 90, y);
  });

  // Marks table
  autoTable(doc, {
    startY: yInfo + 4 * rowH + 4,
    head: [['Subject', 'Total Marks', 'Obtained', 'Grade']],
    body: data.subjects.map(s => [s.subject, String(s.total_marks), String(s.obtained_marks), s.grade || '-']),
    styles: { fontSize: 10, halign: 'center' },
    columnStyles: { 0: { halign: 'left' } },
    headStyles: { fillColor: [40, 40, 40] },
  });

  let y = (doc as any).lastAutoTable.finalY + 20;

  // Totals
  doc.setFont('helvetica', 'bold').setFontSize(11);
  doc.text(`Total: ${data.totalObtained} / ${data.totalMarks}`, 50, y);
  doc.text(`Percentage: ${data.percentage}`, 250, y);
  doc.text(`Grade: ${data.grade}`, 430, y);
  y += 18;
  if (data.position && data.position !== '-') doc.text(`Position: ${data.position}`, 50, y);
  doc.setTextColor(data.status === 'PASS' ? 22 : 200, data.status === 'PASS' ? 130 : 30, 40);
  doc.text(`Result: ${data.status}`, 430, y);
  doc.setTextColor(0, 0, 0);

  // Watermark
  if (settings.watermark !== false) {
    doc.saveGraphicsState();
    (doc as any).setGState?.(new (doc as any).GState({ opacity: 0.06 }));
    doc.setFont('helvetica', 'bold').setFontSize(72).setTextColor(0, 0, 0);
    doc.text(data.schoolName, W / 2, H / 2, { align: 'center', angle: 30 });
    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0);
  }

  // Signatures
  const sigY = H - 110;
  doc.setFont('helvetica', 'normal').setFontSize(10);
  if (settings.controller_signature_url) {
    const img = await urlToDataUrl(settings.controller_signature_url);
    if (img) try { doc.addImage(img, 'PNG', 70, sigY - 30, 100, 30); } catch {}
  }
  if (settings.principal_signature_url) {
    const img = await urlToDataUrl(settings.principal_signature_url);
    if (img) try { doc.addImage(img, 'PNG', W - 170, sigY - 30, 100, 30); } catch {}
  }
  doc.line(60, sigY, 200, sigY);
  doc.line(W - 200, sigY, W - 60, sigY);
  doc.text('Controller Signature', 130, sigY + 14, { align: 'center' });
  doc.text('Principal Signature', W - 130, sigY + 14, { align: 'center' });

  const footer = settings.footer_note || 'This is a computer generated result';
  doc.setFontSize(9).setTextColor(120, 120, 120).text(footer, W / 2, H - 30, { align: 'center' });

  doc.save(`DMC_${data.studentName.replace(/\s+/g, '_')}_${data.rollNumber}.pdf`);
}
