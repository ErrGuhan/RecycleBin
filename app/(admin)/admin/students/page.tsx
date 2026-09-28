'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  GraduationCap,
  Download,
  Inbox,
  Phone,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface StudentRosterItem {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  year: string;
  semester?: string;
  phone?: string;
  lifetimePoints: number;
  totalDrops: number;
  tier: 'Starter' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  hasConsent: boolean;
  joinedAt: string;
}

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const supabase = createClient();
        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            first_name,
            last_name,
            roll_no,
            department,
            year,
            semester,
            phone,
            consented_at,
            created_at
          `)
          .eq('role', 'student')
          .order('created_at', { ascending: false });

        // Query entries count grouped by student
        const { data: entries } = await supabase
          .from('entries')
          .select('student_id');

        const dropCounts: Record<string, number> = {};
        entries?.forEach((e) => {
          dropCounts[e.student_id] = (dropCounts[e.student_id] || 0) + 1;
        });

        // Query points ledger grouped by student
        const { data: ledger } = await supabase
          .from('points_ledger')
          .select('student_id, points');

        const pointsMap: Record<string, number> = {};
        ledger?.forEach((l) => {
          pointsMap[l.student_id] = (pointsMap[l.student_id] || 0) + (l.points || 0);
        });

        if (dbProfiles && dbProfiles.length > 0) {
          const mapped: StudentRosterItem[] = dbProfiles.map((p) => {
            const pts = pointsMap[p.id] || 0;
            const tier: StudentRosterItem['tier'] =
              pts >= 2500 ? 'Platinum' : pts >= 1000 ? 'Gold' : pts >= 500 ? 'Silver' : pts >= 100 ? 'Bronze' : 'Starter';

            return {
              id: p.id,
              name: p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Student',
              rollNo: p.roll_no || 'Pending ID',
              department: p.department || 'General',
              year: p.year || '1st Year',
              semester: p.semester || undefined,
              phone: p.phone || undefined,
              lifetimePoints: pts,
              totalDrops: dropCounts[p.id] || 0,
              tier,
              hasConsent: Boolean(p.consented_at),
              joinedAt: new Date(p.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' }),
            };
          });
          setStudents(mapped);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.warn('Could not load student roster:', err);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadStudents();
  }, []);

  const departments = ['all', ...Array.from(new Set(students.map((s) => s.department)))];

  const filtered = students.filter((s) => {
    if (selectedDept !== 'all' && s.department !== selectedDept) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Gold':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Silver':
        return 'bg-slate-100 text-slate-900 border-slate-300';
      case 'Bronze':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-surface-alt text-ink-muted border-line';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">Student Roster &amp; Credits</h1>
              <p className="text-xs text-ink-muted">
                Student accounts, roll numbers, verified lifetime credits, and tier standings
              </p>
            </div>
          </div>
        </div>

        {students.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const csv = [
                'name,roll_no,department,year,points,drops,tier,joined',
                ...students.map(
                  (s) =>
                    `"${s.name}",${s.rollNo},"${s.department}","${s.year}",${s.lifetimePoints},${s.totalDrops},${s.tier},"${s.joinedAt}"`
                ),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `student-roster-${Date.now()}.csv`;
              a.click();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-alt font-bold text-xs text-ink shadow-xs"
          >
            <Download className="w-4 h-4 text-brand-primary-strong" />
            <span>Export Roster (CSV)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-2xl border border-line p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-ink-muted text-[11px] uppercase tracking-wider shrink-0">
            Dept:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-full font-bold capitalize transition-colors shrink-0 ${
                selectedDept === dept
                  ? 'bg-brand-primary-strong text-white'
                  : 'bg-surface border border-line text-ink-muted hover:text-ink'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
          />
        </div>
      </div>

      {/* Student Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-ink-muted space-y-2">
          <div className="w-6 h-6 rounded-full border-2 border-brand-primary-strong border-t-transparent animate-spin mx-auto" />
          <p>Syncing student accounts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-line p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-alt border border-line text-brand-primary-strong mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-bold text-ink">No Students Registered</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            {students.length === 0
              ? 'When students complete their one-time profile setup and scan bins, they will appear here.'
              : 'No students match your active filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="bg-surface rounded-2xl border border-line p-4 shadow-xs flex flex-col justify-between hover:border-brand-primary-strong/40 transition-colors"
            >
              <div className="space-y-3">
                {/* Header: Name, Roll, Tier */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-ink">{student.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-brand-primary-strong shrink-0" />
                      <span className="font-mono font-bold text-ink">{student.rollNo}</span>
                      <span>•</span>
                      <span>{student.year}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getTierColor(
                      student.tier
                    )}`}
                  >
                    {student.tier}
                  </span>
                </div>

                {/* Dept Badge */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-surface-alt border border-line text-ink-muted font-medium">
                    {student.department}
                  </span>
                  {student.semester && (
                    <span className="px-2 py-0.5 rounded-md bg-surface-alt border border-line text-ink-muted font-medium">
                      {student.semester}
                    </span>
                  )}
                  {student.phone && (
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <Phone className="w-3 h-3 text-brand-primary-strong" />
                      <span>{student.phone}</span>
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-surface-alt border border-line">
                    <span className="text-[10px] text-ink-muted font-bold block">Lifetime Credits</span>
                    <span className="text-base font-black text-brand-primary-strong tabular-nums">
                      {student.lifetimePoints}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-alt border border-line">
                    <span className="text-[10px] text-ink-muted font-bold block">Total Drops</span>
                    <span className="text-base font-black text-ink tabular-nums">
                      {student.totalDrops}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-3 pt-2.5 border-t border-line/70 flex items-center justify-between text-[11px] text-ink-muted">
                <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>DPDP Verified</span>
                </div>
                <span>Joined {student.joinedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
