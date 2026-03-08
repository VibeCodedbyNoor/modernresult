import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { generateDemoResult } from '@/lib/demoResults';
import type { PortalProps, SearchParams } from '@/lib/portalTypes';

export function usePortalSearch({ isDemo = true, onSearch, demoResult }: Pick<PortalProps, 'isDemo' | 'onSearch' | 'demoResult'>) {
  const [selectedClass, setSelectedClass] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(demoResult || null);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  const setField = useCallback((field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent, searchFields: string[]) => {
    e.preventDefault();
    const hasValue = searchFields.some(f => formValues[f]?.trim());
    if (!selectedClass || !hasValue) {
      toast.error('Please fill in the required fields');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    if (isDemo) {
      setTimeout(() => {
        const name = formValues['student_name'] || formValues['roll_number'] || 'Student';
        setResult(generateDemoResult(name, selectedClass));
        setLoading(false);
        toast.success('Result loaded successfully!');
      }, 1000);
    } else if (onSearch) {
      try {
        const r = await onSearch({
          className: selectedClass,
          rollNumber: formValues['roll_number'] || '',
          studentName: formValues['student_name'] || '',
          fatherName: formValues['father_name'] || '',
        });
        if (r) {
          if (r.error === 'credits_exhausted') {
            setError('This school\'s result checking service is currently unavailable. Please contact the school administration.');
          } else {
            setResult(r);
            toast.success('Result loaded successfully!');
          }
        } else {
          setError('No result found');
        }
      } catch {
        setError('Search failed');
      } finally {
        setLoading(false);
      }
    }
  }, [selectedClass, formValues, isDemo, onSearch]);

  return {
    selectedClass,
    setSelectedClass,
    formValues,
    setField,
    loading,
    result,
    setResult,
    error,
    resultRef,
    handleSubmit,
  };
}
