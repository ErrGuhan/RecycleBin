import React from 'react';
import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';

export type EntryStatus = 'pending' | 'verified' | 'rejected' | 'cancelled' | 'flagged';

interface StatusBadgeProps {
  status: EntryStatus;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const configs: Record<
    EntryStatus,
    {
      defaultLabel: string;
      icon: React.ComponentType<{ className?: string }>;
      bgClass: string;
      textClass: string;
      borderClass: string;
    }
  > = {
    pending: {
      defaultLabel: 'Pending Verification',
      icon: Clock,
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-800',
      borderClass: 'border-amber-200',
    },
    verified: {
      defaultLabel: 'Verified & Credited',
      icon: CheckCircle2,
      bgClass: 'bg-emerald-50',
      textClass: 'text-emerald-800',
      borderClass: 'border-emerald-200',
    },
    rejected: {
      defaultLabel: 'Rejected',
      icon: XCircle,
      bgClass: 'bg-rose-50',
      textClass: 'text-rose-800',
      borderClass: 'border-rose-200',
    },
    cancelled: {
      defaultLabel: 'Cancelled',
      icon: Ban,
      bgClass: 'bg-slate-100',
      textClass: 'text-slate-700',
      borderClass: 'border-slate-200',
    },
    flagged: {
      defaultLabel: 'Flagged for Review',
      icon: XCircle,
      bgClass: 'bg-rose-100',
      textClass: 'text-rose-900',
      borderClass: 'border-rose-300',
    },
  };

  const config = configs[status];
  const IconComponent = config.icon;
  const displayLabel = label || config.defaultLabel;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : 'px-2.5 py-1 text-xs sm:text-sm font-medium gap-1.5';

  const iconSizes = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses}`}
    >
      <IconComponent className={iconSizes} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}
