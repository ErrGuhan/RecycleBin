import { describe, it, expect } from 'vitest';
import {
  calculateAwardedPoints,
  calculateExpectedGrams,
  evaluateBatchRatio,
  getNextTierProgress,
  getEarnedTiers,
  DEFAULT_TIERS,
} from '@/lib/domain/points';

describe('Points & Verification Batch Domain Logic', () => {
  it('calculates points correctly with default scale factor 1.0', () => {
    // 12 PET small bottles (5 pts each) = 60 pts
    expect(calculateAwardedPoints(12, 5, 1.0)).toBe(60);
    // 3 PET large bottles (15 pts each) = 45 pts
    expect(calculateAwardedPoints(3, 15, 1.0)).toBe(45);
  });

  it('calculates points correctly when scaled down', () => {
    // 10 items * 5 pts = 50 pts; scale factor 0.8 => 40 pts
    expect(calculateAwardedPoints(10, 5, 0.8)).toBe(40);
    // 7 items * 5 pts = 35 pts; scale factor 0.73 => 26 pts (rounded)
    expect(calculateAwardedPoints(7, 5, 0.73)).toBe(26);
  });

  it('calculates expected grams from entries snapshots', () => {
    const entries = [
      { items: 10, avg_grams_snapshot: 15 }, // 150g
      { items: 4, avg_grams_snapshot: 25 },  // 100g
      { items: 2, avg_grams_snapshot: 45 },  // 90g
    ];
    expect(calculateExpectedGrams(entries)).toBe(340);
  });

  it('evaluates batch within tolerance (>= 75%) as approve_all', () => {
    const expected = 1000;
    const weighed = 820; // 82%
    const evaluation = evaluateBatchRatio(weighed, expected, 25);
    expect(evaluation.status).toBe('approve_all');
    expect(evaluation.canApproveAll).toBe(true);
    expect(evaluation.requiresReview).toBe(false);
    expect(evaluation.recommendedScaleFactor).toBe(1.0);
  });

  it('flags batch between 50% and 75% as review_required', () => {
    const expected = 1000;
    const weighed = 650; // 65%
    const evaluation = evaluateBatchRatio(weighed, expected, 25);
    expect(evaluation.status).toBe('review_required');
    expect(evaluation.canApproveAll).toBe(true);
    expect(evaluation.requiresReview).toBe(true);
    expect(evaluation.recommendedScaleFactor).toBeCloseTo(0.65, 2);
  });

  it('disables approve_all on critical underweight (< 50%)', () => {
    const expected = 1000;
    const weighed = 400; // 40%
    const evaluation = evaluateBatchRatio(weighed, expected, 25);
    expect(evaluation.status).toBe('critical_underweight');
    expect(evaluation.canApproveAll).toBe(false);
    expect(evaluation.requiresReview).toBe(true);
    expect(evaluation.recommendedScaleFactor).toBeCloseTo(0.40, 2);
  });

  it('notes possible contamination when weight exceeds 150%', () => {
    const expected = 1000;
    const weighed = 1600; // 160%
    const evaluation = evaluateBatchRatio(weighed, expected, 25);
    expect(evaluation.status).toBe('possible_contamination');
    expect(evaluation.canApproveAll).toBe(true);
    expect(evaluation.recommendedScaleFactor).toBe(1.0);
  });

  it('evaluates tier progress toward next milestone', () => {
    // 0 points: next tier is Bronze (100)
    const p0 = getNextTierProgress(0, DEFAULT_TIERS);
    expect(p0.currentTier).toBeNull();
    expect(p0.nextTier?.name).toBe('Bronze');
    expect(p0.pointsNeeded).toBe(100);
    expect(p0.percentage).toBe(0);

    // 50 points: 50% to Bronze
    const p50 = getNextTierProgress(50, DEFAULT_TIERS);
    expect(p50.percentage).toBe(50);
    expect(p50.pointsNeeded).toBe(50);

    // 100 points: achieved Bronze, next is Silver (500)
    const p100 = getNextTierProgress(100, DEFAULT_TIERS);
    expect(p100.currentTier?.name).toBe('Bronze');
    expect(p100.nextTier?.name).toBe('Silver');
    expect(p100.pointsNeeded).toBe(400);

    // 3000 points: exceeded Platinum
    const p3000 = getNextTierProgress(3000, DEFAULT_TIERS);
    expect(p3000.currentTier?.name).toBe('Platinum');
    expect(p3000.nextTier).toBeNull();
    expect(p3000.percentage).toBe(100);
  });

  it('determines all earned tiers for a given score', () => {
    expect(getEarnedTiers(45).length).toBe(0);
    expect(getEarnedTiers(150).map((t) => t.name)).toEqual(['Bronze']);
    expect(getEarnedTiers(600).map((t) => t.name)).toEqual(['Silver', 'Bronze']);
    expect(getEarnedTiers(3000).map((t) => t.name)).toEqual(['Platinum', 'Gold', 'Silver', 'Bronze']);
  });
});
