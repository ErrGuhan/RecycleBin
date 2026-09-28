'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BottleProgress } from '@/components/student/BottleProgress';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PlasticCategoryIcon } from '@/components/plastic/PlasticCategoryIcon';
import { createClient } from '@/lib/supabase/client';
import {
  QrCode,
  Clock,
  CheckCircle2,
  Undo2,
  ArrowRight,
  Inbox,
  AlertCircle,
} from 'lucide-react';

interface EntryItem {
  id: string;
  bin_name: string;
  category_key?: string;
  plastic_type: string;
  items: number;
  status: 'pending' | 'verified' | 'rejected' | 'cancelled';
  created_at: string;
  can_undo: boolean;
  points_estimate: number;
}

export default function StudentHomePage() {
  const [profile, setProfile] = useState<{
    firstName: string;
    fullName: string;
    rollNo: string;
    department: string;
  } | null>(null);

  const [entries, setEntries] = useState<EntryItem[]>([]);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        let loadedProfile: { firstName: string; fullName: string; rollNo: string; department: string } | null = null;

        // 1. Check local session cache for profile
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('recyclebin_student_profile');
          if (cached) {
            try {
              const p = JSON.parse(cached);
              loadedProfile = {
                firstName: p.first_name || p.full_name?.split(' ')[0] || 'Student',
                fullName: p.full_name || 'Student',
                rollNo: p.roll_no || '',
                department: p.department || '',
              };
            } catch {
              // ignore
            }
          }
        }

        // 2. Query Supabase
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name, full_name, roll_no, department')
            .eq('id', user.id)
            .maybeSingle();

          if (dbProfile) {
            loadedProfile = {
              firstName: dbProfile.first_name || dbProfile.full_name?.split(' ')[0] || 'Student',
              fullName: dbProfile.full_name || 'Student',
              rollNo: dbProfile.roll_no || '',
              department: dbProfile.department || '',
            };
          }

          // Query live entries
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
            .order('created_at', { ascending: false })
            .limit(10);

          if (dbEntries && dbEntries.length > 0) {
            interface HomeEntryRow {
              id: string;
              items: number;
              status: 'pending' | 'verified' | 'rejected' | 'cancelled';
              points_awarded: number | null;
              points_per_item_snapshot: number;
              created_at: string;
              bins: { name?: string } | null;
              plastic_types: { key?: string; label?: string } | null;
            }
            const mapped: EntryItem[] = (dbEntries as unknown as HomeEntryRow[]).map((e) => {
              const binObj = e.bins;
              const typeObj = e.plastic_types;
              const isRecent = Date.now() - new Date(e.created_at).getTime() < 5 * 60 * 1000;
              return {
                id: e.id,
                bin_name: binObj?.name || 'Campus Bin',
                category_key: typeObj?.key || 'pet_small',
                plastic_type: typeObj?.label || 'Recyclable Plastic',
                items: e.items,
                status: e.status,
                created_at: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                can_undo: e.status === 'pending' && isRecent,
                points_estimate: e.points_awarded || (e.items * (e.points_per_item_snapshot || 5)),
              };
            });
            setEntries(mapped);
          }

          // Query points balance
          const { data: ledger } = await supabase
            .from('points_ledger')
            .select('points')
            .eq('student_id', user.id);

          if (ledger) {
            const total = ledger.reduce((acc, row) => acc + (row.points || 0), 0);
            setPoints(total);
          }
        }

        // If no remote entries found, check local drops cache
        if (typeof window !== 'undefined') {
          const localDrops = JSON.parse(localStorage.getItem('recyclebin_recent_drops') || '[]');
          if (localDrops.length > 0) {
            setEntries((prev) => {
              if (prev.length > 0) return prev;
              return localDrops.map((d: {
                id: string;
                bin_name: string;
                category_key?: string;
                category_label: string;
                items: number;
                status: 'pending' | 'verified' | 'rejected' | 'cancelled';
                created_at: string;
                can_undo: boolean;
                points_estimate: number;
              }) => ({
                id: d.id,
                bin_name: d.bin_name || 'Campus Bin',
                category_key: d.category_key || 'pet_small',
                plastic_type: d.category_label || 'Recyclable Plastic',
                items: d.items,
                status: d.status,
                created_at: 'Just now',
                can_undo: d.status === 'pending',
                points_estimate: d.points_estimate || d.items * 5,
              }));
            });
          }
        }

        setProfile(loadedProfile);
      } catch (err) {
        console.warn('Could not load student home data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleUndo = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'cancelled' as const, can_undo: false } : e))
    );

    if (typeof window !== 'undefined') {
      const localDrops = JSON.parse(localStorage.getItem('recyclebin_recent_drops') || '[]');
      const updated = localDrops.map((d: { id: string; status: string }) =>
        d.id === id ? { ...d, status: 'cancelled' } : d
      );
      localStorage.setItem('recyclebin_recent_drops', JSON.stringify(updated));
    }
  };

  const pendingItems = entries
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.items, 0);

  const verifiedItems = entries
    .filter((e) => e.status === 'verified')
    .reduce((sum, e) => sum + e.items, 0);

  // Progress towards Bronze (100) or Silver (500)
  const nextTierPoints = points < 100 ? 100 : points < 500 ? 500 : points < 1000 ? 1000 : 2500;
  const currentTierName = points >= 1000 ? 'Gold' : points >= 500 ? 'Silver' : points >= 100 ? 'Bronze' : 'Starter';
  const nextTierName = points < 100 ? 'Bronze Tier' : points < 500 ? 'Silver Tier' : points < 1000 ? 'Gold Tier' : 'Platinum Tier';
  const progressPercent = Math.min(100, Math.round((points / nextTierPoints) * 100));

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-ink tracking-tight">
            Hi, {profile?.firstName || 'Student'} 👋
          </h1>
          <p className="text-xs text-ink-muted font-medium">
            {profile?.rollNo ? (
              <span>Roll: {profile.rollNo} • {profile.department || 'Campus Student'}</span>
            ) : (
              <span>Campus Plastic Recycling Portal</span>
            )}
          </p>
        </div>
        <Link
          href="/b/7K3Q9DX2"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Bin</span>
        </Link>
      </div>

      {/* Incomplete Profile Prompt Banner (if not filled) */}
      {!profile?.rollNo && !isLoading && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Complete your 1-time setup for certificate credits.</span>
          </div>
          <Link
            href="/onboarding"
            className="px-2.5 py-1 rounded-lg bg-amber-700 text-white font-bold text-[11px] shrink-0 hover:bg-amber-800"
          >
            Setup
          </Link>
        </div>
      )}

      {/* Signature Bottle Progress */}
      <BottleProgress
        percentage={progressPercent}
        currentPoints={points}
        nextTierPoints={nextTierPoints}
        currentTierName={currentTierName}
        nextTierName={nextTierName}
      />

      {/* Visual Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pending Card */}
        <div className="bg-surface rounded-2xl p-4 border border-line shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pending Drops</span>
          </div>
          <div className="text-2xl font-black text-ink tabular-nums">
            {pendingItems}
          </div>
          <p className="text-[11px] text-ink-muted font-medium mt-0.5">
            Awaiting bin scale weighing
          </p>
        </div>

        {/* Verified Card */}
        <div className="bg-surface rounded-2xl p-4 border border-line shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified Drops</span>
          </div>
          <div className="text-2xl font-black text-ink tabular-nums">
            {verifiedItems}
          </div>
          <p className="text-[11px] text-ink-muted font-medium mt-0.5">
            Points permanently credited
          </p>
        </div>
      </div>

      {/* Activity Section */}
      <div className="bg-surface rounded-2xl border border-line p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-ink">Recent Drops</h2>
          {entries.length > 0 && (
            <Link
              href="/history"
              className="text-xs font-bold text-brand-primary-strong hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-ink-muted space-y-2">
            <div className="w-5 h-5 rounded-full border-2 border-brand-primary-strong border-t-transparent animate-spin mx-auto" />
            <p>Syncing live drops...</p>
          </div>
        ) : entries.length === 0 ? (
          /* Empty State (No Demo Data!) */
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-line text-brand-primary-strong mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-ink">No Drops Logged Yet</h3>
              <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                Drop clean bottles, cups, or containers at any campus station and scan the bin QR code.
              </p>
            </div>
            <Link
              href="/b/7K3Q9DX2"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary-strong text-white font-bold text-xs shadow-xs hover:opacity-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Log First Drop</span>
            </Link>
          </div>
        ) : (
          /* Live Entries List */
          <div className="divide-y divide-line/60">
            {entries.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-alt border border-line flex items-center justify-center text-ink shrink-0">
                    <PlasticCategoryIcon typeKey={item.category_key || 'pet_small'} className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-ink text-sm">
                      {item.items} {item.items === 1 ? 'item' : 'items'} • {item.plastic_type}
                    </div>
                    <div className="text-ink-muted text-[11px] font-medium flex items-center gap-2">
                      <span>{item.bin_name}</span>
                      <span>•</span>
                      <span>{item.created_at}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={item.status} size="sm" />
                  {item.can_undo && (
                    <button
                      onClick={() => handleUndo(item.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>Undo</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
