import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Simplified Button Component - Bug-free version
 * Provides consistent styling without complex dependencies
 */

// Export buttonVariants as a function for compatibility with other components
export const buttonVariants = ({ variant = "default", size = "default" } = {}) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50";
  
  const variantStyles = {
    default: "bg-[var(--cta-primary)] text-[var(--cta-primary-foreground)] shadow-sm hover:bg-[var(--cta-primary)]/90",
    destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)] shadow-sm hover:bg-[var(--destructive)]/90",
    outline: "border border-[var(--border)] bg-[var(--background)] shadow-sm hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
    secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-sm hover:bg-[var(--secondary)]/80",
    ghost: "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
    link: "text-[var(--primary)] underline-offset-4 hover:underline"
  };
  
  const sizeStyles = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-8 rounded-lg px-3 text-xs",
    lg: "h-10 rounded-lg px-8 text-base",
    icon: "h-9 w-9"
  };
  
  const variantClass = variantStyles[variant] || variantStyles.default;
  const sizeClass = sizeStyles[size] || sizeStyles.default;
  
  return cn(baseStyles, variantClass, sizeClass);
};

const Button = React.forwardRef(({ 
  className, 
  variant = "default",
  size = "default",
  children,
  disabled,
  type = "button",
  ...props 
}, ref) => {
  
  // Error logging for debugging
  React.useEffect(() => {
    if (!children) {
      console.warn('Button rendered without children:', { variant, size, className });
    }
  }, [children, variant, size, className]);
  
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
export default Button;