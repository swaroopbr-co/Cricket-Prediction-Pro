'use client';

import { useActionState } from 'react';
import { signup } from '@/actions/auth';
import Link from 'next/link';

export default function SignupPage() {
    const [state, action, isPending] = useActionState(signup, undefined);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
            <div className="glass w-full max-w-md rounded-2xl p-8">
                <h1 className="heading-gradient mb-6 text-center text-3xl font-bold">
                    Cricket Predictor Pro
                </h1>
                <h2 className="mb-6 text-center text-xl text-[var(--foreground)]">Create Account</h2>

                {state?.error && (
                    <div className="mb-4 rounded bg-red-900/50 p-2 text-center text-sm text-red-200">
                        {state.error}
                    </div>
                )}

                <form action={action} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Username</label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full rounded-lg bg-[var(--surface)] p-3 text-[var(--foreground)] border border-[var(--glass-border)] focus:border-[var(--primary)] focus:outline-none"
                            placeholder="Choose a unique username"
                        />
                    </div>
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
                            placeholder="Create a password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-[var(--primary)] p-3 font-bold text-black transition hover:bg-[var(--primary-variant)] hover:text-white disabled:opacity-50"
                    >
                        {isPending ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[var(--primary)] hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
