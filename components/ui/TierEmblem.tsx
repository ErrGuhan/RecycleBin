import React from 'react';

export type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum';

interface TierEmblemProps {
  tier: TierKey | string;
  className?: string;
  size?: number;
}

/**
 * Tier Emblem Vector Shapes
 * Distinct geometry per tier so tiers are NEVER distinguished by hue alone (BUILD_PROMPT.md §8.2, §8.8):
 * - Bronze: Diamond (4-vertex geometric diamond)
 * - Silver: Curved Heraldic Shield
 * - Gold: 8-Point Radiance Star
 * - Platinum: 6-Vertex Faceted Hexagon
 */
export function TierEmblem({ tier, className = 'w-6 h-6', size = 24 }: TierEmblemProps) {
  const normalized = tier.toLowerCase();

  switch (normalized) {
    case 'bronze':
      // Diamond Emblem
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="Bronze Tier Diamond Emblem"
        >
          <path
            d="M12 2L21 12L12 22L3 12L12 2Z"
            fill="#A9673A"
            stroke="#8A5128"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 6L17 12L12 18L7 12L12 6Z"
            fill="#C98555"
            opacity="0.8"
          />
          <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 'silver':
      // Shield Emblem
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="Silver Tier Shield Emblem"
        >
          <path
            d="M12 2L4 5V11C4 16.5 7.5 20.8 12 22C16.5 20.8 20 16.5 20 11V5L12 2Z"
            fill="#8A94A6"
            stroke="#677387"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 5V19C15 18 17.5 14.8 17.5 11V6.5L12 5Z"
            fill="#A3ADC0"
            opacity="0.7"
          />
          <path
            d="M12 8L10 11H14L12 8Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'gold':
      // 8-Point Radiance Star Emblem
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="Gold Tier 8-Point Star Emblem"
        >
          <path
            d="M12 2L14.5 7.5L20 8.5L16 13L17.5 19L12 16L6.5 19L8 13L4 8.5L9.5 7.5L12 2Z"
            fill="#C79A3D"
            stroke="#9C7324"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" fill="#E8BD65" />
          <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 'platinum':
    default:
      // Faceted Hexagon Emblem
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-label="Platinum Tier Faceted Hexagon Emblem"
        >
          <path
            d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z"
            fill="#7C8CA8"
            stroke="#596883"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 6L17.5 9.5V14.5L12 18L6.5 14.5V9.5L12 6Z"
            fill="#9AABCB"
            opacity="0.8"
          />
          <path
            d="M12 2V6M20.5 7L17.5 9.5M20.5 17L17.5 14.5M12 22V18M3.5 17L6.5 14.5M3.5 7L6.5 9.5"
            stroke="#FFFFFF"
            strokeWidth="1"
            opacity="0.6"
          />
        </svg>
      );
  }
}
