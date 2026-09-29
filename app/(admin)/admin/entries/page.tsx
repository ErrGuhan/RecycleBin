'use client';

import React, { useState, useEffect } from 'react';
import {
  ListFilter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  X,
  FileSpreadsheet,
  Inbox,
} from 'lucide-react';
import { PlasticCategoryIcon } from '@/components/plastic/PlasticCategoryIcon';
import { StatusBadge, EntryStatus } from '@/components/ui/StatusBadge';
import { createClient } from '@/lib/supabase/client';

interface AdminEntry {
  id: string;
  studentName: string;
  rollNo: string;
  department: string;
  binName: string;
  binCode: string;
  categoryKey: string;
  categoryLabel: string;
  items: number;
  pointsSnapshot: number;
  avgGramsSnapshot: number;
  status: EntryStatus;
  createdAt: string;
  flags?: string[];
  gpsDiffMeters?: number;
}

export default function AdminEntriesPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'flagged'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AdminEntry | null>(null);
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('entries')
          .select(`
            id,
            items,
            points_awarded,
            points_per_item_snapshot,
            avg_grams_snapshot,
            status,
            flags,
            created_at,
            profiles (full_name, roll_no, department),
            bins (name, code),
            plastic_types (key, label)
          `)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const mapped: AdminEntry[] = data.map((e) => {
            const prof = e.profiles as { full_name?: string; roll_no?: string; department?: string } | null;
            const bin = e.bins as { name?: string; code?: string } | null;
            const pt = e.plastic_types as { key?: string; label?: string } | null;

            return {
              id: e.id,
              studentName: prof?.full_name || 'Campus Student',
              rollNo: prof?.roll_no || 'Pending ID',
              department: prof?.department || 'Student',
              binName: bin?.name || 'Recycling Station',
              binCode: bin?.code || 'BIN',
              categoryKey: pt?.key || 'pet_small',
              categoryLabel: pt?.label || 'Recyclable Plastic',
              items: e.items,
              pointsSnapshot: e.points_awarded || (e.items * (e.points_per_item_snapshot || 5)),
              avgGramsSnapshot: e.avg_grams_snapshot || 20,
              status: e.status as EntryStatus,
              createdAt: new Date(e.created_at).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              flags: e.flags || [],
            };
          });
          setEntries(mapped);
        } else {
          setEntries([]);
        }
      } catch (err) {
        console.warn('Could not query live admin entries:', err);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadEntries();
  }, []);

  const filteredEntries = entries.filter((e) => {
    // Filter by tab
    if (filter === 'pending' && e.status !== 'pending') return false;
    if (filter === 'verified' && e.status !== 'verified') return false;
    if (filter === 'flagged' && e.status !== 'flagged') return false;

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        e.studentName.toLowerCase().includes(q) ||
        e.rollNo.toLowerCase().includes(q) ||
        e.binName.toLowerCase().includes(q) ||
        e.binCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
              <ListFilter className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">Student Drop Entries</h1>
              <p className="text-xs text-ink-muted">
                Audit feed of all item declarations from campus drop stations
              </p>
            </div>
          </div>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const csv = [
                'id,student,roll,bin,category,items,points,status,time',
                ...entries.map(
                  (e) =>
                    `${e.id},"${e.studentName}",${e.rollNo},"${e.binName}","${e.categoryLabel}",${e.items},${e.pointsSnapshot},${e.status},"${e.createdAt}"`
                ),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `entries-export-${Date.now()}.csv`;
              a.click();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-alt font-bold text-xs text-ink shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-primary-strong" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-2xl border border-line p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Visual Filter Tabs with Icons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-brand-primary-strong text-white'
                : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {entries.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              filter === 'pending'
                ? 'bg-amber-700 text-white'
                : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {entries.filter((e) => e.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              filter === 'verified'
                ? 'bg-emerald-700 text-white'
                : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {entries.filter((e) => e.status === 'verified').length}
            </span>
          </button>

          <button
            onClick={() => setFilter('flagged')}
            className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
              filter === 'flagged'
                ? 'bg-rose-700 text-white'
                : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Flagged</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {entries.filter((e) => e.status === 'flagged').length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or bin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
          />
        </div>
      </div>

      {/* Entries List / Cards with Skeleton Shimmer (BUILD_PROMPT.md §8.7) */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-surface rounded-2xl border border-line p-4 shadow-xs flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-surface-alt shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-surface-alt rounded-md" />
                  <div className="h-3 w-56 bg-surface-alt rounded-md" />
                </div>
              </div>
              <div className="h-7 w-24 bg-surface-alt rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-line p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-line text-brand-primary-strong mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ink">No Entries Found</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              {entries.length === 0
                ? 'No student drops have been recorded yet in the database.'
                : 'No entries match the active search or status filter.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-surface rounded-2xl border border-line p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-l-4 hover:border-l-brand-primary-strong hover:bg-surface-alt/40 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center shrink-0">
                  <PlasticCategoryIcon typeKey={entry.categoryKey} className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-ink">{entry.studentName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-alt border border-line text-[10px] font-mono font-bold text-ink-muted">
                      {entry.rollNo}
                    </span>
                    <span className="text-xs text-ink-muted hidden sm:inline">• {entry.department}</span>
                  </div>

                  <div className="text-xs text-ink-muted flex flex-wrap items-center gap-2">
                    <span className="font-bold text-ink">
                      {entry.items} items ({entry.categoryLabel})
                    </span>
                    <span>•</span>
                    <span>{entry.binName}</span>
                    <span className="font-mono text-[10px] text-brand-primary-strong">
                      ({entry.binCode})
                    </span>
                    <span>•</span>
                    <span>{entry.createdAt}</span>
                  </div>

                  {entry.flags && entry.flags.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-800 font-bold mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Flagged: {entry.flags.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-line">
                <div className="text-right">
                  <div className="text-sm font-black text-ink tabular-nums">
                    +{entry.pointsSnapshot} pts
                  </div>
                  <div className="text-[10px] text-ink-muted">~{entry.avgGramsSnapshot}g est.</div>
                </div>

                <StatusBadge status={entry.status} size="sm" />

                <button
                  type="button"
                  onClick={() => setSelectedEntry(entry)}
                  className="p-2 rounded-xl border border-line hover:bg-surface-alt text-ink-muted hover:text-ink transition-colors"
                  aria-label="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer / Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-line max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <PlasticCategoryIcon typeKey={selectedEntry.categoryKey} className="w-5 h-5 text-brand-primary-strong" />
                <h3 className="font-black text-ink text-base">Drop Entry Detail</h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-alt border border-line space-y-1">
                <div className="font-bold text-ink text-sm">{selectedEntry.studentName}</div>
                <div className="text-ink-muted">Roll: {selectedEntry.rollNo} • {selectedEntry.department}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-surface-alt border border-line">
                  <span className="text-[10px] text-ink-muted font-bold uppercase">Items</span>
                  <div className="text-base font-black text-ink mt-0.5">{selectedEntry.items} items</div>
                  <div className="text-[10px] text-ink-muted">{selectedEntry.categoryLabel}</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-alt border border-line">
                  <span className="text-[10px] text-ink-muted font-bold uppercase">Credits</span>
                  <div className="text-base font-black text-brand-primary-strong mt-0.5">+{selectedEntry.pointsSnapshot} pts</div>
                  <div className="text-[10px] text-ink-muted">~{selectedEntry.avgGramsSnapshot}g est.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-alt border border-line space-y-1">
                <span className="text-[10px] text-ink-muted font-bold uppercase">Drop Station</span>
                <div className="font-bold text-ink">{selectedEntry.binName} ({selectedEntry.binCode})</div>
                <div className="text-[10px] text-ink-muted">Timestamp: {selectedEntry.createdAt}</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedEntry(null)}
              className="w-full py-2.5 rounded-xl bg-brand-primary-strong text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
