import * as XLSX from 'xlsx';

export type SheetMode = 'single' | 'per_sheet';
export type SearchMode = 'roll_number' | 'name' | 'both';

export interface ParsedSheet {
  name: string;
  headers: string[];
  rows: Record<string, any>[];
}

export interface FieldMap {
  name: string;          // header for student name
  roll: string | '';     // header for roll number; '' = not in file
  father: string | '';   // '' = skip
  class: string | '';    // '' = skip (or hidden in per_sheet mode)
}

export interface SubjectMap {
  column: string;
  display: string;
  total: number;
  pass: number;
  skip?: boolean;
}

export interface MappingConfig {
  sheet_mode: SheetMode;
  search_mode: SearchMode;
  fields: FieldMap;
  subjects: SubjectMap[];
}

export interface ParsedRow {
  _sheetName: string;
  _rowIndex: number;
  student_name: string;
  roll_number: string;
  father_name: string;
  class_name: string;
  subjects: Record<string, { obtained: number; total: number }>;
  total_marks: number;
  errors: string[];
}

const EMPTY_HEADER = /^__EMPTY/;

export function parseWorkbook(buffer: ArrayBuffer): { sheets: ParsedSheet[] } {
  const wb = XLSX.read(buffer);
  const sheets: ParsedSheet[] = [];
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
    if (!rows.length) continue;
    const headers = Object.keys(rows[0]).filter(h => h && h.trim() && !EMPTY_HEADER.test(h));
    sheets.push({ name, headers, rows });
  }
  return { sheets };
}

export function parseMarks(v: any): number {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return Math.round(v * 100) / 100;
  const s = String(v).trim();
  const m = s.match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}

export function applyMapping(
  sheets: ParsedSheet[],
  selectedSheets: string[],
  mode: SheetMode,
  fields: FieldMap,
  subjects: SubjectMap[],
): { rows: ParsedRow[]; skipped: number } {
  const out: ParsedRow[] = [];
  let skipped = 0;
  const activeSubjects = subjects.filter(s => !s.skip && s.column);
  const used = sheets.filter(s => selectedSheets.includes(s.name));

  used.forEach(sheet => {
    sheet.rows.forEach((row, idx) => {
      const studentName = String(row[fields.name] ?? '').trim();
      const rollRaw = fields.roll ? String(row[fields.roll] ?? '').trim() : '';
      const fatherName = fields.father ? String(row[fields.father] ?? '').trim() : '';
      let className = '';
      if (mode === 'per_sheet') className = sheet.name;
      else if (fields.class) className = String(row[fields.class] ?? '').trim();

      const subjectMap: Record<string, { obtained: number; total: number }> = {};
      let total = 0;
      let anyMark = false;
      for (const s of activeSubjects) {
        const m = parseMarks(row[s.column]);
        if (m !== 0) anyMark = true;
        subjectMap[s.display || s.column] = { obtained: m, total: s.total };
        total += m;
      }

      // Skip fully empty rows
      if (!studentName && !rollRaw && !anyMark) {
        skipped++;
        return;
      }

      out.push({
        _sheetName: sheet.name,
        _rowIndex: idx,
        student_name: studentName,
        roll_number: rollRaw,
        father_name: fatherName,
        class_name: className,
        subjects: subjectMap,
        total_marks: total,
        errors: [],
      });
    });
  });

  return { rows: validateRows(out, subjects), skipped };
}

export function validateRows(rows: ParsedRow[], subjects: SubjectMap[]): ParsedRow[] {
  const seen = new Map<string, number>();
  const activeSubjects = subjects.filter(s => !s.skip && s.column);
  return rows.map(r => {
    const errs: string[] = [];
    if (!r.student_name) errs.push('Missing student name');
    if (r.roll_number) {
      const key = `${r.class_name}::${r.roll_number}`;
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    for (const s of activeSubjects) {
      const display = s.display || s.column;
      const got = r.subjects[display]?.obtained ?? 0;
      if (got > s.total) errs.push(`${display}: ${got} > ${s.total}`);
    }
    return { ...r, errors: errs };
  }).map(r => {
    if (r.roll_number) {
      const key = `${r.class_name}::${r.roll_number}`;
      if ((seen.get(key) || 0) > 1) {
        return { ...r, errors: [...r.errors, 'Duplicate roll number'] };
      }
    }
    return r;
  });
}

export function buildSampleWorkbook(subjectCount: number, includeFather = true): Blob {
  const headers = ['Roll Number', 'Student Name'];
  if (includeFather) headers.push('Father Name');
  headers.push('Class');
  for (let i = 1; i <= subjectCount; i++) headers.push(`Subject ${i}`);

  const sample1 = ['001', 'Ahmad Khan', includeFather ? 'Ali Khan' : null, '10'].filter(v => v !== null);
  const sample2 = ['002', 'Fatima Noor', includeFather ? 'Hassan Noor' : null, '10'].filter(v => v !== null);
  for (let i = 0; i < subjectCount; i++) {
    sample1.push(String(75 + i));
    sample2.push(String(85 - i));
  }

  const ws = XLSX.utils.aoa_to_sheet([headers, sample1, sample2]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Results');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
