import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  // Aceita todas as props de uma div, como className, style, etc.
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-700 animate-pulse rounded-md ${className}`}
      {...props}
    />
  );
}
