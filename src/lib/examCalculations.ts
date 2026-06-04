// Per-exam calculation settings + derivation helpers.

export type PercentageMode = 'auto' | 'column';
export type GradeMode = 'auto' | 'custom' | 'column';
export type PositionMode = 'none' | 'auto' | 'column';
export type ResultMode = 'auto' | 'column';

export interface GradeRange { name: string; min: number; max: number }

export interface ExamSettings {
  percentage: { mode: PercentageMode; column?: string };
  grade: { mode: GradeMode; scale?: GradeRange[]; column?: string };
  position: { mode: PositionMode; column?: string };
  result: { mode: ResultMode; min_percentage?: number; column?: string };
}

export const DEFAULT_GRADE_SCALE: GradeRange[] = [
  { name: 'A+', min: 90, max: 100 },
  { name: 'A',  min: 80, max: 89 },
  { name: 'B',  min: 70, max: 79 },
  { name: 'C',  min: 60, max: 69 },
  { name: 'D',  min: 50, max: 59 },
  { name: 'F',  min: 0,  max: 49 },
];

export const DEFAULT_SETTINGS: ExamSettings = {
  percentage: { mode: 'auto' },
  grade: { mode: 'auto', scale: DEFAULT_GRADE_SCALE },
  position: { mode: 'none' },
  result: { mode: 'auto', min_percentage: 33 },
};

export function normalizeSettings(raw: any): ExamSettings {
  const s = raw && typeof raw === 'object' ? raw : {};
  return {
    percentage: { mode: s.percentage?.mode === 'column' ? 'column' : 'auto', column: s.percentage?.column },
    grade: {
      mode: ['auto','custom','column'].includes(s.grade?.mode) ? s.grade.mode : 'auto',
      scale: Array.isArray(s.grade?.scale) && s.grade.scale.length ? s.grade.scale : DEFAULT_GRADE_SCALE,
      column: s.grade?.column,
    },
    position: { mode: ['none','auto','column'].includes(s.position?.mode) ? s.position.mode : 'none', column: s.position?.column },
    result: {
      mode: s.result?.mode === 'column' ? 'column' : 'auto',
      min_percentage: typeof s.result?.min_percentage === 'number' ? s.result.min_percentage : 33,
      column: s.result?.column,
    },
  };
}

export interface RawResultRow {
  subjects: any[];               // [{ subject, obtained_marks, total_marks, pass_marks? }]
  raw?: Record<string, any>;     // optional column-mode values: percentage, grade, position, status
  position?: string | number;
}

export interface DerivedResult {
  percentage: string;        // e.g. "87.5%"
  percentageValue: number;   // 87.5
  grade: string;
  position: string | number;
  status: 'PASS' | 'FAIL';
  remarks: string;
}

function gradeFor(scale: GradeRange[], pct: number): string {
  for (const r of scale) if (pct >= r.min && pct <= r.max + 0.0001) return r.name;
  return scale[scale.length - 1]?.name || 'F';
}

export function computeDerived(row: RawResultRow, settings: ExamSettings): DerivedResult {
  const s = normalizeSettings(settings);
  const subjects = row.subjects || [];
  const obtained = subjects.reduce((a: number, x: any) => a + (Number(x.obtained_marks) || 0), 0);
  const total    = subjects.reduce((a: number, x: any) => a + (Number(x.total_marks) || 0), 0);
  const autoPct  = total > 0 ? (obtained / total) * 100 : 0;

  let pctVal = autoPct;
  if (s.percentage.mode === 'column' && row.raw && s.percentage.column) {
    const v = parseFloat(String(row.raw[s.percentage.column]).replace('%',''));
    if (!isNaN(v)) pctVal = v;
  }

  let grade: string;
  if (s.grade.mode === 'column' && row.raw && s.grade.column) {
    grade = String(row.raw[s.grade.column] || '').trim() || gradeFor(s.grade.scale!, pctVal);
  } else {
    grade = gradeFor(s.grade.scale!, pctVal);
  }

  let position: string | number = '-';
  if (s.position.mode === 'auto') position = row.position ?? '-';
  else if (s.position.mode === 'column' && row.raw && s.position.column) {
    position = row.raw[s.position.column] ?? '-';
  }

  let status: 'PASS' | 'FAIL';
  if (s.result.mode === 'column' && row.raw && s.result.column) {
    const v = String(row.raw[s.result.column] || '').toUpperCase();
    status = v.startsWith('F') ? 'FAIL' : 'PASS';
  } else {
    const minPct = s.result.min_percentage ?? 33;
    const subjectFail = subjects.some((x: any) => {
      const pass = Number(x.pass_marks);
      if (!pass || !isFinite(pass)) return false;
      return (Number(x.obtained_marks) || 0) < pass;
    });
    status = (pctVal >= minPct && !subjectFail) ? 'PASS' : 'FAIL';
  }

  const remarks = pctVal >= 80 ? 'Excellent' : pctVal >= 60 ? 'Good' : pctVal >= 50 ? 'Satisfactory' : status === 'FAIL' ? 'Needs Improvement' : 'Pass';
  return { percentage: pctVal.toFixed(1) + '%', percentageValue: +pctVal.toFixed(2), grade, position, status, remarks };
}
