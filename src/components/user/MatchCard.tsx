'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { PredictionModal } from './PredictionModal';
import { CountdownTimer } from '../ui/CountdownTimer';

export function MatchCard({ match, userPrediction }: { match: any, userPrediction: any }) {
    const [showModal, setShowModal] = useState(false);

    const isCompleted = match.status === 'COMPLETED';
    const isLive = match.status === 'LIVE';

    // Check if user has predicted
    const hasPredicted = userPrediction?.matchPick || userPrediction?.tossPick;

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(true)}
                className="group cursor-pointer relative overflow-hidden rounded-2xl border border-white/5 bg-[#1a1b1f] hover:border-[var(--primary)]/50 hover:bg-[#1f2024] transition-all shadow-lg"
            >
                {/* Minimal Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{match.tournament.name}</span>
                    <span className={clsx(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        isLive ? "bg-red-500 text-white animate-pulse" :
                            isCompleted ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                    )}>
                        {match.status}
                    </span>
                </div>

                {/* Teams Layout */}
                <div className="p-6 flex items-center justify-between relative z-10">
                    <div className="flex-1 text-center">
                        <span className="block text-xl md:text-2xl font-black text-white">{match.teamA}</span>
                    </div>

                    <div className="px-4 flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-600 mb-1">VS</span>
                        <div className="h-8 w-1 bg-white/5 rounded-full"></div>
                    </div>

                    <div className="flex-1 text-center">
                        <span className="block text-xl md:text-2xl font-black text-white">{match.teamB}</span>
                    </div>
                </div>

                {/* Footer / Call to Action */}
                <div className="px-4 py-3 bg-black/20 flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {isCompleted ? (
                            <span>{new Date(match.date).toLocaleDateString()}</span>
                        ) : (
                            // Target date for voting close is 1.5 hours before match time
                            <CountdownTimer targetDate={new Date(new Date(match.date).getTime() - 1.5 * 60 * 60 * 1000)} />
                        )}
                    </span>

                    {hasPredicted ? (
                        <span className="flex items-center gap-1 text-[var(--primary)] font-bold">
                            <CheckCircle2 size={12} />
                            Predicted
                        </span>
                    ) : (
                        <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Predict Now <ChevronRight size={12} />
                        </span>
                    )}
                </div>

                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none" />
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <PredictionModal
                        match={match}
                        userPrediction={userPrediction}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
