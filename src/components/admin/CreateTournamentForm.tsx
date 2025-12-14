'use client';

import { createTournament } from '@/actions/admin';
import { useTransition, useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';

export function CreateTournamentForm() {
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
    const [teamInput, setTeamInput] = useState('');
    const [teams, setTeams] = useState<string[]>([]);

    const addTeam = () => {
        const trimmed = teamInput.trim();
        if (trimmed && !teams.includes(trimmed)) {
            setTeams([...teams, trimmed]);
            setTeamInput('');
        }
    };

    const removeTeam = (name: string) => {
        setTeams(teams.filter(t => t !== name));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTeam();
        }
    };

    return (
        <form
            ref={formRef}
            action={() => {
                const formData = new FormData(formRef.current!);
                if (teams.length < 2) {
                    alert('Please add at least 2 teams');
                    return;
                }
                startTransition(async () => {
                    await createTournament(
                        formData.get('name') as string,
                        formData.get('type') as string,
                        formData.get('format') as string,
                        formData.get('startDate') as string,
                        formData.get('endDate') as string,
                        teams
                    );
                    formRef.current?.reset();
                    setTeams([]);
                });
            }}
            className="space-y-4"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="col-span-2">
                    <h2 className="text-lg font-bold mb-2">Create Tournament</h2>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Tournament Name</label>
                    <input name="name" required placeholder="e.g. IPL 2026" className="w-full rounded bg-[var(--surface)] p-2 border border-white/10" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Type</label>
                    <select name="type" className="w-full rounded bg-[var(--surface)] p-2 border border-white/10">
                        <option value="T20">T20</option>
                        <option value="ODI">ODI</option>
                        <option value="TEST">TEST</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Format</label>
                    <select name="format" className="w-full rounded bg-[var(--surface)] p-2 border border-white/10">
                        <option value="LEAGUE">League (IPL/BBL)</option>
                        <option value="BILATERAL">Bilateral Series</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Start Date</label>
                        <input type="date" name="startDate" required className="w-full rounded bg-[var(--surface)] p-2 border border-white/10" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">End Date</label>
                        <input type="date" name="endDate" required className="w-full rounded bg-[var(--surface)] p-2 border border-white/10" />
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="mb-2 block text-sm font-medium">Participating Teams</label>

                    <div className="flex gap-2 mb-2">
                        <input
                            value={teamInput}
                            onChange={(e) => setTeamInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter team name (e.g. Mumbai Indians)"
                            className="flex-1 rounded bg-[var(--surface)] p-2 border border-white/10"
                        />
                        <button type="button" onClick={addTeam} className="bg-white/10 hover:bg-white/20 p-2 rounded">
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 p-2 min-h-[60px] border border-white/10 rounded bg-black/20">
                        {teams.length === 0 && <span className="text-gray-500 text-sm p-1">No teams added yet.</span>}
                        {teams.map(team => (
                            <span key={team} className="inline-flex items-center gap-1 bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded text-sm border border-[var(--primary)]/20">
                                {team}
                                <button type="button" onClick={() => removeTeam(team)} className="hover:text-red-400">
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <button disabled={isPending} type="submit" className="w-full btn-primary">
                {isPending ? 'Creating Tournament...' : 'Create Tournament'}
            </button>
        </form>
    );
}
