import React from 'react';
import { cn } from '../../lib/utils';

export function Tag({ children, className }) {
  return (
    <span className={cn('inline-flex items-center rounded bg-[#eff6ff] px-2 py-1 text-xs font-medium text-[#2563eb] border border-[#bfdbfe]', className)}>
      {children}
    </span>
  );
}
