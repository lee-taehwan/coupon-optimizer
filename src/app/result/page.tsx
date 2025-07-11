import { Suspense } from 'react';
import ResultPageClient from './ResultPageClient';

function ResultPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mt-8 flex flex-col gap-8 border border-slate-200 dark:border-slate-700 transition-colors animate-pulse">
      <div className="flex justify-between items-center mb-2">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-8 w-24 bg-slate-600 rounded"></div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow-sm flex flex-col items-center">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-600 rounded"></div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 shadow-sm flex flex-col items-center">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-600 rounded"></div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 w-full">
          <div className="w-full max-w-xs mb-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
          </div>
          <div className="h-4 w-40 bg-slate-300 dark:bg-slate-600 rounded"></div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-10 w-32 bg-slate-600 rounded"></div>
        <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultPageSkeleton />}>
      <ResultPageClient />
    </Suspense>
  );
}