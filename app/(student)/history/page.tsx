'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlasticCategoryIcon } from '@/components/plastic/PlasticCategoryIcon';
import { StatusBadge, EntryStatus } from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';
import { Clock, CheckCircle2, QrCode, Inbox } from 'lucide-react';

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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let items: HistoryItem[] = [];

        if (user) {
          const { data: dbEntries } = await supabase
            .from('entries')
            .select(`
              id,
              items,
              status,
              points_awarded,
              points_per_item_snapshot,
              created_at,
              bins (name),
              plastic_types (key, label)
            `)
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

          if (dbEntries && dbEntries.length > 0) {
            interface HistoryRow {
              id: string;
              items: number;
              status: 'pending' | 'verified' | 'rejected' | 'cancelled';
              points_awarded: number | null;
              points_per_item_snapshot: number;
              created_at: string;
              bins: { name?: string } | null;
              plastic_types: { key?: string; label?: string } | null;
            }
            items = (dbEntries as unknown as HistoryRow[]).map((e) => {
              const binObj = e.bins;
              const typeObj = e.plastic_types;
              return {
                id: e.id,
                categoryKey: typeObj?.key || 'pet_small',
                categoryLabel: typeObj?.label || 'Recyclable Plastic',
                items: e.items,
                points: e.points_awarded || (e.items * (e.points_per_item_snapshot || 5)),
                binName: binObj?.name || 'Campus Bin',
                date: new Date(e.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                status: e.status,
              };
            });
          }
        }

        // Merge with local session drops if any
        if (typeof window !== 'undefined') {
          const localDrops = JSON.parse(localStorage.getItem('recyclebin_recent_drops') || '[]');
          if (localDrops.length > 0 && items.length === 0) {
            items = localDrops.map((d: {
              id: string;
              bin_name?: string;
              category_key?: string;
              category_label?: string;
              items: number;
              points_estimate?: number;
              status: EntryStatus;
              created_at: string;
            }) => ({
              id: d.id,
              categoryKey: d.category_key || 'pet_small',
              categoryLabel: d.category_label || 'Recyclable Plastic',
              items: d.items,
              points: d.points_estimate || d.items * 5,
              binName: d.bin_name || 'Campus Bin',
              date: 'Recent',
              status: d.status,
            }));
          }
        }

        setHistory(items);
      } catch (err) {
        console.warn('Could not load student history:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  const pendingCount = history.filter((i) => i.status === 'pending').length;
  const verifiedCount = history.filter((i) => i.status === 'verified').length;

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
          <p className="text-xs text-ink-muted font-medium">All items recorded across campus recycling bins</p>
        </div>
        <Link
          href="/b/7K3Q9DX2"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
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
              ? 'bg-brand-primary-strong text-white shadow-xs'
              : 'bg-surface border border-line text-ink-muted hover:text-ink'
          }`}
        >
          All Drops ({history.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
            filter === 'pending'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-surface border border-line text-ink-muted hover:text-ink'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending ({pendingCount})</span>
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
            filter === 'verified'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-surface border border-line text-ink-muted hover:text-ink'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified ({verifiedCount})</span>
        </button>
      </div>

      {/* History Items List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-ink-muted space-y-2">
          <div className="w-6 h-6 rounded-full border-2 border-brand-primary-strong border-t-transparent animate-spin mx-auto" />
          <p>Loading your history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-line p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-line text-brand-primary-strong mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ink">No Drops Found</h3>
            <p className="text-xs text-ink-muted max-w-xs mx-auto">
              {filter === 'all'
                ? 'You have not recorded any recycling drops yet.'
                : `No ${filter} drops recorded.`}
            </p>
          </div>
          <Link
            href="/b/7K3Q9DX2"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan a Bin</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-2xl border border-line p-3.5 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center shrink-0">
                  <PlasticCategoryIcon typeKey={item.categoryKey} className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-ink">
                    {item.items} {item.items === 1 ? 'Item' : 'Items'} • {item.categoryLabel}
                  </div>
                  <div className="text-[11px] text-ink-muted font-medium mt-0.5">
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
      )}
    </div>
  );
}
