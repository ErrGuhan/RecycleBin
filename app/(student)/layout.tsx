'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Home, History, Award, Trophy, User } from 'lucide-react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/home', icon: Home },
    { label: 'History', href: '/history', icon: History },
    { label: 'Certificates', href: '/certificates', icon: Award },
    { label: 'Board', href: '/leaderboard', icon: Trophy },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col items-center">
      {/* Centered Mobile-First Frame */}
      <div className="w-full max-w-md min-h-screen bg-surface flex flex-col shadow-sm border-x border-line relative pb-24">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur border-b border-line px-4 h-14 flex items-center justify-between">
          <BrandLogo href="/home" showSubtitle={false} />
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-primary-soft text-brand-primary-strong">
              Student
            </span>
          </div>
        </header>

        {/* Dynamic Body */}
        <main className="flex-1 p-4 pb-24 overflow-y-auto">{children}</main>

        {/* Bottom Tab Bar (Fixed for Mobile One-Handed Navigation) */}
        <nav
          aria-label="Student Navigation"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 bg-surface/98 backdrop-blur-md border-t border-x border-line py-1.5 px-3 flex items-center justify-around w-full max-w-md shadow-lg"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary-strong ${
                  isActive
                    ? 'text-brand-primary-strong font-semibold'
                    : 'text-ink-muted hover:text-ink font-normal'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-primary-strong" />
                  )}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
