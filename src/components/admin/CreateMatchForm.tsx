'use client';

import { createMatch } from '@/actions/match';
import { useTransition, useRef, useState, useMemo } from 'react';

type Team = {
    id: string;
    name: string;
}

type Tournament = {
    id: string;
    name: string;
    type: string;
    teams: Team[];
}

export function CreateMatchForm({ tournaments }: { tournaments: Tournament[] }) {
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedTournamentId, setSelectedTournamentId] = useState('');

    const selectedTournament = useMemo(() =>
        tournaments.find(t => t.id === selectedTournamentId),
        [tournaments, selectedTournamentId]);

    const activeTeams = selectedTournament?.teams || [];

    return (
        <div className="glass p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-4">Create Match</h2>
            <form
                ref={formRef}
                action={(formData) => {
                    startTransition(() => {
                        createMatch(selectedTournamentId, formData);
                        formRef.current?.reset();
                        // Optional: Reset selection? No, might want to add multiple matches.
                    });
                }}
                className="grid grid-cols-2 gap-4"
            >
                <select
                    name="tournamentId"
                    className="col-span-2 p-3 rounded bg-[var(--surface)] border border-white/10"
                    value={selectedTournamentId}
                    onChange={(e) => setSelectedTournamentId(e.target.value)}
                    required
                >
                    <option value="">Select Tournament</option>
                    {tournaments.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                    ))}
                </select>

                <input type="number" name="number" placeholder="Match No (e.g. 1)" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />

                <div className="flex flex-col">
                    <label className="text-xs text-gray-400 mb-1">Match Date & Time</label>
                    <input type="datetime-local" name="date" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />
                </div>

                {/* Team Selection or Text Input Fallback if no teams */}
                {activeTeams.length >= 2 ? (
                    <>
                        <select name="teamA" className="p-3 rounded bg-[var(--surface)] border border-white/10" required>
                            <option value="">Select Team A</option>
                            {activeTeams.map(team => (
                                <option key={team.id} value={team.name}>{team.name}</option>
                            ))}
                        </select>
                        <select name="teamB" className="p-3 rounded bg-[var(--surface)] border border-white/10" required>
                            <option value="">Select Team B</option>
                            {activeTeams.map(team => (
                                <option key={team.id} value={team.name}>{team.name}</option>
                            ))}
                        </select>
                    </>
                ) : (
                    <>
                        <input name="teamA" placeholder="Team A (e.g. MI)" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />
                        <input name="teamB" placeholder="Team B (e.g. CSK)" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    </>
                )}

                <button disabled={isPending} className="col-span-2 btn-primary">
                    {isPending ? 'Creating...' : 'Create Match'}
                </button>
            </form>
        </div>
    );
}
