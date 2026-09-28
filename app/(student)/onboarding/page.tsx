'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import {
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/home';

  // State
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('2nd Year');
  const [phone, setPhone] = useState('');
  const [isAdult, setIsAdult] = useState<boolean | null>(null);
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Computer Science',
    'Biotechnology',
    'Mechanical Engineering',
    'Economics & Commerce',
    'Chemistry',
    'Mathematics & Statistics',
    'Other / General Studies',
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !rollNo.trim()) {
      setError('Please provide your full name and student roll number.');
      return;
    }

    if (isAdult !== true) {
      setError('You must be 18 or older to register online. If under 18, please contact the programme team.');
      return;
    }

    if (!consented) {
      setError('Please review and consent to the DPDP Privacy Notice to complete registration.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Simulate saving profile to Supabase
    setTimeout(() => {
      setIsSubmitting(false);
      // Safe relative redirect
      const safeRedirect = nextUrl.startsWith('/') && !nextUrl.startsWith('//') ? nextUrl : '/home';
      router.push(safeRedirect);
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <BrandLogo href="/" />
        </div>
        <h1 className="text-2xl font-black text-ink tracking-tight">Complete Your Profile</h1>
        <p className="text-xs text-ink-muted">
          Your roll number and name are required for official college certificate issuance.
        </p>
      </div>

      <div className="bg-surface rounded-3xl border border-line p-6 shadow-sm space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label htmlFor="full-name" className="block font-bold text-ink mb-1.5">
              Full Legal Name (as printed on Certificate) *
            </label>
            <input
              id="full-name"
              type="text"
              placeholder="e.g. Aditya Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full min-h-[46px] px-4 rounded-xl border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
              required
            />
          </div>

          {/* Roll No */}
          <div>
            <label htmlFor="roll-no" className="block font-bold text-ink mb-1.5">
              College Roll / Registration Number *
            </label>
            <input
              id="roll-no"
              type="text"
              placeholder="e.g. 24CS108"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value.toUpperCase())}
              className="w-full min-h-[46px] px-4 rounded-xl border border-line bg-surface text-ink text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
              required
            />
          </div>

          {/* Department & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="department" className="block font-bold text-ink mb-1.5">
                Department *
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full min-h-[46px] px-3 rounded-xl border border-line bg-surface text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block font-bold text-ink mb-1.5">
                Academic Year *
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full min-h-[46px] px-3 rounded-xl border border-line bg-surface text-ink text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Phone */}
          <div>
            <label htmlFor="phone" className="block font-bold text-ink mb-1.5">
              WhatsApp / Mobile (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full min-h-[46px] px-4 rounded-xl border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
            />
            <p className="text-[10px] text-ink-muted mt-1">
              Used only for support if a dropped batch is flagged for review.
            </p>
          </div>

          {/* Age Gate (18+ confirmation) */}
          <div className="p-3.5 rounded-2xl bg-surface-alt border border-line space-y-2">
            <span className="font-bold text-ink">Age Verification (DPDP Requirement) *</span>
            <p className="text-[11px] text-ink-muted">
              Are you 18 years of age or older?
            </p>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
                <input
                  type="radio"
                  name="is_adult"
                  checked={isAdult === true}
                  onChange={() => setIsAdult(true)}
                  className="w-4 h-4 text-brand-primary-strong accent-brand-primary-strong"
                />
                <span>Yes, I am 18 or older</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
                <input
                  type="radio"
                  name="is_adult"
                  checked={isAdult === false}
                  onChange={() => setIsAdult(false)}
                  className="w-4 h-4 text-brand-primary-strong accent-brand-primary-strong"
                />
                <span>No, I am under 18</span>
              </label>
            </div>
          </div>

          {/* DPDP Consent Checkbox (Unticked by default) */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] leading-relaxed text-ink-muted">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-line text-brand-primary-strong accent-brand-primary-strong shrink-0"
              />
              <span>
                I agree to the collection of my name, student roll number, and recycling drop logs for certificate credentialing in accordance with the{' '}
                <Link href="/privacy" target="_blank" className="font-bold text-brand-primary-strong hover:underline">
                  DPDP Privacy Notice
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[50px] rounded-2xl bg-brand-primary-strong text-white font-bold text-sm shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? 'Saving Profile...' : 'Save & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-ink-muted">Loading profile setup...</div>}>
      <OnboardingForm />
    </Suspense>
  );
}
