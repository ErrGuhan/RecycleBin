import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'dark' | 'white' | 'compact';
  href?: string;
  showSubtitle?: boolean;
}

export function BrandLogo({
  variant = 'dark',
  href = '/',
  showSubtitle = true,
}: BrandLogoProps) {
  const content = (
    <div className="flex items-center gap-2.5 select-none">
      {/* Visual Accent Anchor */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm tracking-tighter ${
          variant === 'white'
            ? 'bg-white text-brand-primary-strong shadow-sm'
            : 'bg-brand-primary-strong text-white shadow-sm'
        }`}
      >
        CPC
      </div>
      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-extrabold text-base tracking-tight ${
              variant === 'white' ? 'text-white' : 'text-ink'
            }`}
          >
            Campus Plastic Credits
          </span>
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={`text-[10px] uppercase font-semibold tracking-wider ${
                variant === 'white' ? 'text-white/80' : 'text-brand-primary-strong'
              }`}
            >
              Bisleri Partner Initiative
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-2 focus-visible:outline-brand-primary-strong rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
