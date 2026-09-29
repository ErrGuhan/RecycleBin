import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Recycle } from 'lucide-react';
import { DEFAULT_TIERS, DEFAULT_PLASTIC_TYPES } from '@/lib/domain/points';
import { TierEmblem } from '@/components/ui/TierEmblem';
import { PlasticCategoryIcon } from '@/components/plastic/PlasticCategoryIcon';

export default function RewardsPage() {
  const tierColorMap: Record<string, { bgBadge: string; textBadge: string; border: string }> = {
    bronze: { bgBadge: 'bg-[#A9673A]/10', textBadge: 'text-[#A9673A]', border: 'border-[#A9673A]/30' },
    silver: { bgBadge: 'bg-[#8A94A6]/15', textBadge: 'text-[#586478]', border: 'border-[#8A94A6]/30' },
    gold: { bgBadge: 'bg-[#C79A3D]/10', textBadge: 'text-[#966F1C]', border: 'border-[#C79A3D]/30' },
    platinum: { bgBadge: 'bg-[#7C8CA8]/15', textBadge: 'text-[#4F5E7B]', border: 'border-[#7C8CA8]/30' },
  };

  const typeColorMap: Record<string, { bg: string; text: string }> = {
    pet_small: { bg: 'bg-[#00796B]/10', text: 'text-[#00796B]' },
    pet_medium: { bg: 'bg-[#2D6FA6]/10', text: 'text-[#2D6FA6]' },
    pet_large: { bg: 'bg-[#A65A2E]/10', text: 'text-[#A65A2E]' },
    rigid_other: { bg: 'bg-[#6B4C8A]/10', text: 'text-[#6B4C8A]' },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary-strong hover:underline mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          Rewards, Points & Milestone Tiers
        </h1>
        <p className="mt-3 text-base text-ink-muted max-w-2xl leading-relaxed">
          Points represent student sustainability contributions and unlock verified college certificates for resumes and portfolios.
        </p>
      </div>

      {/* Tier Cards with Distinct Emblems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEFAULT_TIERS.map((tier) => {
          const colors = tierColorMap[tier.key] || tierColorMap.bronze;
          return (
            <div
              key={tier.key}
              className={`bg-surface rounded-xl border p-6 shadow-xs flex flex-col justify-between ${colors.border}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${colors.bgBadge} ${colors.textBadge}`}>
                    Tier {tier.sort} • {tier.name}
                  </span>
                  <TierEmblem tier={tier.key} size={28} className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-ink">{tier.name} Certificate</h2>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-brand-primary-strong tabular-nums">
                    {tier.min_points}
                  </span>
                  <span className="text-sm text-ink-muted font-medium">lifetime points required</span>
                </div>
                <p className="text-xs text-ink-muted mt-3 leading-relaxed">
                  Equivalent to approximately {Math.round(tier.min_points / 5)} standard PET bottles (approx. {((tier.min_points * 3) / 1000).toFixed(1)} kg of plastic recycled).
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-ink-muted">
                <span>Official Verifiable PDF</span>
                <span className="font-semibold text-ink">Issued Once (Idempotent)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plastic Credit Rates */}
      <div className="bg-surface-alt rounded-xl p-6 border border-line space-y-4">
        <div className="flex items-center gap-2">
          <Recycle className="w-5 h-5 text-brand-primary-strong" />
          <h2 className="text-lg font-bold text-ink">Plastic Item Category Rates</h2>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          Standard credit formula: <code>points = round(items x points_per_item x scale_factor)</code>. Rates are snapshotted permanently at the moment of entry submission.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm bg-surface rounded-lg border border-line overflow-hidden">
            <thead className="bg-surface-alt border-b border-line text-xs font-semibold text-ink-muted uppercase">
              <tr>
                <th className="py-3 px-4">Plastic Category</th>
                <th className="py-3 px-4">Weight Anchor</th>
                <th className="py-3 px-4">Credit Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {DEFAULT_PLASTIC_TYPES.map((type) => {
                const typeStyle = typeColorMap[type.key] || typeColorMap.pet_small;
                return (
                  <tr key={type.key}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-1.5 rounded-lg ${typeStyle.bg} ${typeStyle.text}`}>
                          <PlasticCategoryIcon typeKey={type.key} className="w-4 h-4" />
                        </span>
                        <span className="font-semibold text-ink">{type.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-ink-muted tabular-nums">~{type.avg_grams} g</td>
                    <td className="py-3 px-4 font-bold text-brand-primary-strong tabular-nums">
                      {type.points_per_item} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
