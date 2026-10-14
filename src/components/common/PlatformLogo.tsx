import React from 'react';
import { BRANDING_CONFIG } from '../../config/branding';

interface PlatformLogoProps {
  className?: string;
  imgClassName?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SYNCROZZ PLATFORM LOGO ARCHITECTURE
 * - If official logoUrl is set in BRANDING_CONFIG, displays official logo.
 * - If logoUrl is null (pending), renders a clean, neutral typography mark.
 * - When official logo is provided later, plug into BRANDING_CONFIG.logoUrl with ZERO rebuild.
 */
export const PlatformLogo: React.FC<PlatformLogoProps> = ({
  className = '',
  imgClassName = 'h-8 w-auto object-contain',
  showBadge = true,
  size = 'md',
}) => {
  // If official logo is provided, render the official asset
  if (BRANDING_CONFIG.logoUrl) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={BRANDING_CONFIG.logoUrl}
          alt={BRANDING_CONFIG.platformName}
          className={imgClassName}
        />
        {showBadge && (
          <span className="hidden sm:inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            SOAR 2026
          </span>
        )}
      </div>
    );
  }

  // Safe, clean neutral typography fallback (Non-fabricated)
  const textSize =
    size === 'lg'
      ? 'text-lg sm:text-xl'
      : size === 'sm'
        ? 'text-sm'
        : 'text-base sm:text-lg';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`${textSize} font-bold tracking-tight text-slate-900 whitespace-nowrap`}>
        {BRANDING_CONFIG.platformShortName}
      </span>
      {showBadge && (
        <span className="hidden sm:inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          SOAR 2026
        </span>
      )}
    </div>
  );
};
