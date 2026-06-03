import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, Check, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  parseWorkbook, applyMapping, validateRows,
  buildSampleWorkbook, downloadBlob,
  type ParsedSheet, type SheetMode, type SearchMode,
  type FieldMap, type SubjectMap, type ParsedRow, type MappingConfig,
} from '@/lib/uploadWizard';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  examId: string;
  schoolId: string;
  onComplete: () => void;
}

interface Template { id: string; name: string; mapping_config: MappingConfig; }

const NONE = '__none__';

export default function UploadWizard({ open, onOpenChange, examId, schoolId, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [sheetMode, setSheetMode] = useState<SheetMode>('single');
  const [searchMode, setSearchMode] = useState<SearchMode>('roll_number');
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [fields, setFields] = useState<FieldMap>({ name: '', roll: '', father: '', class: '' });
  const [subjects, setSubjects] = useState<SubjectMap[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [sampleSubjectCount, setSampleSubjectCount] = useState(5);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1); setFile(null); setSheets([]); setSheetMode('single');
      setSearchMode('roll_number'); setSelectedSheets([]);
      setFields({ name: '', roll: '', father: '', class: '' });
      setSubjects([]); setRows([]); setSkipped(0); setImporting(false); setProgress(0);
      setTemplateName(''); setSaveAsTemplate(false);
    } else {
      // Load templates
      supabase.from('column_mappings').select('id, name, mapping_config')
        .eq('school_id', schoolId)
        .then(({ data }) => setTemplates((data as any) || []));
    }
  }, [open, schoolId]);

  const activeSheet = sheets.find(s => selectedSheets.includes(s.name)) || sheets[0];
  const allHeaders = activeSheet?.headers || [];
  const usedColumns = new Set([fields.name, fields.roll, fields.father, fields.class].filter(Boolean));
  const unmappedHeaders = allHeaders.filter(h => !usedColumns.has(h));

  // Build / refresh subjects when fields change
  useEffect(() => {
    if (!allHeaders.length) return;
    setSubjects(prev => {
      const existing = new Map(prev.map(s => [s.column, s]));
      return unmappedHeaders.map(h => existing.get(h) || ({
        column: h, display: h, total: 100, pass: 33, skip: false,
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.name, fields.roll, fields.father, fields.class, activeSheet?.name]);

  async function handleFileChange(f: File) {
    setFile(f);
    try {
      const buf = await f.arrayBuffer();
      const { sheets: parsed } = parseWorkbook(buf);
      if (!parsed.length) { toast.error('No data found'); return; }
      setSheets(parsed);
      setSelectedSheets([parsed[0].name]);
      // Auto-detect best-guess defaults
      const headers = parsed[0].headers;
      const find = (re: RegExp) => headers.find(h => re.test(h.toLowerCase().replace(/[^a-z]/g, '')));
      setFields({
        name: find(/(student|name)/) || '',
        roll: find(/(roll|reg|id)/) || '',
        father: find(/(father|guardian)/) || '',
        class: find(/(class|grade|section)/) || '',
      });
    } catch (e: any) {
      toast.error('Parse failed: ' + e.message);
    }
  }

  function applyTemplate(t: Template) {
    const cfg = t.mapping_config;
    setSheetMode(cfg.sheet_mode);
    setSearchMode(cfg.search_mode);
    setFields(cfg.fields);
    setSubjects(cfg.subjects);
    toast.success(`Template "${t.name}" applied`);
  }

  function goToStep(n: number) {
    if (n === 4) {
      if (!fields.name) { toast.error('Map the Student Name column'); return; }
      if (sheetMode === 'single' && !fields.class) {
        // class is optional but warn
      }
      const result = applyMapping(sheets, selectedSheets, sheetMode, fields, subjects);
      setRows(result.rows); setSkipped(result.skipped);
    }
    setStep(n);
  }

  async function handleImport() {
    setImporting(true); setProgress(0);
    try {
      const valid = rows.filter(r => r.student_name && r.errors.length === 0);
      const invalid = rows.length - valid.length;
      if (!valid.length) { toast.error('No valid rows to import'); setImporting(false); return; }

      // Group + position
      const byClass: Record<string, ParsedRow[]> = {};
      for (const r of valid) {
        const k = r.class_name || '_';
        (byClass[k] = byClass[k] || []).push(r);
      }
      const toInsert: any[] = [];
      for (const cls of Object.keys(byClass)) {
        byClass[cls].sort((a, b) => b.total_marks - a.total_marks);
        byClass[cls].forEach((r, i) => {
          const pct = Object.values(r.subjects).reduce((s, v) => s + (v.total || 0), 0);
          const got = r.total_marks;
          const pp = pct > 0 ? (got / pct) * 100 : 0;
          const grade = pp >= 90 ? 'A+' : pp >= 80 ? 'A' : pp >= 70 ? 'B' : pp >= 60 ? 'C' : pp >= 50 ? 'D' : 'F';
          toInsert.push({
            exam_id: examId,
            roll_number: r.roll_number || `AUTO-${i + 1}`,
            student_name: r.student_name,
            father_name: r.father_name,
            class_name: r.class_name || 'General',
            subjects: { ...r.subjects, Position: i + 1 },
            total_marks: r.total_marks,
            grade,
          });
        });
      }

      // Delete + insert in chunks
      await supabase.from('results').delete().eq('exam_id', examId);
      const CHUNK = 500;
      for (let i = 0; i < toInsert.length; i += CHUNK) {
        const slice = toInsert.slice(i, i + CHUNK);
        const { error } = await supabase.from('results').insert(slice);
        if (error) throw error;
        setProgress(Math.round(((i + slice.length) / toInsert.length) * 100));
      }

      // Update exam search_mode
      await supabase.from('exams').update({ search_mode: searchMode }).eq('id', examId);

      // Upsert exam_subjects
      const subjRows = subjects.filter(s => !s.skip && s.column).map(s => ({
        exam_id: examId,
        subject_name: s.display || s.column,
        total_marks: s.total,
        pass_marks: s.pass,
      }));
      if (subjRows.length) {
        await supabase.from('exam_subjects').delete().eq('exam_id', examId);
        await supabase.from('exam_subjects').insert(subjRows);
      }

      // Save mapping template
      if (saveAsTemplate && templateName.trim()) {
        const cfg: MappingConfig = { sheet_mode: sheetMode, search_mode: searchMode, fields, subjects };
        await supabase.from('column_mappings').insert({
          school_id: schoolId, name: templateName.trim(), mapping_config: cfg as any,
        });
      }

      toast.success(`Imported ${toInsert.length} students${invalid ? ` (${invalid} skipped due to errors)` : ''}`);
      onComplete();
      onOpenChange(false);
    } catch (e: any) {
      toast.error('Import failed: ' + e.message);
    } finally {
      setImporting(false);
    }
  }

  function downloadSample() {
    const blob = buildSampleWorkbook(sampleSubjectCount);
    downloadBlob(blob, 'result-template.xlsx');
    setSampleDialogOpen(false);
  }

  const errorCount = rows.reduce((s, r) => s + (r.errors.length > 0 ? 1 : 0), 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload Results — Step {step} of 5
            </DialogTitle>
            <div className="flex gap-1 mt-2">
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`h-1 flex-1 rounded ${n <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </DialogHeader>

          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Upload your .xlsx, .xls, or .csv file.</p>
                <Button variant="ghost" size="sm" onClick={() => setSampleDialogOpen(true)} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Sample Template
                </Button>
              </div>
              <Input
                type="file" accept=".xlsx,.xls,.csv"
                onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              {sheets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preview (first 5 rows of "{sheets[0].name}"):</p>
                  <div className="border rounded overflow-x-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {sheets[0].headers.map(h => <TableHead key={h}>{h}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheets[0].rows.slice(0, 5).map((r, i) => (
                          <TableRow key={i}>
                            {sheets[0].headers.map(h => <TableCell key={h}>{String(r[h] ?? '')}</TableCell>)}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Found {sheets.length} sheet(s): {sheets.map(s => s.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Structure */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">How is your data structured?</Label>
                <RadioGroup value={sheetMode} onValueChange={v => setSheetMode(v as SheetMode)}>
                  <div className="flex items-start gap-2 p-3 border rounded hover:bg-accent/50">
                    <RadioGroupItem value="single" id="m1" className="mt-0.5" />
                    <Label htmlFor="m1" className="font-normal cursor-pointer">
                      <div>All classes in one sheet</div>
                      <div className="text-xs text-muted-foreground">One column contains class names</div>
                    </Label>
                  </div>
                  <div className="flex items-start gap-2 p-3 border rounded hover:bg-accent/50">
                    <RadioGroupItem value="per_sheet" id="m2" className="mt-0.5" />
                    <Label htmlFor="m2" className="font-normal cursor-pointer">
                      <div>Each sheet is a separate class</div>
                      <div className="text-xs text-muted-foreground">Sheet name = class name</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {sheetMode === 'per_sheet' && (
                <div className="space-y-2">
                  <Label>Select sheets to import:</Label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto border rounded p-2">
                    {sheets.map(s => (
                      <div key={s.name} className="flex items-center gap-2">
                        <Checkbox
                          id={`sh-${s.name}`}
                          checked={selectedSheets.includes(s.name)}
                          onCheckedChange={c => {
                            setSelectedSheets(prev =>
                              c ? [...prev, s.name] : prev.filter(n => n !== s.name)
                            );
                          }}
                        />
                        <Label htmlFor={`sh-${s.name}`} className="font-normal cursor-pointer">
                          {s.name} <span className="text-xs text-muted-foreground">({s.rows.length} rows)</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-base">What do students use to search?</Label>
                <RadioGroup value={searchMode} onValueChange={v => setSearchMode(v as SearchMode)}>
                  <div className="flex items-center gap-2 p-3 border rounded hover:bg-accent/50">
                    <RadioGroupItem value="roll_number" id="s1" />
                    <Label htmlFor="s1" className="font-normal cursor-pointer">Roll Number only (recommended)</Label>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded hover:bg-accent/50">
                    <RadioGroupItem value="name" id="s2" />
                    <Label htmlFor="s2" className="font-normal cursor-pointer">Name only</Label>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded hover:bg-accent/50">
                    <RadioGroupItem value="both" id="s3" />
                    <Label htmlFor="s3" className="font-normal cursor-pointer">Both Roll Number and Name</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* STEP 3: Mapping */}
          {step === 3 && (
            <div className="space-y-6">
              {templates.length > 0 && (
                <div className="p-3 bg-muted/50 rounded space-y-2">
                  <Label className="text-sm">Use saved template:</Label>
                  <div className="flex gap-2 flex-wrap">
                    {templates.map(t => (
                      <Button key={t.id} variant="outline" size="sm" onClick={() => applyTemplate(t)}>
                        {t.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-base">Required Fields</Label>
                <div className="space-y-2">
                  {[
                    { key: 'name', label: 'Student Name', required: true, allowSkip: false },
                    { key: 'roll', label: 'Roll Number', required: false, allowSkip: true, skipLabel: 'Not in file' },
                    { key: 'father', label: 'Father Name', required: false, allowSkip: true, skipLabel: 'Skip' },
                    ...(sheetMode === 'single' ? [{ key: 'class', label: 'Class', required: false, allowSkip: true, skipLabel: 'Skip' }] : []),
                  ].map(f => (
                    <div key={f.key} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 items-center">
                      <Label className="text-sm">{f.label}{f.required && ' *'}</Label>
                      <Select
                        value={(fields as any)[f.key] || (f.allowSkip ? NONE : '')}
                        onValueChange={v => setFields(prev => ({ ...prev, [f.key]: v === NONE ? '' : v }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Choose column" /></SelectTrigger>
                        <SelectContent>
                          {f.allowSkip && <SelectItem value={NONE}>— {f.skipLabel} —</SelectItem>}
                          {allHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Subject Mapping</Label>
                <p className="text-xs text-muted-foreground">All remaining columns. Set "Skip" for non-subject columns.</p>
                <div className="border rounded overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Your Column</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Use As</TableHead>
                        <TableHead className="w-24">Total</TableHead>
                        <TableHead className="w-24">Pass</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((s, idx) => (
                        <TableRow key={s.column}>
                          <TableCell className="font-mono text-xs">{s.column}</TableCell>
                          <TableCell>
                            <Input value={s.display} onChange={e =>
                              setSubjects(prev => prev.map((x, i) => i === idx ? { ...x, display: e.target.value } : x))
                            } className="h-8" disabled={s.skip} />
                          </TableCell>
                          <TableCell>
                            <Select value={s.skip ? 'skip' : 'subject'} onValueChange={v =>
                              setSubjects(prev => prev.map((x, i) => i === idx ? { ...x, skip: v === 'skip' } : x))
                            }>
                              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="subject">Subject</SelectItem>
                                <SelectItem value="skip">Skip</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={s.total} onChange={e =>
                              setSubjects(prev => prev.map((x, i) => i === idx ? { ...x, total: Number(e.target.value) || 0 } : x))
                            } className="h-8" disabled={s.skip} />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={s.pass} onChange={e =>
                              setSubjects(prev => prev.map((x, i) => i === idx ? { ...x, pass: Number(e.target.value) || 0 } : x))
                            } className="h-8" disabled={s.skip} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Preview & Validate */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline">{rows.length} students found</Badge>
                {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
                {skipped > 0 && <Badge variant="secondary">{skipped} empty rows skipped</Badge>}
              </div>
              <div className="border rounded max-h-[50vh] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Father</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 200).map((r, idx) => (
                      <TableRow key={idx} className={r.errors.length ? 'bg-destructive/10' : ''}>
                        <TableCell>
                          <Input value={r.roll_number} onChange={e => {
                            const next = [...rows];
                            next[idx] = { ...next[idx], roll_number: e.target.value };
                            setRows(validateRows(next, subjects));
                          }} className="h-7 w-24" />
                        </TableCell>
                        <TableCell>
                          <Input value={r.student_name} onChange={e => {
                            const next = [...rows];
                            next[idx] = { ...next[idx], student_name: e.target.value };
                            setRows(validateRows(next, subjects));
                          }} className="h-7" />
                        </TableCell>
                        <TableCell className="text-xs">{r.father_name}</TableCell>
                        <TableCell className="text-xs">{r.class_name}</TableCell>
                        <TableCell className="text-xs">{r.total_marks}</TableCell>
                        <TableCell className="text-xs text-destructive">{r.errors.join(', ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {rows.length > 200 && (
                <p className="text-xs text-muted-foreground">Showing first 200 of {rows.length} rows.</p>
              )}
            </div>
          )}

          {/* STEP 5: Confirm */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 border rounded space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Students to import:</span><strong>{rows.filter(r => r.student_name && r.errors.length === 0).length}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">With errors (skipped):</span><strong>{errorCount}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Subjects:</span><strong>{subjects.filter(s => !s.skip).length}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Search mode:</span><strong>{searchMode}</strong></div>
              </div>

              <div className="space-y-2 p-3 border rounded">
                <div className="flex items-center gap-2">
                  <Checkbox id="save" checked={saveAsTemplate} onCheckedChange={c => setSaveAsTemplate(!!c)} />
                  <Label htmlFor="save" className="font-normal cursor-pointer">Save this column mapping as a template for next time</Label>
                </div>
                {saveAsTemplate && (
                  <Input placeholder="Template name (e.g. Final Term 2025)"
                    value={templateName} onChange={e => setTemplateName(e.target.value)} />
                )}
              </div>

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-xs text-center text-muted-foreground">Importing... {progress}%</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-row gap-2 justify-between sm:justify-between">
            <Button variant="ghost" disabled={step === 1 || importing} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            <div className="flex gap-2">
              {step < 5 && (
                <Button
                  onClick={() => goToStep(step + 1)}
                  disabled={
                    (step === 1 && sheets.length === 0) ||
                    (step === 2 && sheetMode === 'per_sheet' && selectedSheets.length === 0) ||
                    (step === 3 && !fields.name)
                  }
                >
                  Next
                </Button>
              )}
              {step === 5 && (
                <Button onClick={handleImport} disabled={importing} className="gap-1.5">
                  <Check className="h-4 w-4" />
                  {importing ? 'Importing...' : 'Confirm & Import'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sample template dialog */}
      <Dialog open={sampleDialogOpen} onOpenChange={setSampleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Download Sample Template</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>How many subjects does your sheet have?</Label>
            <Input type="number" min={1} max={30} value={sampleSubjectCount}
              onChange={e => setSampleSubjectCount(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSampleDialogOpen(false)}>Cancel</Button>
            <Button onClick={downloadSample} className="gap-1.5"><Download className="h-4 w-4" />Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
