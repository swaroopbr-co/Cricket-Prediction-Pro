'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Clock, Lock } from 'lucide-react';
import clsx from 'clsx';
import { makePrediction } from '@/actions/prediction';

export function PredictionModal({ match, userPrediction, onClose }: { match: any, userPrediction: any, onClose: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [tossPick, setTossPick] = useState(userPrediction?.tossPick || '');
    const [matchPick, setMatchPick] = useState(userPrediction?.matchPick || '');

    // Lock logic: 2.5h before match
    const lockTime = new Date(new Date(match.date).getTime() - (2.5 * 60 * 60 * 1000));
    const isLocked = new Date() > lockTime;

    const handleSave = () => {
        startTransition(() => {
            makePrediction(match.id, tossPick, matchPick)
                .then(() => onClose())
                .catch(err => alert(err.message));
        });
    };

    const TeamButton = ({ team, type, currentPick, setPick }: { team: string, type: 'Toss' | 'Match', currentPick: string, setPick: (t: string) => void }) => {
        const isSelected = currentPick === team;
        return (
            <button
                onClick={() => !isLocked && setPick(team)}
                disabled={isLocked}
                className={clsx(
                    "relative flex-1 rounded-xl p-4 text-center transition-all border",
                    isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                        : "border-white/5 bg-white/5 hover:bg-white/10 text-gray-400",
                    isLocked && "opacity-50 cursor-not-allowed"
                )}
            >
                {team}
            </button>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0f1014] shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 p-4 bg-white/5">
                    <div>
                        <h3 className="font-bold text-white pr-8">{match.tournament.name}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            {new Date(match.date).toLocaleString()}
                            {isLocked && <span className="text-red-400 flex items-center gap-1 ml-2"><Lock size={10} /> Locked</span>}
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 text-gray-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Teams Display */}
                    <div className="flex items-center justify-between text-2xl font-black uppercase">
                        <span className="text-white w-1/3 text-center">{match.teamA}</span>
                        <div className="text-[var(--primary)] text-sm font-bold bg-[var(--primary)]/10 px-3 py-1 rounded-full">VS</div>
                        <span className="text-white w-1/3 text-center">{match.teamB}</span>
                    </div>

                    {/* Toss Prediction */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-300">Predict Toss Winner</h4>
                            <span className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded">+10 Pts</span>
                        </div>
                        <div className="flex gap-4">
                            <TeamButton team={match.teamA} type="Toss" currentPick={tossPick} setPick={setTossPick} />
                            <TeamButton team={match.teamB} type="Toss" currentPick={tossPick} setPick={setTossPick} />
                        </div>
                    </div>

                    {/* Match Prediction */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-300">Predict Match Winner</h4>
                            <span className="text-xs text-[var(--secondary)] bg-[var(--secondary)]/10 px-2 py-0.5 rounded">+20 Pts</span>
                        </div>
                        <div className="flex gap-4">
                            <TeamButton team={match.teamA} type="Match" currentPick={matchPick} setPick={setMatchPick} />
                            <TeamButton team={match.teamB} type="Match" currentPick={matchPick} setPick={setMatchPick} />
                        </div>
                    </div>

                    {/* Action Button */}
                    {!isLocked && (
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="w-full rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-4 font-bold text-black shadow-lg transition hover:shadow-[var(--primary)]/20 disabled:opacity-50"
                        >
                            {isPending ? 'Saving...' : 'Submit Predictions'}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
