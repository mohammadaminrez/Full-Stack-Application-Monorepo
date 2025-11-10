import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Image URL for card header */
  image?: string;
  /** Footer content */
  footer?: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Make card clickable */
  clickable?: boolean;
  /** Content of the card */
  children?: React.ReactNode;
}

/**
 * Card Component
 * Flexible container for content with optional header, image, and footer
 * Supports multiple variants and clickable state
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      subtitle,
      image,
      footer,
      variant = 'default',
      clickable = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'rounded-lg overflow-hidden transition-all duration-200 bg-white dark:bg-gray-800';

    const variants = {
      default: 'border border-gray-200 dark:border-gray-700',
      outlined: 'border-2 border-gray-300 dark:border-gray-600',
      elevated:
        'shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700',
    };

    const clickableStyles = clickable
      ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
      : '';

    const Component = clickable || onClick ? 'button' : 'div';

    return (
      <Component
        ref={ref as any}
        className={cn(
          baseStyles,
          variants[variant],
          clickableStyles,
          clickable && 'text-left w-full',
          className
        )}
        onClick={onClick}
        role={clickable || onClick ? 'button' : undefined}
        tabIndex={clickable || onClick ? 0 : undefined}
        {...props}
      >
        {/* Image */}
        {image && (
          <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
            <img
              src={image}
              alt={title || 'Card image'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        {(title || subtitle) && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children && (
          <div className="p-4 text-gray-700 dark:text-gray-300">
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {footer}
          </div>
        )}
      </Component>
    );
  }
);

Card.displayName = 'Card';
