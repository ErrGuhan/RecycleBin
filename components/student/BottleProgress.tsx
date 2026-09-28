'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface BottleProgressProps {
  percentage: number;
  currentPoints: number;
  nextTierPoints: number;
  currentTierName?: string;
  nextTierName?: string;
}

export function BottleProgress({
  percentage,
  currentPoints,
  nextTierPoints,
  currentTierName = 'Active Contributor',
  nextTierName = 'Silver Tier',
}: BottleProgressProps) {
  // Clamp between 0 and 100
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  // SVG bottle coordinate height: 160 total, body fill height from y=50 to y=150 (height 100)
  const fillHeight = clampedPercent; // 0 to 100 px
  const fillY = 150 - fillHeight;

  return (
    <div className="bg-surface rounded-2xl border border-line p-5 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
      {/* Top Tag */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary-strong bg-brand-primary-soft px-3 py-1 rounded-full mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{currentTierName} • Progress to {nextTierName}</span>
      </div>

      {/* Memorable Graphic: Original Bottle Outline with Liquid Fill */}
      <div className="relative w-36 h-48 flex items-center justify-center my-2">
        <svg
          viewBox="0 0 100 170"
          className="w-full h-full drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Liquid Gradient */}
            <linearGradient id="aquaLiquid" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#00796B" />
              <stop offset="100%" stopColor="#00B3A1" />
            </linearGradient>

            {/* Clip path of the bottle interior */}
            <clipPath id="bottleInside">
              {/* Bottle internal silhouette */}
              <path
                d="M40 18 H60 V34 C60 40 76 46 76 56 V148 C76 156 68 160 60 160 H40 C32 160 24 156 24 148 V56 C24 46 40 40 40 34 Z"
              />
            </clipPath>
          </defs>

          {/* Liquid Layer (clipped to bottle interior) */}
          <g clipPath="url(#bottleInside)">
            <rect
              x="20"
              y={fillY}
              width="60"
              height="150"
              fill="url(#aquaLiquid)"
              className="transition-all duration-1000 ease-out"
            />
            {/* Subtle surface wave reflection */}
            <ellipse
              cx="50"
              cy={fillY}
              rx="24"
              ry="4"
              fill="#E0F5F2"
              opacity="0.4"
            />
          </g>

          {/* Bottle Exterior Outline & Cap */}
          {/* Cap */}
          <rect
            x="42"
            y="8"
            width="16"
            height="10"
            rx="2"
            fill="#00796B"
            stroke="#0E2A27"
            strokeWidth="2"
          />
          {/* Cap ridges */}
          <line x1="46" y1="10" x2="46" y2="16" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
          <line x1="50" y1="10" x2="50" y2="16" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
          <line x1="54" y1="10" x2="54" y2="16" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />

          {/* Bottle Body Outline */}
          <path
            d="M40 18 H60 V34 C60 40 76 46 76 56 V148 C76 156 68 160 60 160 H40 C32 160 24 156 24 148 V56 C24 46 40 40 40 34 Z"
            stroke="#0E2A27"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Subtle glass reflection highlight */}
          <path
            d="M30 65 V140"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>

        {/* Floating Percentage Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-line shadow-xs font-extrabold text-xs text-ink tabular-nums">
          {clampedPercent}%
        </div>
      </div>

      {/* Points Numerical Stats */}
      <div className="mt-2 space-y-1">
        <div className="text-2xl font-extrabold text-ink tabular-nums">
          {currentPoints} <span className="text-xs font-semibold text-ink-muted">/ {nextTierPoints} pts</span>
        </div>
        <p className="text-xs text-ink-muted">
          {nextTierPoints - currentPoints > 0
            ? `${nextTierPoints - currentPoints} points needed to unlock ${nextTierName}`
            : `Milestone Achieved! Ready to claim certificate.`}
        </p>
      </div>
    </div>
  );
}
