/**
 * Pure domain functions for Points, Weights, Scaling, and Tier Calculations
 */

export interface PlasticTypeConfig {
  key: string;
  label: string;
  points_per_item: number;
  avg_grams: number;
}

export const DEFAULT_PLASTIC_TYPES: PlasticTypeConfig[] = [
  { key: 'pet_small', label: 'PET bottle up to 750 ml', points_per_item: 5, avg_grams: 15 },
  { key: 'pet_medium', label: 'PET bottle 1 to 1.5 L', points_per_item: 8, avg_grams: 25 },
  { key: 'pet_large', label: 'PET bottle 2 L and above', points_per_item: 15, avg_grams: 45 },
  { key: 'plastic_cup', label: 'Clean Plastic Cups & Tumblers', points_per_item: 5, avg_grams: 12 },
  { key: 'food_container', label: 'Food Containers & Meal Trays', points_per_item: 10, avg_grams: 28 },
  { key: 'soft_film', label: 'Clean Pouches & Wrappers', points_per_item: 4, avg_grams: 8 },
  { key: 'cutlery_rigid', label: 'Cutlery, Straws & Caps', points_per_item: 3, avg_grams: 6 },
  { key: 'rigid_other', label: 'Other clean rigid plastic (HDPE/PP containers, jugs)', points_per_item: 10, avg_grams: 30 },
];

export interface TierConfig {
  key: string;
  name: string;
  min_points: number;
  sort: number;
}

export const DEFAULT_TIERS: TierConfig[] = [
  { key: 'bronze', name: 'Bronze', min_points: 100, sort: 1 },
  { key: 'silver', name: 'Silver', min_points: 500, sort: 2 },
  { key: 'gold', name: 'Gold', min_points: 1000, sort: 3 },
  { key: 'platinum', name: 'Platinum', min_points: 2500, sort: 4 },
];

export interface PointsRuleConfig {
  grams_per_point: number;
  max_items_per_entry: number;
  max_items_per_student_per_day: number;
  min_seconds_between_entries_per_bin: number;
  tolerance_pct: number;
  geofence_meters: number;
  undo_window_minutes: number;
}

export const DEFAULT_RULES: PointsRuleConfig = {
  grams_per_point: 3,
  max_items_per_entry: 20,
  max_items_per_student_per_day: 40,
  min_seconds_between_entries_per_bin: 30,
  tolerance_pct: 25,
  geofence_meters: 150,
  undo_window_minutes: 5,
};

/**
 * Calculate awarded points given items, snapshotted rate, and batch scale factor
 */
export function calculateAwardedPoints(
  items: number,
  pointsPerItem: number,
  scaleFactor: number = 1.0
): number {
  if (items <= 0 || pointsPerItem <= 0 || scaleFactor < 0) return 0;
  return Math.round(items * pointsPerItem * scaleFactor);
}

/**
 * Calculate expected batch weight in grams
 */
export function calculateExpectedGrams(
  entries: Array<{ items: number; avg_grams_snapshot: number }>
): number {
  return entries.reduce((acc, curr) => acc + curr.items * curr.avg_grams_snapshot, 0);
}

export type BatchEvaluation = {
  ratio: number;
  status: 'approve_all' | 'review_required' | 'critical_underweight' | 'possible_contamination';
  canApproveAll: boolean;
  requiresReview: boolean;
  recommendedScaleFactor: number;
  message: string;
};

/**
 * Evaluate batch ratio against tolerance and thresholds
 */
export function evaluateBatchRatio(
  netWeighedGrams: number,
  expectedGrams: number,
  tolerancePct: number = 25
): BatchEvaluation {
  if (expectedGrams <= 0) {
    return {
      ratio: 1.0,
      status: 'approve_all',
      canApproveAll: true,
      requiresReview: false,
      recommendedScaleFactor: 1.0,
      message: 'No pending items to evaluate.',
    };
  }

  const ratio = netWeighedGrams / expectedGrams;
  const toleranceDecimal = tolerancePct / 100;
  const lowerThreshold = 1.0 - toleranceDecimal; // default 0.75

  if (ratio < 0.5) {
    return {
      ratio,
      status: 'critical_underweight',
      canApproveAll: false,
      requiresReview: true,
      recommendedScaleFactor: Math.max(0, Math.min(1.0, ratio)),
      message: 'Batch is severely underweight (<50% expected). Approve all is disabled.',
    };
  }

  if (ratio < lowerThreshold) {
    return {
      ratio,
      status: 'review_required',
      canApproveAll: true,
      requiresReview: true,
      recommendedScaleFactor: Math.max(0, Math.min(1.0, ratio)),
      message: `Batch is ${Math.round((1 - ratio) * 100)}% under expected weight. Review or scaling recommended.`,
    };
  }

  if (ratio > 1.5) {
    return {
      ratio,
      status: 'possible_contamination',
      canApproveAll: true,
      requiresReview: false,
      recommendedScaleFactor: 1.0,
      message: 'Possible non-plastic or water contamination detected (>150% expected weight). No penalty applied.',
    };
  }

  return {
    ratio,
    status: 'approve_all',
    canApproveAll: true,
    requiresReview: false,
    recommendedScaleFactor: 1.0,
    message: 'Weighed weight matches expected weight within tolerance.',
  };
}

/**
 * Determine earned tier given lifetime points
 */
export function getEarnedTiers(
  lifetimePoints: number,
  tiers: TierConfig[] = DEFAULT_TIERS
): TierConfig[] {
  return tiers
    .filter((t) => lifetimePoints >= t.min_points)
    .sort((a, b) => b.min_points - a.min_points);
}

/**
 * Determine next tier and progress percentage
 */
export function getNextTierProgress(
  lifetimePoints: number,
  tiers: TierConfig[] = DEFAULT_TIERS
): {
  currentTier: TierConfig | null;
  nextTier: TierConfig | null;
  pointsNeeded: number;
  percentage: number;
} {
  const sorted = [...tiers].sort((a, b) => a.min_points - b.min_points);
  let currentTier: TierConfig | null = null;
  let nextTier: TierConfig | null = null;

  for (let i = 0; i < sorted.length; i++) {
    if (lifetimePoints >= sorted[i].min_points) {
      currentTier = sorted[i];
    } else {
      nextTier = sorted[i];
      break;
    }
  }

  if (!nextTier) {
    // Exceeded maximum tier
    return {
      currentTier,
      nextTier: null,
      pointsNeeded: 0,
      percentage: 100,
    };
  }

  const basePoints = currentTier ? currentTier.min_points : 0;
  const progressInLevel = lifetimePoints - basePoints;
  const levelSpan = nextTier.min_points - basePoints;
  const percentage = Math.min(100, Math.max(0, Math.round((progressInLevel / levelSpan) * 100)));

  return {
    currentTier,
    nextTier,
    pointsNeeded: Math.max(0, nextTier.min_points - lifetimePoints),
    percentage,
  };
}
