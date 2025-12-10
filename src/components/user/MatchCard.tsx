'use client';

import { makePrediction } from '@/actions/prediction';
import { useTransition, useState } from 'react';

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

    return (
        <div className="glass relative rounded-xl p-6 transition hover:bg-[var(--glass-bg)]">
            <div className="absolute right-4 top-4">
                {isCompleted ? (
                    <span className="rounded bg-green-900/40 px-2 py-1 text-xs text-green-300">
                        {userPrediction?.points || 0} pts
                    </span>
                ) : isLocked ? (
                    <span className="rounded bg-red-900/40 px-2 py-1 text-xs text-red-300">Locked</span>
                ) : (
                    <span className="rounded bg-blue-900/40 px-2 py-1 text-xs text-blue-300">Open</span>
                )}
            </div>

            <h3 className="mb-1 text-sm text-[var(--secondary)]">{match.tournament.name}</h3>
            <div className="mb-4 flex items-center justify-between text-lg font-bold">
                <span>{match.teamA}</span>
                <span className="text-sm font-normal text-gray-400">vs</span>
                <span>{match.teamB}</span>
            </div>

            <p className="mb-4 text-xs text-gray-500">
                Match: {new Date(match.date).toLocaleString()} <br />
                Lock: {lockTime.toLocaleString()}
            </p>

            {isLocked || isCompleted ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded bg-[var(--surface)] p-2">
                        <p className="text-xs text-gray-400">Your Toss Pick</p>
                        <p>{userPrediction?.tossPick || 'None'}</p>
                    </div>
                    <div className="rounded bg-[var(--surface)] p-2">
                        <p className="text-xs text-gray-400">Your Match Pick</p>
                        <p>{userPrediction?.matchPick || 'None'}</p>
                    </div>
                    {match.tossWinner && (
                        <div className="col-span-2 rounded border border-[var(--glass-border)] p-2 text-center text-xs">
                            Result: Toss won by {match.tossWinner}, Match won by {match.matchWinner}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-400">Predict Toss Winner (10pts)</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTossPick(match.teamA)}
                                className={`flex-1 rounded py-2 text-sm transition ${tossPick === match.teamA ? 'bg-[var(--primary)] text-black font-bold' : 'bg-[var(--surface)] hover:bg-white/10'}`}
                            >
                                {match.teamA}
                            </button>
                            <button
                                onClick={() => setTossPick(match.teamB)}
                                className={`flex-1 rounded py-2 text-sm transition ${tossPick === match.teamB ? 'bg-[var(--primary)] text-black font-bold' : 'bg-[var(--surface)] hover:bg-white/10'}`}
                            >
                                {match.teamB}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-400">Predict Match Winner (20pts)</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMatchPick(match.teamA)}
                                className={`flex-1 rounded py-2 text-sm transition ${matchPick === match.teamA ? 'bg-[var(--secondary)] text-black font-bold' : 'bg-[var(--surface)] hover:bg-white/10'}`}
                            >
                                {match.teamA}
                            </button>
                            <button
                                onClick={() => setMatchPick('DRAW')}
                                className={`w-16 rounded py-2 text-sm transition ${matchPick === 'DRAW' ? 'bg-[var(--secondary)] text-black font-bold' : 'bg-[var(--surface)] hover:bg-white/10'}`}
                            >
                                Draw
                            </button>
                            <button
                                onClick={() => setMatchPick(match.teamB)}
                                className={`flex-1 rounded py-2 text-sm transition ${matchPick === match.teamB ? 'bg-[var(--secondary)] text-black font-bold' : 'bg-[var(--surface)] hover:bg-white/10'}`}
                            >
                                {match.teamB}
                            </button>
                        </div>
                    </div>

                    {hasChanged && (
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="w-full rounded bg-green-600 p-2 font-bold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {isPending ? 'Saving...' : 'Save Prediction'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
