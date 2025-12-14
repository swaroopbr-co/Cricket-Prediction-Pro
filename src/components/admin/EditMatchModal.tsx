'use client';

import { updateMatch } from '@/actions/admin';
import { useTransition, useState } from 'react';
import { Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface EditMatchModalProps {
    match: {
        id: string;
        tournamentId: string;
        number: number | null;
        date: Date;
        status: string;
        teamA: string;
        teamB: string;
        tournament: {
            teams: { name: string }[];
        };
    };
    tournaments: { id: string; name: string }[];
}

export function EditMatchModal({ match, tournaments }: EditMatchModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const activeTeams = match.tournament.teams || [];

    const formatDate = (date: Date) => {
        const isoString = new Date(date).toISOString();
        return isoString.substring(0, 16);
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="text-blue-400 hover:text-blue-200" title="Edit Match">
                <Edit size={14} />
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Match">
                <form
                    action={(formData) => {
                        startTransition(async () => {
                            await updateMatch(
                                match.id,
                                {
                                    tournamentId: formData.get('tournamentId') as string,
                                    number: parseInt(formData.get('number') as string) || 0,
                                    teamA: formData.get('teamA') as string,
                                    teamB: formData.get('teamB') as string,
                                    date: formData.get('date') as string,
                                    status: formData.get('status') as string,
                                }
                            );
                            setIsOpen(false);
                        });
                    }}
                    className="space-y-4"
                >
                    <select
                        name="tournamentId"
                        defaultValue={match.tournamentId}
                        className="w-full p-2 rounded bg-[var(--surface)] border border-white/10"
                    >
                        {tournaments.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        name="number"
                        defaultValue={match.number || ''}
                        placeholder="Match No (e.g. 1)"
                        className="w-full p-2 rounded bg-[var(--surface)] border border-white/10"
                        required
                    />

                    <div>
                        <label className="text-xs text-gray-400 mb-1">Match Date & Time (UTC)</label>
                        <input
                            type="datetime-local"
                            name="date"
                            defaultValue={formatDate(match.date)}
                            className="w-full p-2 rounded bg-[var(--surface)] border border-white/10"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            name="teamA"
                            defaultValue={match.teamA}
                            className="p-2 rounded bg-[var(--surface)] border border-white/10"
                            required
                        >
                            {activeTeams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                            {!activeTeams.find(t => t.name === match.teamA) && <option value={match.teamA}>{match.teamA}</option>}
                        </select>

                        <select
                            name="teamB"
                            defaultValue={match.teamB}
                            className="p-2 rounded bg-[var(--surface)] border border-white/10"
                            required
                        >
                            {activeTeams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                            {!activeTeams.find(t => t.name === match.teamB) && <option value={match.teamB}>{match.teamB}</option>}
                        </select>
                    </div>

                    <select
                        name="status"
                        defaultValue={match.status}
                        className="w-full p-2 rounded bg-[var(--surface)] border border-white/10"
                    >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="LIVE">LIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="ABANDONED">ABANDONED</option>
                    </select>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                        <button disabled={isPending} type="submit" className="btn-primary px-6 py-2">
                            {isPending ? 'Updating...' : 'Update Match'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
