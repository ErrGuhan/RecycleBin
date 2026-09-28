'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import {
  LayoutDashboard,
  Scale,
  QrCode,
  Users,
  ListFilter,
  Award,
  FileBarChart2,
  DollarSign,
  Settings,
  History,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Verify Bins', href: '/admin/verify', icon: Scale, badge: 'Live' },
    { label: 'Bins & QR', href: '/admin/bins', icon: QrCode },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Entries', href: '/admin/entries', icon: ListFilter },
    { label: 'Certificates', href: '/admin/certificates', icon: Award },
    { label: 'Reports', href: '/admin/reports', icon: FileBarChart2 },
    { label: 'Accounting', href: '/admin/accounting', icon: DollarSign },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Log', href: '/admin/audit', icon: History },
  ];

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-surface border-b border-line px-4 h-14 flex items-center justify-between sticky top-0 z-40">
        <BrandLogo href="/admin" showSubtitle={false} />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 min-h-[44px] min-w-[44px] rounded-lg border border-line text-ink-muted hover:text-ink flex items-center justify-center"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-line flex flex-col transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-line flex items-center justify-between">
          <BrandLogo href="/admin" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-ink-muted hover:text-ink"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-2 bg-brand-primary-soft/50 border-b border-line/50 flex items-center gap-2 text-xs font-semibold text-brand-primary-strong">
          <ShieldCheck className="w-4 h-4" />
          <span>Operations & Admin Console</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary-strong ${
                  isActive
                    ? 'bg-brand-primary-strong text-white font-medium shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-alt'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-brand-primary-soft text-brand-primary-strong'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-line text-xs text-ink-muted flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink">Campus</span>
            <span className="truncate max-w-[120px]">St. Xavier&apos;s</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Timezone</span>
            <span className="font-mono text-[11px]">Asia/Kolkata</span>
          </div>
          <Link
            href="/"
            className="mt-2 text-center py-2 px-3 rounded-lg border border-line hover:bg-surface-alt text-ink font-medium"
          >
            Switch to Public Site
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
