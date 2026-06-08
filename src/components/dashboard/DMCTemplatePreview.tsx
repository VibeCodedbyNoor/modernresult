import type { DMCTemplateId } from '@/lib/generateDMC';

interface Props {
  templateId: DMCTemplateId;
}

/** Lightweight CSS mockup previews for each DMC template (no iframes). */
export default function DMCTemplatePreview({ templateId }: Props) {
  switch (templateId) {
    case 'classic':
      return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
          <div className="border-2 border-neutral-800 p-1.5 flex-1 flex flex-col gap-1">
            <div className="border border-neutral-400 p-1 flex-1 flex flex-col gap-1">
              <div className="text-center">
                <div className="h-1.5 w-12 mx-auto bg-neutral-800 rounded-sm" />
                <div className="h-0.5 w-8 mx-auto bg-neutral-400 mt-0.5" />
              </div>
              <div className="h-px bg-neutral-800" />
              <div className="h-px bg-neutral-800 mt-0.5" />
              <div className="grid grid-cols-2 gap-1 mt-1">
                {[...Array(4)].map((_, i) => <div key={i} className="h-1 bg-neutral-300" />)}
              </div>
              <div className="mt-auto space-y-0.5">
                {[...Array(3)].map((_, i) => <div key={i} className="h-1 bg-neutral-200" />)}
              </div>
            </div>
          </div>
        </div>
      );
    case 'modern':
      return (
        <div className="w-full h-full bg-white flex flex-col">
          <div className="h-1 bg-blue-500" />
          <div className="p-2 flex-1 flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-neutral-300" />
              <div className="flex-1">
                <div className="h-1.5 bg-neutral-800 rounded-sm w-3/4" />
                <div className="h-0.5 bg-neutral-300 w-1/2 mt-0.5" />
              </div>
            </div>
            <div className="h-0.5 w-6 bg-blue-500" />
            <div className="grid grid-cols-2 gap-1 mt-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="h-0.5 bg-neutral-300 w-1/2" />
                  <div className="h-1 bg-neutral-700 w-3/4" />
                </div>
              ))}
            </div>
            <div className="mt-auto grid grid-cols-4 gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-3 rounded-sm ${i === 3 ? 'bg-green-200' : 'bg-neutral-100'}`} />
              ))}
            </div>
          </div>
        </div>
      );
    case 'elegant':
      return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
          <div className="relative flex-1 flex flex-col gap-1">
            {/* Corner ornaments */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-600" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-600" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-600" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-600" />

            <div className="text-center mt-2">
              <div className="h-2 w-2 rounded-full bg-neutral-300 mx-auto" />
              <div className="h-1.5 w-14 mx-auto bg-neutral-800 rounded-sm mt-0.5" />
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                <div className="h-px w-3 bg-amber-600" />
                <div className="h-1 w-1 rounded-full bg-amber-600" />
                <div className="h-px w-3 bg-amber-600" />
              </div>
              <div className="h-1 w-10 mx-auto bg-amber-600/60 italic mt-0.5" />
            </div>
            <div className="mt-auto space-y-0.5 px-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-0.5 bg-neutral-200" />)}
            </div>
          </div>
        </div>
      );
    case 'compact':
      return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col gap-1">
          <div className="border border-neutral-300 p-1 flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-1 pb-1 border-b border-neutral-200">
              <div className="h-2.5 w-2.5 bg-neutral-300 rounded-sm" />
              <div className="flex-1">
                <div className="h-1 bg-neutral-800 w-2/3 rounded-sm" />
                <div className="h-0.5 bg-neutral-300 w-1/2 mt-0.5" />
              </div>
            </div>
            <div className="flex gap-1 flex-1">
              <div className="w-1/3 space-y-0.5">
                {[...Array(4)].map((_, i) => <div key={i} className="h-1 bg-neutral-200" />)}
              </div>
              <div className="flex-1 space-y-0.5">
                {[...Array(5)].map((_, i) => <div key={i} className="h-0.5 bg-neutral-300" />)}
              </div>
            </div>
            <div className="h-2 bg-neutral-100 rounded-sm" />
            <div className="h-2 w-8 mx-auto bg-green-500 rounded-sm" />
          </div>
        </div>
      );
    case 'premium':
      return (
        <div className="w-full h-full bg-white flex flex-col">
          <div className="h-6 bg-purple-700 p-1 flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-white/30" />
            <div className="flex-1">
              <div className="h-1 bg-white w-3/4 rounded-sm" />
              <div className="h-0.5 bg-white/50 w-1/2 mt-0.5" />
            </div>
          </div>
          <div className="p-1.5 flex-1 flex flex-col gap-1">
            <div className="bg-neutral-100 rounded-sm p-1 space-y-0.5">
              {[...Array(3)].map((_, i) => <div key={i} className="h-0.5 bg-neutral-300" />)}
            </div>
            <div className="space-y-0.5 mt-1">
              {[...Array(3)].map((_, i) => <div key={i} className="h-0.5 bg-purple-200" />)}
            </div>
            <div className="flex items-end gap-1 mt-auto">
              <div className="flex-1 space-y-0.5">
                <div className="h-0.5 bg-neutral-300 w-3/4" />
                <div className="h-0.5 bg-neutral-300 w-1/2" />
              </div>
              <div className="h-5 w-5 rounded-full bg-purple-700 flex items-center justify-center">
                <div className="h-1 w-1 bg-white rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      );
  }
}
