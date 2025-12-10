'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Trophy, Users, Zap } from 'lucide-react';

export default function HomeContent() {
    return (
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
            {/* Background Decor */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-[var(--primary)] opacity-20 blur-[100px]" />
                <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-[var(--secondary)] opacity-20 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass relative max-w-5xl overflow-hidden rounded-3xl p-8 text-center md:p-16"
            >
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-6 flex justify-center"
                >
                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-wider text-[var(--secondary)] backdrop-blur-md">
                        The Future of Cricket Prediction
                    </span>
                </motion.div>

                <h1 className="mb-6 text-6xl font-extrabold tracking-tight md:text-8xl">
                    <span className="block text-white">Predict.</span>
                    <span className="text-gradient block">Compete. Win.</span>
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl">
                    Join the most advanced prediction platform. Analyze stats, predict match outcomes, and climb the global leaderboard.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <Link href="/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary flex items-center gap-2"
                        >
                            Start Playing <ArrowRight className="h-5 w-5" />
                        </motion.button>
                    </Link>
                    <Link href="/signup">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-secondary"
                        >
                            Create Account
                        </motion.button>
                    </Link>
                </div>

                {/* Feature Grid */}
                <div className="mt-16 grid gap-8 text-left md:grid-cols-3">
                    <div className="group rounded-xl border border-white/5 bg-white/5 p-6 transition hover:bg-white/10">
                        <Trophy className="mb-4 h-8 w-8 text-[var(--secondary)]" />
                        <h3 className="mb-2 text-lg font-bold text-white">Global Leagues</h3>
                        <p className="text-sm text-gray-400">Compete against thousands of players worldwide for the championship title.</p>
                    </div>
                    <div className="group rounded-xl border border-white/5 bg-white/5 p-6 transition hover:bg-white/10">
                        <Zap className="mb-4 h-8 w-8 text-[var(--accent)]" />
                        <h3 className="mb-2 text-lg font-bold text-white">Live Scoring</h3>
                        <p className="text-sm text-gray-400">Real-time updates and instant point calculations as the match unfolds.</p>
                    </div>
                    <div className="group rounded-xl border border-white/5 bg-white/5 p-6 transition hover:bg-white/10">
                        <Users className="mb-4 h-8 w-8 text-[var(--primary)]" />
                        <h3 className="mb-2 text-lg font-bold text-white">Private Rooms</h3>
                        <p className="text-sm text-gray-400">Create private leagues to challenge your friends and family.</p>
                    </div>
                </div>
            </motion.div>

            <footer className="mt-12 text-sm text-gray-500">
                &copy; {new Date().getFullYear()} SBR.Co. All rights reserved.
            </footer>
        </div>
    );
}
