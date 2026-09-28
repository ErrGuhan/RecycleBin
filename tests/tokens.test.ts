import { describe, it, expect } from 'vitest';
import {
  TOKENS,
  getContrastRatio,
  passesWcagAA,
  relativeLuminance,
} from '@/lib/domain/tokens';

describe('Design Tokens & WCAG Contrast Verification', () => {
  it('relative luminance of pure white is 1.0 and black is 0.0', () => {
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1.0, 2);
    expect(relativeLuminance(0, 0, 0)).toBeCloseTo(0.0, 2);
  });

  it('proves that --brand-primary (#00B3A1) MUST NOT be used for normal text on white (contrast < 4.5)', () => {
    const ratio = getContrastRatio(TOKENS.brandPrimary.hex, TOKENS.surface.hex);
    // Contrast is around 2.6:1
    expect(ratio).toBeLessThan(4.5);
    expect(ratio).toBeGreaterThan(2.0);
    expect(passesWcagAA(TOKENS.brandPrimary.hex, TOKENS.surface.hex)).toBe(false);
  });

  it('proves that --brand-primary-strong (#00796B) PASSES WCAG AA on white (contrast >= 4.5:1)', () => {
    const ratio = getContrastRatio(TOKENS.brandPrimaryStrong.hex, TOKENS.surface.hex);
    // Ratio should be approx 5.3:1
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(passesWcagAA(TOKENS.brandPrimaryStrong.hex, TOKENS.surface.hex)).toBe(true);
  });

  it('proves that --ink (#0E2A27) exceeds AAA contrast on white surface (> 7:1)', () => {
    const ratio = getContrastRatio(TOKENS.ink.hex, TOKENS.surface.hex);
    expect(ratio).toBeGreaterThan(10.0);
  });

  it('proves that --ink-muted (#4B635F) passes WCAG AA on white surface (>= 4.5:1)', () => {
    const ratio = getContrastRatio(TOKENS.inkMuted.hex, TOKENS.surface.hex);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('proves status colors (warn, danger, info) have accessible contrast against white surfaces', () => {
    expect(getContrastRatio(TOKENS.warn.hex, TOKENS.surface.hex)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(TOKENS.danger.hex, TOKENS.surface.hex)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(TOKENS.info.hex, TOKENS.surface.hex)).toBeGreaterThanOrEqual(4.5);
  });
});
