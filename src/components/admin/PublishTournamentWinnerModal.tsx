'use client';

import { publishTournamentWinner } from '@/actions/admin';
import { useTransition, useState } from 'react';
import { Trophy } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface PublishTournamentWinnerModalProps {
    tournament: {
        id: string;
        name: string;
        teams: { name: string }[];
    };
}

export function PublishTournamentWinnerModal({ tournament }: PublishTournamentWinnerModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1 transition-colors"
            >
                <Trophy size={12} />
                Publish Winner
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Publish Tournament Winner">
                <div className="mb-6 p-4 bg-white/5 rounded-lg text-center border border-white/10">
                    <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Tournament</p>
                    <h3 className="text-xl font-bold text-[var(--primary)]">{tournament.name}</h3>
                </div>

                <form
                    action={(formData) => {
                        startTransition(async () => {
                            await publishTournamentWinner(tournament.id, formData.get('winner') as string);
                            setIsOpen(false);
                        });
                    }}
                    className="space-y-6"
                >
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Select Champion Team</label>
                        <select
                            name="winner"
                            required
                            className="w-full p-3 rounded-lg bg-[var(--surface)] border border-white/10 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        >
                            <option value="">-- Select Winner --</option>
                            {tournament.teams.map(team => (
                                <option key={team.name} value={team.name}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isPending}
                            type="submit"
                            className="btn-primary bg-green-600 hover:bg-green-500 px-6 py-2 shadow-lg shadow-green-900/20"
                        >
                            {isPending ? 'Publishing...' : 'Confirm Winner 🏆'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
