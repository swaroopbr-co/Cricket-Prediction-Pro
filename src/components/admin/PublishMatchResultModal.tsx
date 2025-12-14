'use client';

import { updateMatch } from '@/actions/admin';
import { useTransition, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface PublishMatchResultModalProps {
    match: {
        id: string;
        tournamentId: string;
        number: number | null;
        date: Date;
        status: string;
        teamA: string;
        teamB: string;
        tossWinner?: string | null;
        matchWinner?: string | null;
        result?: string | null;
    };
}

export function PublishMatchResultModal({ match }: PublishMatchResultModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                title="Publish Result"
            >
                <Trophy size={12} />
                {match.matchWinner ? 'Edit Result' : 'Publish Result'}
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Publish Match Result">
                <div className="mb-4 p-3 bg-white/5 rounded text-sm text-center">
                    <span className="text-[var(--primary)] font-bold">{match.teamA}</span> vs <span className="text-[var(--secondary)] font-bold">{match.teamB}</span>
                </div>

                <form
                    action={(formData) => {
                        startTransition(async () => {
                            await updateMatch(
                                match.id,
                                {
                                    tournamentId: match.tournamentId,
                                    number: match.number || 0,
                                    teamA: match.teamA,
                                    teamB: match.teamB,
                                    date: match.date.toISOString(),
                                    status: 'COMPLETED', // Auto-set status to completed
                                    tossWinner: formData.get('tossWinner') as string,
                                    matchWinner: formData.get('matchWinner') as string,
                                    result: formData.get('result') as string,
                                }
                            );
                            setIsOpen(false);
                        });
                    }}
                    className="space-y-4"
                >
                    {/* Toss Winner */}
                    <div>
                        <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Toss Winner</label>
                        <select
                            name="tossWinner"
                            defaultValue={match.tossWinner || ''}
                            className="w-full p-3 rounded bg-[var(--surface)] border border-white/10 text-white"
                        >
                            <option value="">Select Toss Winner</option>
                            <option value={match.teamA}>{match.teamA}</option>
                            <option value={match.teamB}>{match.teamB}</option>
                        </select>
                    </div>

                    {/* Match Winner */}
                    <div>
                        <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Match Winner</label>
                        <select
                            name="matchWinner"
                            defaultValue={match.matchWinner || ''}
                            required
                            className="w-full p-3 rounded bg-[var(--surface)] border border-white/10 text-white"
                        >
                            <option value="">Select Match Winner</option>
                            <option value={match.teamA}>{match.teamA}</option>
                            <option value={match.teamB}>{match.teamB}</option>
                            <option value="DRAW">DRAW / TIE / NO RESULT</option>
                        </select>
                    </div>

                    {/* Result Description */}
                    <div>
                        <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Result Description</label>
                        <input
                            name="result"
                            defaultValue={match.result || ''}
                            placeholder="e.g. MI won by 14 runs"
                            className="w-full p-3 rounded bg-[var(--surface)] border border-white/10 text-white"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                        <button disabled={isPending} type="submit" className="btn-primary bg-green-600 hover:bg-green-500 px-6 py-2">
                            {isPending ? 'Publishing...' : 'Publish Result'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
