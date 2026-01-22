import { Stethoscope } from 'lucide-react';
import { cn } from '@core/utils';

const Logo = ({ 
  variant = 'default', // 'default' | 'icon-only' | 'text-only' | 'image'
  size = 'default', // 'sm' | 'default' | 'lg' | 'xl'
  className,
  showIcon = true,
  showText = true,
  useImage = false, // Use SVG image instead of icon
}) => {
  const sizes = {
    sm: {
      icon: 'h-4 w-4',
      image: 'h-6 w-6',
      text: 'text-sm',
      gap: 'gap-1.5',
    },
    default: {
      icon: 'h-5 w-5',
      image: 'h-8 w-8',
      text: 'text-lg',
      gap: 'gap-2',
    },
    lg: {
      icon: 'h-6 w-6',
      image: 'h-10 w-10',
      text: 'text-xl',
      gap: 'gap-2.5',
    },
    xl: {
      icon: 'h-8 w-8',
      image: 'h-16 w-16',
      text: 'text-2xl',
      gap: 'gap-3',
    },
  };

  const sizeConfig = sizes[size] || sizes.default;

  if (variant === 'icon-only') {
    if (useImage) {
      return (
        <div className={cn('flex items-center', className)}>
          <img 
            src="/logo-full.svg" 
            alt="Project Docto" 
            className={cn(sizeConfig.image)}
            aria-hidden="true"
          />
          <span className="sr-only">Project Docto</span>
        </div>
      );
    }
    // Use Lucide icon as fallback
    return (
      <div className={cn('flex items-center', className)}>
        <Stethoscope 
          className={cn(sizeConfig.icon, 'text-primary')} 
          aria-hidden="true"
        />
        <span className="sr-only">Project Docto</span>
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div className={cn('flex items-center', className)}>
        <span className={cn(sizeConfig.text, 'font-bold text-foreground')}>
          Docto
        </span>
      </div>
    );
  }

  if (variant === 'image') {
    return (
      <div className={cn('flex items-center', sizeConfig.gap, className)}>
        <img 
          src="/logo-full.svg" 
          alt="Project Docto Logo" 
          className={cn(sizeConfig.image)}
        />
        {showText && (
          <span className={cn(sizeConfig.text, 'font-bold text-foreground')}>
            Docto
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', sizeConfig.gap, className)}>
      {showIcon && (
        <>
          {useImage ? (
            <img 
              src="/logo-full.svg" 
              alt="" 
              className={cn(sizeConfig.image)}
              aria-hidden="true"
            />
          ) : (
            <Stethoscope 
              className={cn(sizeConfig.icon, 'text-primary')} 
              aria-hidden="true"
            />
          )}
        </>
      )}
      {showText && (
        <span className={cn(sizeConfig.text, 'font-bold text-foreground')}>
          Docto
        </span>
      )}
    </div>
  );
};

export default Logo;
