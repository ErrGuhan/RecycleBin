'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/home';

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safe redirect sanitization (relative path only, no open redirect)
  const sanitizeRedirect = (url: string) => {
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    return '/home';
  };

  const safeNext = sanitizeRedirect(nextUrl);

  const handleGoogleSignIn = () => {
    // In production, triggers Supabase auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    // For demo/dev mode, simulate successful sign-in
    router.push(safeNext);
  };

  const handleEmailOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate OTP sent
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <BrandLogo href="/" />
        </div>
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">
          Sign In to Your Campus Account
        </h1>
        <p className="text-sm text-ink-muted">
          Log plastic drops, monitor verification batches, and earn official certificates.
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-line p-6 shadow-sm space-y-6">
        {/* Google Sign In (Primary) */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full min-h-[48px] px-4 rounded-xl border border-line bg-surface hover:bg-surface-alt font-semibold text-sm text-ink flex items-center justify-center gap-3 transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-brand-primary-strong"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-line w-full" />
          <span className="bg-surface px-3 text-xs text-ink-muted uppercase tracking-wider font-semibold">
            Or email one-time code
          </span>
        </div>

        {/* Email OTP Fallback */}
        {!submitted ? (
          <form onSubmit={handleEmailOtpSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-ink mb-1.5">
                Campus or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[46px] pl-10 pr-4 rounded-xl border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-strong"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] rounded-xl bg-brand-primary-strong text-white font-semibold text-sm hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Sending code...' : 'Send Login Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-950">Login Code Sent</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              We sent a 6-digit one-time code to <strong>{email}</strong>. Check your inbox or spam folder.
            </p>
            <button
              onClick={() => router.push(safeNext)}
              className="w-full min-h-[44px] rounded-lg bg-brand-primary-strong text-white font-semibold text-xs mt-2"
            >
              Continue to Portal (Demo Login)
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-ink-muted space-y-1">
        <p>By signing in, you agree to our</p>
        <div className="space-x-2 font-medium text-brand-primary-strong">
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">Privacy Notice</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-20 text-center text-xs text-ink-muted font-medium">
          Loading sign in portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
