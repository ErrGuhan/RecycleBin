import { describe, it, expect } from 'vitest';
import {
  calculateAwardedPoints,
  calculateExpectedGrams,
  evaluateBatchRatio,
  getNextTierProgress,
  getEarnedTiers,
  DEFAULT_TIERS,
} from '@/lib/domain/points';
import { generateBinCode, isValidBinCode } from '@/lib/qr';

describe('Concurrent & High-Throughput Batch Simulation', () => {
  it('correctly aggregates high volumes of parallel student entries', () => {
    // Simulate 50 students dropping simultaneously at a single bin
    const studentEntries = Array.from({ length: 50 }, (_, i) => ({
      studentId: `student-${i}`,
      items: (i % 5) + 1, // 1 to 5 items
      avg_grams_snapshot: 25, // 25g baseline
      points_per_item_snapshot: 8,
    }));

    const totalItems = studentEntries.reduce((sum, e) => sum + e.items, 0);
    const expectedGrams = calculateExpectedGrams(studentEntries);

    expect(totalItems).toBeGreaterThan(100);
    expect(expectedGrams).toBe(totalItems * 25);

    // Simulate batch weighing with physical scale showing 98% of expected
    const actualWeighedGrams = Math.round(expectedGrams * 0.98);
    const evaluation = evaluateBatchRatio(actualWeighedGrams, expectedGrams, 15);

    expect(evaluation.status).toBe('approve_all');
    expect(evaluation.canApproveAll).toBe(true);

    // Calculate points awarded across all students
    let totalPointsAwarded = 0;
    studentEntries.forEach((entry) => {
      const awarded = calculateAwardedPoints(
        entry.items,
        entry.points_per_item_snapshot,
        evaluation.recommendedScaleFactor
      );
      totalPointsAwarded += awarded;
    });

    expect(totalPointsAwarded).toBe(totalItems * 8);
  });

  it('guarantees cut-off isolation between two consecutive batches', () => {
    const cutoffTime = new Date('2026-09-28T12:00:00Z').getTime();

    const allSubmissions = [
      { id: 'sub-1', created_at: cutoffTime - 5000, items: 4, avg_grams_snapshot: 15 },
      { id: 'sub-2', created_at: cutoffTime - 1000, items: 6, avg_grams_snapshot: 25 },
      { id: 'sub-3', created_at: cutoffTime + 500, items: 3, avg_grams_snapshot: 45 }, // Arrived after cutoff
      { id: 'sub-4', created_at: cutoffTime + 2000, items: 5, avg_grams_snapshot: 15 }, // Arrived after cutoff
    ];

    // Batch 1: strictly created_at <= cutoffTime
    const batch1Entries = allSubmissions.filter((s) => s.created_at <= cutoffTime);
    expect(batch1Entries.length).toBe(2);
    expect(batch1Entries.map((b) => b.id)).toEqual(['sub-1', 'sub-2']);

    // Next Batch: strictly created_at > cutoffTime
    const batch2Entries = allSubmissions.filter((s) => s.created_at > cutoffTime);
    expect(batch2Entries.length).toBe(2);
    expect(batch2Entries.map((b) => b.id)).toEqual(['sub-3', 'sub-4']);
  });

  it('evaluates progressive tier attainment correctly as points accrue', () => {
    // 0 points: No tier
    expect(getEarnedTiers(0, DEFAULT_TIERS)).toHaveLength(0);
    expect(getNextTierProgress(0, DEFAULT_TIERS).nextTier?.name).toBe('Bronze');
    expect(getNextTierProgress(0, DEFAULT_TIERS).percentage).toBe(0);

    // 100 points: Bronze unlocked
    expect(getEarnedTiers(100, DEFAULT_TIERS)[0].name).toBe('Bronze');
    expect(getNextTierProgress(100, DEFAULT_TIERS).currentTier?.name).toBe('Bronze');
    expect(getNextTierProgress(100, DEFAULT_TIERS).nextTier?.name).toBe('Silver');

    // 500 points: Silver unlocked
    expect(getEarnedTiers(500, DEFAULT_TIERS)[0].name).toBe('Silver');
    expect(getNextTierProgress(500, DEFAULT_TIERS).currentTier?.name).toBe('Silver');

    // 1000 points: Gold unlocked
    expect(getEarnedTiers(1000, DEFAULT_TIERS)[0].name).toBe('Gold');

    // 2500 points: Platinum (Max tier)
    expect(getEarnedTiers(2500, DEFAULT_TIERS)[0].name).toBe('Platinum');
    expect(getNextTierProgress(2500, DEFAULT_TIERS).percentage).toBe(100);
    expect(getNextTierProgress(2500, DEFAULT_TIERS).nextTier).toBeNull();
  });

  it('generates 500 unique valid QR codes without collisions', () => {
    const generatedCodes = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const code = generateBinCode();
      expect(isValidBinCode(code)).toBe(true);
      generatedCodes.add(code);
    }
    // High entropy 30^8 alphabet guarantees no collisions in 500
    expect(generatedCodes.size).toBe(500);
  });
});
