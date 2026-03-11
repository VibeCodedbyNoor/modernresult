import { Clock, StopCircle, AlertCircle } from 'lucide-react';
import CountdownDisplay from '@/components/CountdownDisplay';
import type { ExamState } from '@/lib/portalTypes';

interface ExamStatusBannerProps {
  examState?: ExamState;
  variant?: 'light' | 'dark';
}

export default function ExamStatusBanner({ examState, variant = 'dark' }: ExamStatusBannerProps) {
  if (!examState || examState.status === 'active') return null;

  if (examState.status === 'countdown' && examState.displayAt) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border text-center bg-slate-900/95 border-amber-500/40 shadow-2xl shadow-amber-500/20">
        <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg sm:text-xl font-bold text-amber-300 mb-2">
          Results will be available soon
        </h3>
        <div className="text-2xl sm:text-3xl">
          <CountdownDisplay targetDate={examState.displayAt} />
        </div>
        <p className="text-amber-200/60 text-xs sm:text-sm mt-3">
          Please check back when the countdown ends
        </p>
      </div>
    );
  }

  if (examState.status === 'stopped') {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border text-center bg-slate-900/95 border-red-500/40 shadow-2xl shadow-red-500/20">
        <StopCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg sm:text-xl font-bold text-red-300 mb-2">
          Result Checking Paused
        </h3>
        <p className="text-red-200/60 text-xs sm:text-sm">
          The school has temporarily paused result checking. Please try again later.
        </p>
      </div>
    );
  }

  if (examState.status === 'no_exam') {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border text-center bg-slate-900/95 border-slate-500/40 shadow-2xl">
        <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg sm:text-xl font-bold text-slate-300 mb-2">
          No Results Published
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm">
          No results have been published yet. Please check back later.
        </p>
      </div>
    );
  }

  return null;
}
