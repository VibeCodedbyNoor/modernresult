import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import {
  DEFAULT_GRADE_SCALE,
  DEFAULT_SETTINGS,
  ExamSettings,
  normalizeSettings,
} from '@/lib/examCalculations';

interface Props {
  value?: any;
  onSave: (settings: ExamSettings) => void;
  saving?: boolean;
}

export default function ExamSettingsForm({ value, onSave, saving }: Props) {
  const [s, setS] = useState<ExamSettings>(value ? normalizeSettings(value) : DEFAULT_SETTINGS);

  const setPart = <K extends keyof ExamSettings>(k: K, patch: Partial<ExamSettings[K]>) =>
    setS(prev => ({ ...prev, [k]: { ...prev[k], ...patch } }));

  const scale = s.grade.scale || DEFAULT_GRADE_SCALE;

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
      {/* PERCENTAGE */}
      <section className="space-y-2">
        <h4 className="font-semibold text-sm">Percentage</h4>
        <RadioGroup value={s.percentage.mode} onValueChange={v => setPart('percentage', { mode: v as any })}>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="auto" /> Auto calculate (sum obtained / sum total × 100)</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="column" /> Use column from sheet</label>
        </RadioGroup>
        {s.percentage.mode === 'column' && (
          <Input placeholder="Column name (e.g. Percentage)" value={s.percentage.column || ''} onChange={e => setPart('percentage', { column: e.target.value })} />
        )}
      </section>

      {/* GRADE */}
      <section className="space-y-2">
        <h4 className="font-semibold text-sm">Grade</h4>
        <RadioGroup value={s.grade.mode} onValueChange={v => setPart('grade', { mode: v as any })}>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="auto" /> Auto (built-in scale)</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="custom" /> Custom grade scale</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="column" /> Use column from sheet</label>
        </RadioGroup>
        {s.grade.mode === 'custom' && (
          <div className="space-y-1 rounded-md border p-2">
            <div className="grid grid-cols-[1fr,90px,90px,32px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Grade</span><span>Min %</span><span>Max %</span><span/>
            </div>
            {scale.map((g, i) => (
              <div key={i} className="grid grid-cols-[1fr,90px,90px,32px] gap-2">
                <Input value={g.name} onChange={e => { const x = [...scale]; x[i] = { ...x[i], name: e.target.value }; setPart('grade', { scale: x }); }} />
                <Input type="number" value={g.min} onChange={e => { const x = [...scale]; x[i] = { ...x[i], min: +e.target.value }; setPart('grade', { scale: x }); }} />
                <Input type="number" value={g.max} onChange={e => { const x = [...scale]; x[i] = { ...x[i], max: +e.target.value }; setPart('grade', { scale: x }); }} />
                <Button type="button" size="icon" variant="ghost" onClick={() => { const x = scale.filter((_, j) => j !== i); setPart('grade', { scale: x }); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => setPart('grade', { scale: [...scale, { name: '', min: 0, max: 0 }] })}><Plus className="h-3 w-3 mr-1" /> Add row</Button>
          </div>
        )}
        {s.grade.mode === 'column' && (
          <Input placeholder="Column name (e.g. Grade)" value={s.grade.column || ''} onChange={e => setPart('grade', { column: e.target.value })} />
        )}
      </section>

      {/* POSITION */}
      <section className="space-y-2">
        <h4 className="font-semibold text-sm">Position / Rank</h4>
        <RadioGroup value={s.position.mode} onValueChange={v => setPart('position', { mode: v as any })}>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="none" /> Do not show position</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="auto" /> Auto rank by percentage</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="column" /> Use column from sheet</label>
        </RadioGroup>
        {s.position.mode === 'column' && (
          <Input placeholder="Column name (e.g. Position)" value={s.position.column || ''} onChange={e => setPart('position', { column: e.target.value })} />
        )}
      </section>

      {/* PASS/FAIL */}
      <section className="space-y-2">
        <h4 className="font-semibold text-sm">Pass / Fail</h4>
        <RadioGroup value={s.result.mode} onValueChange={v => setPart('result', { mode: v as any })}>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="auto" /> Auto — fail if any subject below pass marks OR overall % below threshold</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="column" /> Use column from sheet</label>
        </RadioGroup>
        {s.result.mode === 'auto' && (
          <div className="flex items-center gap-2 text-sm">
            <Label className="text-xs">Minimum passing %</Label>
            <Input className="w-24" type="number" value={s.result.min_percentage ?? 33} onChange={e => setPart('result', { min_percentage: +e.target.value })} />
          </div>
        )}
        {s.result.mode === 'column' && (
          <Input placeholder="Column name (e.g. Status)" value={s.result.column || ''} onChange={e => setPart('result', { column: e.target.value })} />
        )}
      </section>

      <Button className="w-full" disabled={saving} onClick={() => onSave(s)}>{saving ? 'Saving…' : 'Save Calculation Settings'}</Button>
    </div>
  );
}
