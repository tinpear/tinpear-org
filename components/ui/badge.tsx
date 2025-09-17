import * as React from 'react';

type Variant = 'default' | 'secondary' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const base =
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';

    // Use a non-nullable key type
    const variants: Record<Variant, string> = {
      default: 'bg-primary text-primary-foreground border-transparent',
      secondary: 'bg-muted text-foreground border-transparent',
      outline: 'text-foreground border border-input',
    };

    const combined = `${base} ${variants[variant]} ${className}`;

    return <div ref={ref} className={combined} {...props} />;
  }
);

Badge.displayName = 'Badge';
