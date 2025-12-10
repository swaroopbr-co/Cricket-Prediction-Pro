'use client';

import { useActionState, Suspense } from 'react';
import { login } from '@/actions/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
    const [state, action, isPending] = useActionState(login, undefined);
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
            <div className="glass w-full max-w-md rounded-2xl p-8">
                <h1 className="heading-gradient mb-6 text-center text-3xl font-bold">
                    Cricket Predictor Pro
                </h1>
                <h2 className="mb-6 text-center text-xl text-[var(--foreground)]">Login</h2>

                {message && (
                    <div className="mb-4 rounded bg-green-900/50 p-2 text-center text-sm text-green-200">
                        {message}
                    </div>
                )}

                {state?.error && (
                    <div className="mb-4 rounded bg-red-900/50 p-2 text-center text-sm text-red-200">
                        {state.error}
                    </div>
                )}

                <form action={action} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-lg bg-[var(--surface)] p-3 text-[var(--foreground)] border border-[var(--glass-border)] focus:border-[var(--primary)] focus:outline-none"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full rounded-lg bg-[var(--surface)] p-3 text-[var(--foreground)] border border-[var(--glass-border)] focus:border-[var(--primary)] focus:outline-none"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-[var(--primary)] p-3 font-bold text-black transition hover:bg-[var(--primary-variant)] hover:text-white disabled:opacity-50"
                    >
                        {isPending ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-[var(--primary)] hover:underline">
                        Sign up
                    </Link>
                </p>

                <div className="mt-6 border-t border-[var(--glass-border)] pt-4 text-center">
                    <p className="mb-2 text-xs text-gray-500">Developer Access</p>
                    <button
                        type="button"
                        onClick={(e) => {
                            const form = e.currentTarget.closest('form') || document.querySelector('form');
                            if (form) {
                                const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
                                const passInput = form.querySelector('input[name="password"]') as HTMLInputElement;
                                if (emailInput) emailInput.value = 'swaroopbr.co@gmail.com';
                                if (passInput) passInput.value = 'Me@admin04';
                            }
                        }}
                        className="text-xs text-[var(--secondary)] underline hover:text-white"
                    >
                        Auto-fill Admin Credentials
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
