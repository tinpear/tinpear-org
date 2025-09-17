import * as React from 'react';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({
  className = '',
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  const base = 'shrink-0 bg-border';
  const orientationStyles =
    orientation === 'horizontal' ? 'h-px w-full my-6' : 'h-full w-px mx-6';

  const combined = `${base} ${orientationStyles} ${className}`;

  return <div role="separator" className={combined} {...props} />;
}
