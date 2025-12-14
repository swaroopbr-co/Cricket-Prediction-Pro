'use client';

import { predictTournamentWinner, requestTournamentRevote } from '@/actions/prediction';
import { useTransition, useState } from 'react';
import clsx from 'clsx';
import { Trophy, Lock } from 'lucide-react';

export function TournamentPredictionCard({ tournament, userPrediction }: { tournament: any, userPrediction: any }) {
    const [isPending, startTransition] = useTransition();
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    const hasPredicted = !!userPrediction;
    const isLocked = hasPredicted; // One-time voting

    const handleVote = () => {
        if (!selectedTeam) return;
        startTransition(() => {
            predictTournamentWinner(tournament.id, selectedTeam)
                .catch(err => alert(err.message));
        });
    };

    const handleRevoteRequest = () => {
        if (!confirm('Request admin to unlock your vote?')) return;
        startTransition(() => {
            requestTournamentRevote(tournament.id)
                .then(() => alert('Request sent to admin.'))
                .catch(err => alert(err.message));
        });
    };

    return (
        <div className="glass p-6 rounded-xl relative overflow-hidden group">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="text-yellow-400" size={20} />
                        {tournament.name} Winner
                    </h3>
                    {hasPredicted && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex items-center gap-1">
                            <Lock size={10} /> Vote Locked
                        </span>
                    )}
                </div>

                <p className="text-gray-400 text-sm mb-4">
                    Who will win the {tournament.type} tournament? Vote now! (One-time only)
                </p>

                {hasPredicted ? (
                    <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-sm mb-2">You voted for</p>
                        <div className="text-3xl font-black text-[var(--primary)] mb-2">
                            {userPrediction.matchPick}
                        </div>
                        <button
                            onClick={handleRevoteRequest}
                            disabled={isPending}
                            className="text-xs text-red-400 hover:text-red-300 underline"
                        >
                            Request Change (Revote)
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {tournament.teams.map((team: any) => (
                                <button
                                    key={team.id}
                                    onClick={() => setSelectedTeam(team.name)}
                                    className={clsx(
                                        "p-2 rounded border text-sm transition-all",
                                        selectedTeam === team.name
                                            ? "border-[var(--primary)] bg-[var(--primary)]/10 text-white font-bold"
                                            : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10"
                                    )}
                                >
                                    {team.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleVote}
                            disabled={!selectedTeam || isPending}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Submitting...' : 'Confirm Vote'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
