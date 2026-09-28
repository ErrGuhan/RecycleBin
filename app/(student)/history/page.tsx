'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlasticCategoryIcon } from '@/components/plastic/PlasticCategoryIcon';
import { StatusBadge, EntryStatus } from '@/components/ui/StatusBadge';
import { Clock, CheckCircle2, QrCode } from 'lucide-react';

interface HistoryItem {
  id: string;
  categoryKey: string;
  categoryLabel: string;
  items: number;
  points: number;
  binName: string;
  date: string;
  status: EntryStatus;
}

export default function StudentHistoryPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

  const history: HistoryItem[] = [
    {
      id: 'drop-1',
      categoryKey: 'pet_small',
      categoryLabel: 'Small Bottle (<750ml)',
      items: 4,
      points: 20,
      binName: 'Cafeteria Station A',
      date: 'Today, 11:42 AM',
      status: 'pending',
    },
    {
      id: 'drop-2',
      categoryKey: 'pet_medium',
      categoryLabel: 'Medium Bottle (1L-1.5L)',
      items: 6,
      points: 48,
      binName: 'Library Quad Bin',
      date: 'Yesterday, 3:15 PM',
      status: 'verified',
    },
    {
      id: 'drop-3',
      categoryKey: 'rigid_other',
      categoryLabel: 'Rigid Container',
      items: 2,
      points: 20,
      binName: 'Science Block Bin',
      date: '24 Sep, 10:05 AM',
      status: 'verified',
    },
    {
      id: 'drop-4',
      categoryKey: 'pet_large',
      categoryLabel: 'Large Bottle (2L+)',
      items: 1,
      points: 15,
      binName: 'Cafeteria Station A',
      date: '21 Sep, 1:30 PM',
      status: 'verified',
    },
  ];

  const filtered = history.filter((item) => {
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'verified') return item.status === 'verified';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight">Drop History</h1>
          <p className="text-xs text-ink-muted">All plastic items logged from campus bins</p>
        </div>
        <Link
          href="/b/7K3Q9DX2"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>New Drop</span>
        </Link>
      </div>

      {/* Visual Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
            filter === 'all'
              ? 'bg-brand-primary-strong text-white'
              : 'bg-surface border border-line text-ink-muted hover:text-ink'
          }`}
        >
          All Drops ({history.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
            filter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-surface border border-line text-ink-muted hover:text-ink'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending (1)</span>
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
            filter === 'verified'
              ? 'bg-emerald-700 text-white'
              : 'bg-surface border border-line text-ink-muted hover:text-ink'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified (3)</span>
        </button>
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-surface rounded-2xl border border-line p-4 shadow-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center shrink-0">
                <PlasticCategoryIcon typeKey={item.categoryKey} className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-ink">
                  {item.items} {item.items === 1 ? 'Item' : 'Items'} • {item.categoryLabel}
                </div>
                <div className="text-[11px] text-ink-muted mt-0.5">
                  {item.binName} • {item.date}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs font-black text-brand-primary-strong tabular-nums">
                +{item.points} pts
              </span>
              <StatusBadge status={item.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
