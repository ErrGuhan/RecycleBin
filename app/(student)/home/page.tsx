'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BottleProgress } from '@/components/student/BottleProgress';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  QrCode,
  Clock,
  CheckCircle2,
  Undo2,
  ArrowRight,
} from 'lucide-react';

interface RecentEntry {
  id: string;
  bin_name: string;
  plastic_type: string;
  items: number;
  status: 'pending' | 'verified' | 'rejected' | 'cancelled';
  created_at: string;
  can_undo: boolean;
  points_estimate: number;
}

export default function StudentHomePage() {
  // Demonstration state for initial scaffold
  const [entries, setEntries] = useState<RecentEntry[]>([
    {
      id: 'entry-1',
      bin_name: 'Cafeteria Station A',
      plastic_type: 'PET bottle up to 750 ml',
      items: 4,
      status: 'pending',
      created_at: 'Just now',
      can_undo: true,
      points_estimate: 20,
    },
    {
      id: 'entry-2',
      bin_name: 'Library Quad Bin',
      plastic_type: 'PET bottle 1 to 1.5 L',
      items: 6,
      status: 'verified',
      created_at: 'Yesterday',
      can_undo: false,
      points_estimate: 48,
    },
    {
      id: 'entry-3',
      bin_name: 'Science Block Bin',
      plastic_type: 'Other rigid plastic',
      items: 2,
      status: 'verified',
      created_at: '3 days ago',
      can_undo: false,
      points_estimate: 20,
    },
  ]);

  const handleUndo = (id: string) => {
    setEntries(
      entries.map((e) =>
        e.id === id ? { ...e, status: 'cancelled' as const, can_undo: false } : e
      )
    );
  };

  const pendingItems = entries
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.items, 0);

  const verifiedItems = entries
    .filter((e) => e.status === 'verified')
    .reduce((sum, e) => sum + e.items, 0);

  const totalPoints = 68; // 48 + 20

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink tracking-tight">
            Hi, Aditya 👋
          </h1>
          <p className="text-xs text-ink-muted">St. Xavier&apos;s College • Roll: 24CS108</p>
        </div>
        <Link
          href="/b/7K3Q9DX2"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary-strong text-white font-semibold text-xs shadow-xs hover:opacity-95"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Bin</span>
        </Link>
      </div>

      {/* Signature Bottle Progress */}
      <BottleProgress
        percentage={68}
        currentPoints={totalPoints}
        nextTierPoints={100}
        currentTierName="Bronze Contributor"
        nextTierName="Bronze Tier"
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pending Items Card */}
        <div className="bg-surface rounded-xl p-4 border border-line shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
          <div className="text-2xl font-extrabold text-ink tabular-nums">
            {pendingItems}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            Awaiting bin scale weighing
          </p>
        </div>

        {/* Verified Items Card */}
        <div className="bg-surface rounded-xl p-4 border border-line shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
          <div className="text-2xl font-extrabold text-ink tabular-nums">
            {verifiedItems}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            Points permanently credited
          </p>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-surface rounded-xl border border-line p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Recent Drops</h2>
          <Link
            href="/history"
            className="text-xs font-semibold text-brand-primary-strong hover:underline flex items-center gap-1"
          >
            <span>All history</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-line/60">
          {entries.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-ink text-sm">
                  {item.items} items • {item.plastic_type}
                </div>
                <div className="text-ink-muted text-[11px] flex items-center gap-2">
                  <span>{item.bin_name}</span>
                  <span>•</span>
                  <span>{item.created_at}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={item.status} size="sm" />
                {item.can_undo && (
                  <button
                    onClick={() => handleUndo(item.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
