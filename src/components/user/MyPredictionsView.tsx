'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PredictionModal } from './PredictionModal';

type Prediction = {
    id: string;
    tossPick?: string;
    matchPick?: string;
    points: number;
    match: {
        id: string;
        date: Date;
        teamA: string;
        teamB: string;
        status: string;
        tossWinner?: string;
        matchWinner?: string;
        tournament: {
            name: string;
        }
    }
}

export function MyPredictionsView({ initialPredictions }: { initialPredictions: any[] }) {
    const [sort, setSort] = useState('DATE_DESC');
    const [editingPrediction, setEditingPrediction] = useState<Prediction | null>(null);

    const sortedPredictions = useMemo(() => {
        // Filter out predictions without a match (e.g. tournament predictions) to prevent sorting errors
        const sorted = initialPredictions.filter((p: any) => p.match).slice();
        switch (sort) {
            case 'DATE_DESC':
                return sorted.sort((a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime());
            case 'DATE_ASC':
                return sorted.sort((a, b) => new Date(a.match.date).getTime() - new Date(b.match.date).getTime());
            case 'POINTS_DESC':
                return sorted.sort((a, b) => b.points - a.points);
            default:
                return sorted;
        }
    }, [initialPredictions, sort]);

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <h1 className="heading-gradient text-2xl font-bold">My Predictions</h1>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded bg-[var(--surface)] p-2 text-sm border border-white/10"
                >
                    <option value="DATE_DESC">Newest First</option>
                    <option value="DATE_ASC">Oldest First</option>
                    <option value="POINTS_DESC">High Points</option>
                </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedPredictions.map((p: any) => {
                    // Filter out tournament winner predictions (where match is null)
                    if (!p.match) return null;

                    const isCorrectToss = p.match.tossWinner === p.tossPick;
                    const isCorrectMatch = p.match.matchWinner === p.matchPick;
                    const isCompleted = p.match.status === 'COMPLETED';

                    // Lock logic check for Edit button
                    const lockTime = new Date(new Date(p.match.date).getTime() - (2.5 * 60 * 60 * 1000));
                    const isLocked = new Date() > lockTime;

                    return (
                        <div key={p.id} className="relative overflow-hidden rounded-xl border border-white/5 bg-[#1a1b1f] p-6 shadow-lg group">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500">{p.match.tournament.name}</span>
                                <span className="text-xs text-gray-400">{new Date(p.match.date).toLocaleDateString()}</span>
                            </div>

                            <div className="mb-6 text-center">
                                <div className="flex items-center justify-center gap-3 text-lg font-bold text-white">
                                    <span>{p.match.teamA}</span>
                                    <span className="text-[var(--primary)]">VS</span>
                                    <span>{p.match.teamB}</span>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                                    <span className="text-gray-400">Your Toss Pick:</span>
                                    <span className={`font-bold ${isCompleted && p.match.tossWinner ? (isCorrectToss ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
                                        {p.tossPick || '-'}
                                        {isCompleted && p.match.tossWinner && (isCorrectToss ? ' (+10)' : ' (0)')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                                    <span className="text-gray-400">Your Match Pick:</span>
                                    <span className={`font-bold ${isCompleted && p.match.matchWinner ? (isCorrectMatch ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
                                        {p.matchPick || '-'}
                                        {isCompleted && p.match.matchWinner && (isCorrectMatch ? ' (+20)' : ' (0)')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between border-t border-white/5 pt-4">
                                <span className="text-gray-400">Points Earned:</span>
                                <span className="font-bold text-[var(--primary)] text-lg">{p.points}</span>
                            </div>

                            {/* Edit Button moved to footer */}
                            {!isLocked && !isCompleted && (
                                <button
                                    onClick={() => setEditingPrediction(p)}
                                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                    Refine Vote
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {sortedPredictions.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                    You haven't made any predictions yet.
                </div>
            )}

            <AnimatePresence>
                {editingPrediction && (
                    <PredictionModal
                        match={editingPrediction.match}
                        userPrediction={editingPrediction}
                        onClose={() => setEditingPrediction(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
