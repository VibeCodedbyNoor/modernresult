import React from 'react';
import { getTemplate } from '@/lib/resultTemplates';

interface SubjectRow {
  name: string;
  obtained: number;
  total: number;
  percentage: number;
}

interface MarksheetCardProps {
  school: {
    name: string;
    result_template: string;
  };
  examName: string;
  student: {
    student_name: string;
    roll_number: string;
    class_name: string;
    grade: string;
    subjects: any;
    total_marks: number;
  };
  cardWidth?: number;
}

const NON_SUBJECT_PATTERNS = [
  'total', 'position', 'rank', 'percentage', 'percent', '%age', 'grade', 'result', 'gpa', 'cgpa',
  'status', 'remark', 'remarks', 'avg', 'average', 'division', 'obtained', 'overall', 'marks',
];

const normalizeColumn = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9%]/g, ' ').replace(/\s+/g, ' ').trim();

const isNonSubjectColumn = (value: string) => {
  const normalized = normalizeColumn(value);
  return NON_SUBJECT_PATTERNS.some((pattern) => normalized.includes(pattern));
};

const getNumeric = (value: unknown) => {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const match = raw.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const parseSubjectValue = (value: unknown): { obtained: number; total: number } => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const row = value as Record<string, unknown>;
    const obtained = getNumeric(row.obtained ?? row.obt ?? row.marks ?? row.score ?? row.mark ?? 0);
    const total = getNumeric(row.total ?? row.max ?? row.maximum ?? 100) || 100;
    return { obtained, total };
  }
  const raw = String(value ?? '').trim();
  const fraction = raw.match(/(\d+)\s*\/\s*(\d+)/);
  if (fraction) return { obtained: Number(fraction[1]), total: Number(fraction[2]) || 100 };
  return { obtained: getNumeric(raw), total: 100 };
};

function processSubjects(subjects: any) {
  let position = '—';
  let percentage: number | null = null;
  const subjectRows: SubjectRow[] = [];

  for (const [key, value] of Object.entries(subjects || {})) {
    const normalized = normalizeColumn(key);
    if (normalized.includes('position') || normalized.includes('rank')) {
      const parsed = String(value ?? '').trim();
      if (parsed) position = parsed;
      continue;
    }
    if (normalized.includes('percent') || normalized.includes('%age') || normalized === '%') {
      const parsed = getNumeric(value);
      if (parsed > 0) percentage = parsed;
      continue;
    }
    if (isNonSubjectColumn(key)) continue;
    const { obtained, total } = parseSubjectValue(value);
    subjectRows.push({ name: key, obtained, total, percentage: total > 0 ? (obtained / total) * 100 : 0 });
  }

  const totalObtained = subjectRows.reduce((sum, s) => sum + s.obtained, 0);
  const totalMax = subjectRows.reduce((sum, s) => sum + s.total, 0);
  const computedPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  return {
    subjects: subjectRows,
    position,
    percentage: percentage ?? computedPercentage,
    totalObtained,
    totalMax,
  };
}

const MarksheetCard = React.forwardRef<HTMLDivElement, MarksheetCardProps>(
  ({ school, examName, student, cardWidth = 980 }, ref) => {
    const tpl = getTemplate(school.result_template || 'luxury-gold');
    const accent = tpl.accentColor;
    const processed = processSubjects(student.subjects);

    const leftSubjects = processed.subjects.slice(0, Math.ceil(processed.subjects.length / 2));
    const rightSubjects = processed.subjects.slice(Math.ceil(processed.subjects.length / 2));

    return (
      <div
        ref={ref}
        style={{
          width: cardWidth,
          padding: 32,
          borderRadius: 16,
          background: tpl.cardBg,
          border: `1px solid ${tpl.cardBorder}`,
          color: tpl.textPrimary,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: `1px solid ${tpl.cardBorder}` }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: accent, margin: 0 }}>{school.name}</h2>
          <p style={{ fontSize: 13, marginTop: 4, color: tpl.textSecondary }}>
            {examName} — {student.class_name}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: '16px 0', borderBottom: `1px solid ${tpl.cardBorder}` }}>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: tpl.textSecondary }}>Student</p>
            <p style={{ fontSize: 22, fontWeight: 700 }}>{student.student_name}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: tpl.textSecondary }}>Roll</p>
            <p style={{ fontSize: 20, fontWeight: 600, fontFamily: 'monospace' }}>{student.roll_number}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: tpl.textSecondary }}>Position / Percentage</p>
            <p style={{ fontSize: 20, fontWeight: 700 }}>
              {processed.position} • {processed.percentage.toFixed(2)}%
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingTop: 16 }}>
          {[leftSubjects, rightSubjects].map((list, index) => (
            <table key={index} style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', border: `1px solid ${tpl.cardBorder}`, borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: tpl.tableHeaderBg }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: tpl.textSecondary }}>Subject</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, textTransform: 'uppercase', color: tpl.textSecondary }}>Obt</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, textTransform: 'uppercase', color: tpl.textSecondary }}>Total</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, textTransform: 'uppercase', color: tpl.textSecondary }}>%</th>
                </tr>
              </thead>
              <tbody>
                {list.map((subject) => (
                  <tr key={subject.name} style={{ borderTop: `1px solid ${tpl.cardBorder}` }}>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{subject.name}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'monospace' }}>{subject.obtained}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'monospace' }}>{subject.total}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: accent }}>{subject.percentage.toFixed(0)}%</td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: tpl.textSecondary }}>No subjects</td>
                  </tr>
                )}
              </tbody>
            </table>
          ))}
        </div>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${tpl.cardBorder}`, display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: 18, fontWeight: 600 }}>
          <span>Total: {processed.totalObtained}/{processed.totalMax}</span>
          <span style={{ color: accent }}>Grade: {student.grade}</span>
        </div>
      </div>
    );
  }
);

MarksheetCard.displayName = 'MarksheetCard';
export default MarksheetCard;
