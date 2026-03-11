import { Clock, StopCircle } from 'lucide-react';
import CountdownDisplay from '@/components/CountdownDisplay';
import type { ExamState } from '@/lib/portalTypes';

interface ExamStatusBannerProps {
  examState?: ExamState;
  variant?: 'light' | 'dark';
}

export default function ExamStatusBanner({ examState, variant = 'dark' }: ExamStatusBannerProps) {
  if (!examState || examState.status === 'active') return null;

  const isDark = variant === 'dark';

  if (examState.status === 'countdown' && examState.displayAt) {
    return (
      <div className={`w-full max-w-md mx-auto mb-6 p-4 rounded-xl border text-center ${
        isDark
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <span className={`font-semibold text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
            Results will be available soon
          </span>
        </div>
        <CountdownDisplay targetDate={examState.displayAt} />
      </div>
    );
  }

  if (examState.status === 'stopped') {
    return (
      <div className={`w-full max-w-md mx-auto mb-6 p-4 rounded-xl border text-center ${
        isDark
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <StopCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <span className={`font-semibold text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            Result checking is currently paused
          </span>
        </div>
      </div>
    );
  }

  if (examState.status === 'no_exam') {
    return (
      <div className={`w-full max-w-md mx-auto mb-6 p-4 rounded-xl border text-center ${
        isDark
          ? 'bg-slate-500/10 border-slate-500/30'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <span className={`font-semibold text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          No results have been published yet
        </span>
      </div>
    );
  }

  return null;
}
