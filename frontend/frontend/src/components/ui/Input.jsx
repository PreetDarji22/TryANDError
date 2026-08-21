import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-sm placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#3b49df]/20 focus:border-[#3b49df] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';
