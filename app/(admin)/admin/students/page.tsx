'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Award,
  CheckCircle2,
  Mail,
  GraduationCap,
  Sparkles,
  Download,
} from 'lucide-react';

interface StudentRosterItem {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  year: string;
  email: string;
  lifetimePoints: number;
  totalDrops: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  hasConsent: boolean;
  joinedAt: string;
}

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const [students] = useState<StudentRosterItem[]>([
    {
      id: 'stu-1',
      name: 'Pooja Sharma',
      rollNo: '23CS042',
      department: 'Computer Science',
      year: '3rd Year',
      email: 'pooja.s@college.edu',
      lifetimePoints: 1420,
      totalDrops: 48,
      tier: 'Gold',
      hasConsent: true,
      joinedAt: 'Aug 2026',
    },
    {
      id: 'stu-2',
      name: 'Rahul Verma',
      rollNo: '25BT019',
      department: 'Biotechnology',
      year: '2nd Year',
      email: 'rahul.v@college.edu',
      lifetimePoints: 1180,
      totalDrops: 36,
      tier: 'Gold',
      hasConsent: true,
      joinedAt: 'Aug 2026',
    },
    {
      id: 'stu-3',
      name: 'Aakash Mehta',
      rollNo: '22ME091',
      department: 'Mechanical Eng',
      year: '4th Year',
      email: 'aakash.m@college.edu',
      lifetimePoints: 940,
      totalDrops: 29,
      tier: 'Silver',
      hasConsent: true,
      joinedAt: 'Sep 2026',
    },
    {
      id: 'stu-4',
      name: 'Aditya Kumar',
      rollNo: '24CS108',
      department: 'Computer Science',
      year: '2nd Year',
      email: 'aditya.k@college.edu',
      lifetimePoints: 560,
      totalDrops: 18,
      tier: 'Silver',
      hasConsent: true,
      joinedAt: 'Sep 2026',
    },
    {
      id: 'stu-5',
      name: 'Divya Patel',
      rollNo: '23CH055',
      department: 'Chemistry',
      year: '3rd Year',
      email: 'divya.p@college.edu',
      lifetimePoints: 490,
      totalDrops: 14,
      tier: 'Bronze',
      hasConsent: true,
      joinedAt: 'Sep 2026',
    },
  ]);

  const filteredStudents = students.filter((s) => {
    if (selectedDept !== 'all' && s.department !== selectedDept) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const departments = ['all', ...Array.from(new Set(students.map((s) => s.department)))];

  const getTierBadge = (tier: StudentRosterItem['tier']) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Gold':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Silver':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Bronze':
      default:
        return 'bg-orange-100 text-orange-900 border-orange-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-primary-soft text-brand-primary-strong flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight">Student Roster</h1>
              <p className="text-xs text-ink-muted">
                Enrolled campus recyclers, points ledger totals, and certificate status
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const csv = [
              'roll,name,department,year,email,lifetime_points,total_drops,tier',
              ...students.map(
                (s) =>
                  `${s.rollNo},"${s.name}","${s.department}","${s.year}",${s.email},${s.lifetimePoints},${s.totalDrops},${s.tier}`
              ),
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students-roster-${Date.now()}.csv`;
            a.click();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-line bg-surface hover:bg-surface-alt font-bold text-xs text-ink shadow-xs"
        >
          <Download className="w-4 h-4 text-brand-primary-strong" />
          <span>Export Roster (CSV)</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-surface rounded-2xl border border-line p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-line bg-surface text-ink text-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink-muted">Dept:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl border border-line bg-surface text-xs font-medium text-ink focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Icon-Based Student Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="bg-surface rounded-2xl border border-line p-5 shadow-xs hover:border-brand-primary-strong/40 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Student Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary-soft text-brand-primary-strong font-black text-base flex items-center justify-center shrink-0">
                    {student.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-extrabold text-sm text-ink">{student.name}</h2>
                      <span className="font-mono text-[11px] font-bold text-ink-muted bg-surface-alt px-1.5 py-0.5 rounded border border-line">
                        {student.rollNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-ink-muted/70" />
                      <span>
                        {student.department} • {student.year}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tier Badge */}
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${getTierBadge(
                    student.tier
                  )}`}
                >
                  <Award className="w-3 h-3" />
                  <span>{student.tier}</span>
                </span>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-surface-alt/70 border border-line/60">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                    Verified Points
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-4 h-4 text-brand-primary-strong" />
                    <span className="text-lg font-black text-brand-primary-strong tabular-nums">
                      {student.lifetimePoints}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-alt/70 border border-line/60">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                    Campus Drops
                  </span>
                  <div className="text-lg font-black text-ink tabular-nums mt-0.5">
                    {student.totalDrops}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-4 pt-3 border-t border-line/70 flex items-center justify-between text-xs text-ink-muted">
              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                <Mail className="w-3.5 h-3.5 text-ink-muted/70 shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>DPDP 18+</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
