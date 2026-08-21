import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, variant = 'primary', size = 'default', children, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-[#3b49df] text-white hover:bg-[#323ebd]', // StackIt blue
    secondary: 'bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0]', // Light grey
    outline: 'border border-[#cbd5e1] text-[#334155] hover:bg-[#f8fafc]',
    ghost: 'hover:bg-[#f1f5f9] text-[#475569] hover:text-[#0f172a]',
    success: 'bg-[#22c55e] text-white hover:bg-[#16a34a]', // accepted answer green
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 py-2 px-4',
    lg: 'h-12 px-8',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
