import React from 'react';
import { Trophy, Users, Shield } from 'lucide-react';

export default function StudentLeaderboardPage() {
  const leaders = [
    { rank: 1, name: 'Pooja S.', dept: 'CS - Year 3', points: 1420, tier: 'Gold' },
    { rank: 2, name: 'Rahul V.', dept: 'Biotech - Year 2', points: 1180, tier: 'Gold' },
    { rank: 3, name: 'Aakash M.', dept: 'Mech - Year 4', points: 940, tier: 'Silver' },
    { rank: 4, name: 'Sneha R.', dept: 'Econ - Year 1', points: 760, tier: 'Silver' },
    { rank: 5, name: 'Aditya K. (You)', dept: 'CS - Year 2', points: 560, tier: 'Silver', isCurrentUser: true },
    { rank: 6, name: 'Divya P.', dept: 'Chem - Year 3', points: 490, tier: 'Bronze' },
    { rank: 7, name: 'Nikhil T.', dept: 'Math - Year 2', points: 380, tier: 'Bronze' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary-strong bg-brand-primary-soft px-2.5 py-1 rounded-full w-fit mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>St. Xavier&apos;s Campus Leaderboard</span>
        </div>
        <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Top Campus Recyclers</span>
        </h1>
        <p className="text-xs text-ink-muted">
          Showing opt-in participants. Display name masked for privacy.
        </p>
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-3 gap-2 text-center pt-2">
        {/* Rank 2 */}
        <div className="bg-surface rounded-2xl border border-line p-3 flex flex-col items-center justify-between shadow-xs">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-extrabold text-sm flex items-center justify-center mb-1">
            2
          </div>
          <div className="font-bold text-xs text-ink truncate w-full">{leaders[1].name}</div>
          <div className="text-xs font-black text-brand-primary-strong mt-1 tabular-nums">
            {leaders[1].points} pts
          </div>
        </div>

        {/* Rank 1 (Featured) with Trophy */}
        <div className="bg-brand-primary-soft/60 rounded-2xl border-2 border-brand-primary-strong p-3 flex flex-col items-center justify-between shadow-xs -mt-2">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center mb-1 shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="font-extrabold text-xs text-ink truncate w-full">{leaders[0].name}</div>
          <div className="text-sm font-black text-brand-primary-strong mt-1 tabular-nums">
            {leaders[0].points} pts
          </div>
        </div>

        {/* Rank 3 */}
        <div className="bg-surface rounded-2xl border border-line p-3 flex flex-col items-center justify-between shadow-xs">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-extrabold text-sm flex items-center justify-center mb-1">
            3
          </div>
          <div className="font-bold text-xs text-ink truncate w-full">{leaders[2].name}</div>
          <div className="text-xs font-black text-brand-primary-strong mt-1 tabular-nums">
            {leaders[2].points} pts
          </div>
        </div>
      </div>

      {/* Complete Roster Table */}
      <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-xs">
        <div className="divide-y divide-line/60">
          {leaders.map((student) => (
            <div
              key={student.rank}
              className={`p-3.5 flex items-center justify-between text-xs ${
                student.isCurrentUser
                  ? 'bg-brand-primary-soft/40 font-bold border-l-4 border-l-brand-primary-strong'
                  : 'hover:bg-surface-alt'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center font-extrabold text-ink-muted">
                  #{student.rank}
                </span>
                <div>
                  <div className="font-bold text-ink flex items-center gap-1.5">
                    <span>{student.name}</span>
                  </div>
                  <div className="text-[10px] text-ink-muted">{student.dept}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-alt border border-line text-ink-muted font-semibold">
                  {student.tier}
                </span>
                <span className="font-black text-brand-primary-strong tabular-nums text-sm">
                  {student.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-surface-alt border border-line text-xs text-ink-muted flex items-start gap-2">
        <Shield className="w-4 h-4 text-brand-primary-strong shrink-0 mt-0.5" />
        <span>
          Leaderboard participation is strictly opt-in. You can toggle your visibility at any time in Account Settings.
        </span>
      </div>
    </div>
  );
}
