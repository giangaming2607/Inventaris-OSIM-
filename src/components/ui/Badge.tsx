import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    success: "bg-green-900/30 text-green-500",
    warning: "bg-amber-900/30 text-amber-500",
    danger: "bg-red-900/30 text-red-500",
    info: "bg-blue-900/30 text-blue-800",
    default: "bg-neutral-800 text-white"
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
