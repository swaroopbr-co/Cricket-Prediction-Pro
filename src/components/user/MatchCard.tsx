'use client';

import { makePrediction } from '@/actions/prediction';
import { useTransition, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle2, Lock } from 'lucide-react';
import clsx from 'clsx';

export function MatchCard({ match, userPrediction }: { match: any, userPrediction: any }) {
    const [isPending, startTransition] = useTransition();
    const [tossPick, setTossPick] = useState(userPrediction?.tossPick || '');
    const [matchPick, setMatchPick] = useState(userPrediction?.matchPick || '');

    // Lock logic: 2.5h before match
    const lockTime = new Date(new Date(match.date).getTime() - (2.5 * 60 * 60 * 1000));
    const isLocked = new Date() > lockTime;
    const isCompleted = match.status === 'COMPLETED';

    const handleSave = () => {
        startTransition(() => {
            makePrediction(match.id, tossPick, matchPick)
                .catch(err => alert(err.message));
        });
    };

    const hasChanged = tossPick !== (userPrediction?.tossPick || '') || matchPick !== (userPrediction?.matchPick || '');

    const TeamButton = ({ team, type, currentPick, setPick }: { team: string, type: 'Toss' | 'Match', currentPick: string, setPick: (t: string) => void }) => {
        const isSelected = currentPick === team;
        return (
            <motion.button
                whileHover={{ scale: isLocked ? 1 : 1.02 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                onClick={() => !isLocked && setPick(team)}
                disabled={isLocked}
                className={clsx(
                    "relative flex-1 overflow-hidden rounded-xl p-4 text-center transition-all border",
                    isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                        : "border-white/5 bg-white/5 hover:bg-white/10",
                    isLocked && "opacity-50 cursor-not-allowed"
                )}
            >
                <div className="relative z-10 font-bold uppercase tracking-wider text-sm md:text-base">
                    {team}
                </div>
                {isSelected && (
                    <motion.div
                        layoutId={`highlight-${type}-${match.id}`}
                        className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-[var(--primary)]/10 to-transparent"
                    />
                )}
            </motion.button>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl transition hover:border-[var(--primary)]/30"
        >
            {/* Status Header */}
            <div className="flex items-center justify-between bg-white/5 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    <Trophy className="h-4 w-4 text-[var(--secondary)]" />
                    <span>{match.tournament.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isCompleted ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                    ) : isLocked ? (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">
                            <Lock className="h-3 w-3" /> Locked
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400">
                            <Clock className="h-3 w-3" /> Open
                        </span>
                    )}
                </div>
            </div>

            {/* Match Center */}
            <div className="flex flex-col items-center p-8">
                <div className="flex w-full items-center justify-between text-2xl font-black uppercase md:text-4xl">
                    <span className="text-white">{match.teamA}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-sm font-bold text-black shadow-lg shadow-[var(--primary)]/20">
                        VS
                    </div>
                    <span className="text-white">{match.teamB}</span>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    {new Date(match.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                {isCompleted && match.matchWinner && (
                    <p className="mt-2 text-sm text-[var(--secondary)] font-bold">
                        Winner: {match.matchWinner}
                    </p>
                )}
            </div>

            {/* Voting Section */}
            <div className="border-t border-white/5 bg-black/20 p-6">
                <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-300">Toss Winner</h4>
                        <span className="text-xs text-[var(--primary)]">+10 Pts</span>
                    </div>
                    <div className="flex gap-4">
                        <TeamButton team={match.teamA} type="Toss" currentPick={tossPick} setPick={setTossPick} />
                        <TeamButton team={match.teamB} type="Toss" currentPick={tossPick} setPick={setTossPick} />
                    </div>
                </div>

                <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-300">Match Winner</h4>
                        <span className="text-xs text-[var(--secondary)]">+20 Pts</span>
                    </div>
                    <div className="flex gap-4">
                        <TeamButton team={match.teamA} type="Match" currentPick={matchPick} setPick={setMatchPick} />
                        <motion.button
                            whileHover={{ scale: isLocked ? 1 : 1.05 }}
                            whileTap={{ scale: isLocked ? 1 : 0.95 }}
                            onClick={() => !isLocked && setMatchPick('DRAW')}
                            disabled={isLocked}
                            className={clsx(
                                "w-20 rounded-xl border text-sm font-bold transition-all",
                                matchPick === 'DRAW'
                                    ? "border-[var(--secondary)] bg-[var(--secondary)]/10 text-[var(--secondary)]"
                                    : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10"
                            )}
                        >
                            DRAW
                        </motion.button>
                        <TeamButton team={match.teamB} type="Match" currentPick={matchPick} setPick={setMatchPick} />
                    </div>
                </div>

                {hasChanged && !isLocked && (
                    <motion.button
                        layout
                        onClick={handleSave}
                        disabled={isPending}
                        className="w-full rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-3 font-bold text-black shadow-lg transition hover:shadow-[var(--primary)]/20 disabled:opacity-50"
                    >
                        {isPending ? 'Saving Prediction...' : 'Save Prediction'}
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
