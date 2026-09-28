import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Top Banner */}
      <div className="bg-brand-primary-strong text-white px-4 py-2 text-xs sm:text-sm text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-brand-primary-soft" />
        <span>Campus Plastic Credits: Pilot program active at St. Xavier&apos;s College</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandLogo href="/" />
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
            <Link
              href="/how-it-works"
              className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary-strong rounded-md py-1 px-2"
            >
              How it works
            </Link>
            <Link
              href="/rewards"
              className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary-strong rounded-md py-1 px-2"
            >
              Rewards & Tiers
            </Link>
            <Link
              href="/verify"
              className="hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary-strong rounded-md py-1 px-2 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-brand-primary-strong" />
              Verify Certificate
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dev/tokens"
              className="hidden lg:inline-flex text-xs px-2.5 py-1 rounded bg-surface-alt border border-line text-ink-muted hover:text-ink"
            >
              Dev Tokens
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center min-h-[44px] px-5 text-sm font-semibold rounded-lg bg-brand-primary-strong text-white hover:opacity-95 shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface-alt py-12 mt-16 text-sm text-ink-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <BrandLogo href="/" />
              <p className="text-xs leading-relaxed max-w-sm">
                A structured plastic collection & audit portal providing verifiable certificates
                for student environmental contributions on campus.
              </p>
              <div className="text-[11px] text-ink-muted/80">
                [CLIENT TO CONFIRM: company name, address, support email and phone]
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-ink text-xs uppercase tracking-wider mb-3">
                Programme
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/how-it-works" className="hover:text-ink">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/rewards" className="hover:text-ink">
                    Tiers & Points
                  </Link>
                </li>
                <li>
                  <Link href="/verify" className="hover:text-ink">
                    Verify a Certificate
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-ink text-xs uppercase tracking-wider mb-3">
                Legal & Privacy
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/privacy" className="hover:text-ink">
                    Privacy Notice (DPDP)
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-ink">
                    Terms of Participation
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:sustainability@campusplasticcredits.org"
                    className="hover:text-ink text-brand-primary-strong font-medium"
                  >
                    Grievance Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} Campus Plastic Credits. All rights reserved.</p>
            <p className="text-ink-muted text-[11px]">
              Designed with Bisleri Aqua Green palette tokens • Append-only audit integrity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
