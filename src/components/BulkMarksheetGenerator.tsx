import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Coins } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import MarksheetCard from './MarksheetCard';

interface Result {
  id: string;
  student_name: string;
  roll_number: string;
  subjects: any;
  total_marks: number;
  grade: string;
  class_name: string;
}

interface SchoolData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  accent_color: string;
  result_template: string;
}

interface BulkMarksheetGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: Result[];
  school: SchoolData;
  examName: string;
  classNames: string[];
  creditBalance: number | null;
  onCreditsUpdated: () => void;
}

const PAPER_SIZES = [
  { label: 'A4', width: 595.28, height: 841.89, cardWidth: 980 },
  { label: 'Letter', width: 612, height: 792, cardWidth: 1000 },
  { label: 'Legal', width: 612, height: 1008, cardWidth: 1000 },
  { label: 'A3', width: 841.89, height: 1190.55, cardWidth: 1400 },
];

function calculateCost(count: number): number {
  if (count <= 0) return 0;
  return count > 400 ? Math.ceil(count * 0.8) : count;
}

export default function BulkMarksheetGenerator({
  open,
  onOpenChange,
  results,
  school,
  examName,
  classNames,
  creditBalance,
  onCreditsUpdated,
}: BulkMarksheetGeneratorProps) {
  const [paperSize, setPaperSize] = useState('A4');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const renderRef = useRef<HTMLDivElement>(null);

  const filteredResults = classFilter === 'all' ? results : results.filter((r) => r.class_name === classFilter);

  // Auto-select all when filter changes
  useEffect(() => {
    setSelectedIds(new Set(filteredResults.map((r) => r.id)));
  }, [classFilter, results]);

  const selectedResults = filteredResults.filter((r) => selectedIds.has(r.id));
  const cost = calculateCost(selectedResults.length);
  const hasEnoughCredits = creditBalance !== null && creditBalance >= cost;

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResults.map((r) => r.id)));
    }
  };

  const handleGenerate = useCallback(async () => {
    if (selectedResults.length === 0) return;

    setGenerating(true);
    setProgress(0);
    setProgressTotal(selectedResults.length);

    try {
      // Deduct credits first
      const { data: deducted, error } = await supabase.rpc('deduct_credits_bulk', {
        p_school_id: school.id,
        p_count: selectedResults.length,
      });

      if (error || !deducted || deducted === 0) {
        toast.error('Insufficient credits or deduction failed');
        setGenerating(false);
        return;
      }

      const paper = PAPER_SIZES.find((p) => p.label === paperSize) || PAPER_SIZES[0];
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [paper.width, paper.height],
      });

      for (let i = 0; i < selectedResults.length; i++) {
        const student = selectedResults[i];
        setProgress(i + 1);

        // Wait for render
        await new Promise((resolve) => setTimeout(resolve, 50));

        const container = document.getElementById(`bulk-card-${student.id}`);
        if (!container) continue;

        const canvas = await html2canvas(container, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          windowWidth: container.scrollWidth,
          windowHeight: container.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = paper.width - 40;
        const imgHeight = (canvas.height / canvas.width) * imgWidth;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, Math.min(imgHeight, paper.height - 40));
      }

      pdf.save(`${school.name}-marksheets-${examName}.pdf`);
      toast.success(`PDF generated for ${selectedResults.length} students (${deducted} credits used)`);
      onCreditsUpdated();
      onOpenChange(false);
    } catch (err: any) {
      toast.error('PDF generation failed: ' + err.message);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  }, [selectedResults, paperSize, school, examName, onCreditsUpdated, onOpenChange]);

  const paper = PAPER_SIZES.find((p) => p.label === paperSize) || PAPER_SIZES[0];

  return (
    <>
      <Dialog open={open} onOpenChange={generating ? undefined : onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Download className="h-5 w-5" /> Download Marksheets (PDF)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Paper Size & Class Filter */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Paper Size</label>
                <Select value={paperSize} onValueChange={setPaperSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_SIZES.map((p) => (
                      <SelectItem key={p.label} value={p.label}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Class</label>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classNames.map((cn) => (
                      <SelectItem key={cn} value={cn}>
                        {cn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Select All / Deselect All */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedIds.size === filteredResults.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedResults.length} of {filteredResults.length} selected
              </span>
            </div>

            {/* Student List */}
            <ScrollArea className="h-64 border rounded-md">
              <div className="p-2 space-y-1">
                {filteredResults.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedIds.has(r.id)}
                      onCheckedChange={() => toggleStudent(r.id)}
                    />
                    <span className="font-mono text-xs text-muted-foreground w-16">{r.roll_number}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{r.student_name}</span>
                    <span className="text-xs text-muted-foreground">{r.class_name}</span>
                  </label>
                ))}
                {filteredResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No students found</p>
                )}
              </div>
            </ScrollArea>

            {/* Cost Summary */}
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" /> Cost
                </span>
                <span className="text-lg font-bold text-foreground">
                  {cost} credits
                  {selectedResults.length > 400 && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">(0.8/student bulk rate)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your balance</span>
                <span className={`font-semibold ${hasEnoughCredits ? 'text-green-600' : 'text-destructive'}`}>
                  {creditBalance ?? '—'} credits
                </span>
              </div>
              {!hasEnoughCredits && selectedResults.length > 0 && (
                <p className="text-xs text-destructive">Insufficient credits. Please top up first.</p>
              )}
            </div>

            {/* Progress */}
            {generating && (
              <div className="space-y-2">
                <Progress value={(progress / progressTotal) * 100} />
                <p className="text-sm text-muted-foreground text-center">
                  Generating {progress}/{progressTotal}...
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating || selectedResults.length === 0 || !hasEnoughCredits}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {generating ? 'Generating...' : `Generate PDF (${cost} credits)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Off-screen render area for marksheet cards */}
      {open && (
        <div className="fixed left-0 top-0 -translate-x-[200vw] pointer-events-none" ref={renderRef}>
          {selectedResults.map((student) => (
            <div key={student.id} id={`bulk-card-${student.id}`}>
              <MarksheetCard
                school={school}
                examName={examName}
                student={student}
                cardWidth={paper.cardWidth}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
