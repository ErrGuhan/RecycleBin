import React from 'react';

interface PlasticIconProps {
  typeKey: string;
  className?: string;
}

export function PlasticCategoryIcon({ typeKey, className = 'w-6 h-6' }: PlasticIconProps) {
  switch (typeKey) {
    case 'pet_small':
      // Small bottle icon
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
      // Medium bottle icon
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
      // Large 2L bottle icon with handle/ridge
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
