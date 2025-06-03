import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  href?: string;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  href,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const router = useRouter();

  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (href) {
      e.preventDefault();
      router.push(href);
    }
    props.onClick?.(e);
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

export function CancelButton({ href = '..', children = 'Cancel', ...props }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button
      variant="secondary"
      href={href}
      {...props}
    >
      {children}
    </Button>
  );
}

export function SubmitButton({ isLoading, children, ...props }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button
      variant="primary"
      isLoading={isLoading}
      type="submit"
      {...props}
    >
      {children}
    </Button>
  );
} 