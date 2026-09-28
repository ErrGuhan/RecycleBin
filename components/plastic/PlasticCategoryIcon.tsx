import React from 'react';

interface PlasticIconProps {
  typeKey: string;
  className?: string;
}

export function PlasticCategoryIcon({ typeKey, className = 'w-6 h-6' }: PlasticIconProps) {
  switch (typeKey) {
    case 'pet_small':
      // Small PET bottle icon (<= 750ml)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M10 2h4v3h-4z" />
          <path d="M10 5l-2 3v12a2 2 0 002 2h4a2 2 0 002-2V8l-2-3" />
          <line x1="8" y1="12" x2="16" y2="12" strokeDasharray="2 2" />
        </svg>
      );

    case 'pet_medium':
      // Medium bottle icon (1L - 1.5L)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M9.5 2h5v3h-5z" />
          <path d="M9.5 5L7 9v11a2 2 0 002 2h6a2 2 0 002-2V9l-2.5-4" />
          <line x1="7" y1="11" x2="17" y2="11" />
          <line x1="7" y1="15" x2="17" y2="15" />
        </svg>
      );

    case 'pet_large':
      // Large 2L bottle icon with sturdy handle
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M9 2h6v3H9z" />
          <path d="M9 5L6 9v11a2 2 0 002 2h8a2 2 0 002-2V9l-3-4" />
          <path d="M18 10h1.5a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H18" />
        </svg>
      );

    case 'plastic_cup':
      // Clean Plastic Cup & Tumbler with straw and rim
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M5 8h14l-1.8 12.2a2 2 0 01-2 1.8H8.8a2 2 0 01-2-1.8L5 8z" />
          <path d="M4 8h16" />
          <path d="M6 5h12v3H6z" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="9" y1="13" x2="15" y2="13" strokeDasharray="2 2" />
        </svg>
      );

    case 'food_container':
      // Meal Box / Food container tray with lid
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="9" width="18" height="11" rx="2" />
          <path d="M2 9h20" />
          <path d="M4 9l2-4h12l2 4" />
          <line x1="12" y1="13" x2="12" y2="17" />
          <line x1="7" y1="14" x2="9" y2="14" />
          <line x1="15" y1="14" x2="17" y2="14" />
        </svg>
      );

    case 'soft_film':
      // Clean Soft Pouch / Polybag / Film wrapper
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
          <path d="M4 6h16" />
          <path d="M4 18h16" />
          <path d="M10 10l4 4m0-4l-4 4" strokeDasharray="1 1" />
        </svg>
      );

    case 'cutlery_rigid':
      // Plastic Cutlery (Fork & Spoon) / Straws & Caps
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M18 2v8a2 2 0 01-2 2h-1a2 2 0 01-2-2V2" />
          <line x1="16" y1="2" x2="16" y2="7" />
          <line x1="15.5" y1="12" x2="15.5" y2="22" />
          <path d="M7 2v5a3 3 0 003 3v0a3 3 0 003-3V2" />
          <line x1="10" y1="10" x2="10" y2="22" />
        </svg>
      );

    case 'rigid_other':
    default:
      // Rigid container / jug icon
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M7 3h10v3H7z" />
          <path d="M5 6h14v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6z" />
          <path d="M9 10h6" />
          <path d="M9 14h6" />
        </svg>
      );
  }
}
