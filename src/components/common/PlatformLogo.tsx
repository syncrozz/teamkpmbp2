import React, { useState } from 'react';
import { BRANDING_CONFIG } from '../../config/branding';

interface PlatformLogoProps {
  className?: string;
  imgClassName?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SYNCROZZ PLATFORM LOGO ARCHITECTURE
 * - Renders official Team KPMBP logo with fallback to local public asset and typography.
 * - Respects aspect ratio and displays high-fidelity crest alongside platform identity.
 */
export const PlatformLogo: React.FC<PlatformLogoProps> = ({
  className = '',
  imgClassName = 'h-8 sm:h-9 w-auto object-contain shrink-0',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [src, setSrc] = useState(BRANDING_CONFIG.logoUrl || '/web-app-manifest-512x512.png');

  const handleImageError = () => {
    if (!fallbackAttempted && src !== '/web-app-manifest-512x512.png') {
      setFallbackAttempted(true);
      setSrc('/web-app-manifest-512x512.png');
    } else {
      setImgError(true);
    }
  };

  const textSize =
    size === 'lg'
      ? 'text-lg sm:text-xl'
      : size === 'sm'
        ? 'text-xs sm:text-sm'
        : 'text-sm sm:text-base';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {!imgError && (
        <img
          src={src}
          alt={BRANDING_CONFIG.platformName}
          className={imgClassName}
          onError={handleImageError}
        />
      )}
      <div className="flex flex-col min-w-0">
        <span className={`${textSize} font-bold tracking-tight text-slate-900 truncate leading-tight`}>
          {BRANDING_CONFIG.platformShortName}
        </span>
        <span className="text-[10px] text-slate-500 font-medium tracking-normal hidden sm:inline leading-none mt-0.5">
          Kontinjen SOAR IPMA 2026
        </span>
      </div>
    </div>
  );
};
