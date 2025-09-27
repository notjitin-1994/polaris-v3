import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 
          'glass px-6 py-2.5 text-white bg-secondary hover:bg-secondary-dark focus-visible:ring-secondary/50',
        secondary:
          'glass px-6 py-2.5 text-foreground hover:glass-strong focus-visible:ring-primary/50',
        ghost: 
          'px-6 py-2.5 text-foreground hover:glass focus-visible:ring-primary/50',
        // Keep destructive for compatibility
        destructive: 
          'glass px-6 py-2.5 bg-error text-white hover:bg-error/90 focus-visible:ring-error/50',
        // Legacy variants for backward compatibility - will be removed in subtask 4.5
        default: 
          'glass px-6 py-2.5 text-white bg-secondary hover:bg-secondary-dark focus-visible:ring-secondary/50',
        outline:
          'glass px-6 py-2.5 border border-foreground/20 text-foreground hover:glass-strong focus-visible:ring-primary/50',
        link: 
          'text-foreground underline-offset-4 hover:underline px-2',
      },
      size: {
        sm: 'text-xs px-4 py-2',
        md: 'text-sm px-6 py-2.5',
        lg: 'text-base px-8 py-3',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);

Button.displayName = 'Button';

export { buttonVariants };
