import React from 'react';
import { cn } from '../../lib/utils';

export function Avatar({ src, alt, className, fallback }) {
  return (
    <div className={cn('relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#e2e8f0]', className)}>
      {src ? (
        <img className="aspect-square h-full w-full object-cover" src={src} alt={alt} />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium text-[#475569]">
          {fallback || alt?.charAt(0) || 'U'}
        </span>
      )}
    </div>
  );
}
