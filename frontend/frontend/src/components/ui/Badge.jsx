import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ variant = 'bronze', count, className }) {
  const variants = {
    gold: 'bg-[#fef9c3] text-[#a16207] border-[#fde047]',
    silver: 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]',
    bronze: 'bg-[#ffedd5] text-[#c2410c] border-[#fdba74]',
  };

  const dotColors = {
    gold: 'bg-[#eab308]',
    silver: 'bg-[#94a3b8]',
    bronze: 'bg-[#f97316]',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold border', variants[variant], className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />
      {count}
    </span>
  );
}
