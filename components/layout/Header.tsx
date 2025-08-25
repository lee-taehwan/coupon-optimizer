export const Header = () => {
  return (
    <header className="w-full py-6 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-sm backdrop-blur border-b border-slate-200 dark:border-slate-700 transition-colors">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-gray-50">쿠폰 최적 적용 계산기</h1>
      <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">쿠폰/상품 입력 → 최적 할인 조합 계산</p>
    </header>
  );
} 