'use client';

import React from 'react';
import Link from 'next/link';
import {
  TOKENS,
  getContrastRatio,
  passesWcagAA,
} from '@/lib/domain/tokens';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function DevTokensPage() {
  const tokenList = Object.values(TOKENS);

  const keyPairs = [
    {
      fg: TOKENS.brandPrimaryStrong,
      bg: TOKENS.surface,
      label: 'Button/Link on White Surface',
      expected: 'PASS (>= 4.5:1)',
      role: 'Main interactive color for text and white-text buttons',
    },
    {
      fg: TOKENS.brandPrimary,
      bg: TOKENS.surface,
      label: 'Brand Primary (Aqua) on White Surface',
      expected: 'FAIL for text (< 4.5:1)',
      role: 'Graphics, fills, and accents ONLY. Prohibited for text.',
    },
    {
      fg: TOKENS.ink,
      bg: TOKENS.surface,
      label: 'Body Text (Ink) on White Surface',
      expected: 'PASS (>= 7.0:1 AAA)',
      role: 'Primary reading typography',
    },
    {
      fg: TOKENS.inkMuted,
      bg: TOKENS.surface,
      label: 'Muted Ink on White Surface',
      expected: 'PASS (>= 4.5:1 AA)',
      role: 'Secondary captions and metadata',
    },
    {
      fg: TOKENS.warn,
      bg: TOKENS.surface,
      label: 'Warning (Amber) on White',
      expected: 'PASS (>= 4.5:1 AA)',
      role: 'Pending status badges and warnings',
    },
    {
      fg: TOKENS.danger,
      bg: TOKENS.surface,
      label: 'Danger (Red) on White',
      expected: 'PASS (>= 4.5:1 AA)',
      role: 'Rejection errors and destructive actions',
    },
    {
      fg: TOKENS.info,
      bg: TOKENS.surface,
      label: 'Info (Blue) on White',
      expected: 'PASS (>= 4.5:1 AA)',
      role: 'Neutral notices and guidance chips',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-alt p-6 sm:p-10 font-sans text-ink">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-primary-soft text-brand-primary-strong uppercase tracking-wider">
                Phase 0 Milestone
              </span>
              <span className="text-xs text-ink-muted">Dev Only Inspector</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bisleri Aqua Green Design Tokens & Contrast Matrix
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              Automated WCAG 2.1 AA evaluation ensuring non-negotiable readability & accessibility.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-line text-sm font-semibold hover:bg-surface-alt min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Contrast Verification Matrix */}
        <div className="bg-surface rounded-xl border border-line p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-brand-primary-strong" />
            <h2 className="text-lg font-bold">Contrast Ratios & Accessibility Compliance</h2>
          </div>
          <p className="text-xs text-ink-muted mb-6">
            WCAG 2.1 Level AA requires a contrast ratio of at least <strong>4.5:1</strong> for normal text and <strong>3.0:1</strong> for graphics. Notice below how `--brand-primary-strong` is strictly verified for text, while `--brand-primary` is restricted to non-text fills.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-line text-xs font-semibold text-ink-muted uppercase">
                  <th className="py-3 px-4">Usage Pair</th>
                  <th className="py-3 px-4">Live Preview</th>
                  <th className="py-3 px-4">Ratio</th>
                  <th className="py-3 px-4">WCAG AA</th>
                  <th className="py-3 px-4">Design Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {keyPairs.map((pair, idx) => {
                  const ratio = getContrastRatio(pair.fg.hex, pair.bg.hex);
                  const isPass = passesWcagAA(pair.fg.hex, pair.bg.hex);
                  const isIntentionalGraphicOnly = pair.fg.role === 'accent-fill';

                  return (
                    <tr key={idx} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ink">{pair.label}</div>
                        <div className="text-xs text-ink-muted font-mono mt-0.5">
                          {pair.fg.variable} ({pair.fg.hex}) on {pair.bg.variable} ({pair.bg.hex})
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div
                          className="px-3 py-1.5 rounded-lg border border-line/60 font-semibold text-xs inline-block"
                          style={{
                            backgroundColor: pair.bg.hex,
                            color: pair.fg.hex,
                          }}
                        >
                          Sample Text 123
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {ratio.toFixed(2)}:1
                      </td>
                      <td className="py-3.5 px-4">
                        {isPass ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PASS AA
                          </span>
                        ) : isIntentionalGraphicOnly ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            GRAPHIC ONLY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            FAIL
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-ink-muted">
                        {pair.role}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Palette Swatches */}
        <div className="bg-surface rounded-xl border border-line p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Complete Palette Swatches</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tokenList.map((token) => (
              <div
                key={token.variable}
                className="border border-line rounded-lg p-3 flex flex-col justify-between space-y-2"
              >
                <div
                  className="h-16 rounded-md border border-line/40 shadow-inner flex items-center justify-center"
                  style={{ backgroundColor: token.hex }}
                >
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs"
                  >
                    {token.hex}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-ink truncate">{token.name}</div>
                  <div className="text-[11px] font-mono text-ink-muted truncate">
                    {token.variable}
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-brand-primary-strong mt-1">
                    {token.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Component Previews */}
        <div className="bg-surface rounded-xl border border-line p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold">Standard Component Samples</h2>

          {/* Status Badges */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Status Chips (Icon + Text)
            </h3>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="pending" />
              <StatusBadge status="verified" />
              <StatusBadge status="rejected" />
              <StatusBadge status="cancelled" />
            </div>
          </div>

          {/* Interactive Buttons */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Touch Target Buttons (&gt;= 44px)
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                type="button"
                className="min-h-[44px] px-6 rounded-lg bg-brand-primary-strong text-white font-semibold shadow-sm hover:opacity-95 transition-all focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
              >
                Primary Action (Save entry)
              </button>
              <button
                type="button"
                className="min-h-[44px] px-6 rounded-lg bg-surface border border-line text-ink font-semibold hover:bg-surface-alt transition-all"
              >
                Secondary Outline
              </button>
              <button
                type="button"
                className="min-h-[44px] px-6 rounded-lg bg-brand-primary-soft text-brand-primary-strong font-semibold hover:opacity-90 transition-all"
              >
                Soft Tint Action
              </button>
              <button
                type="button"
                className="min-h-[44px] px-6 rounded-lg bg-rose-600 text-white font-semibold hover:opacity-95 transition-all"
              >
                Destructive Action
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
