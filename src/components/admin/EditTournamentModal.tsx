'use client';

import { updateTournament } from '@/actions/admin';
import { useTransition, useState } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface EditTournamentModalProps {
    tournament: {
        id: string;
        name: string;
        type: string;
        format: string;
        startDate: Date;
        endDate: Date;
        teams: { name: string }[];
    };
}

export function EditTournamentModal({ tournament }: EditTournamentModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [teamInput, setTeamInput] = useState('');
    const [teams, setTeams] = useState<string[]>(tournament.teams.map(t => t.name));

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
        <>
            <button onClick={() => setIsOpen(true)} className="bg-blue-900/40 hover:bg-blue-600 text-blue-200 px-3 py-2 rounded text-xs transition-colors" title="Edit Tournament">
                <Edit size={14} />
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Tournament">
                <form
                    action={(formData) => {
                        if (teams.length < 2) {
                            alert('Please add at least 2 teams');
                            return;
                        }
                        startTransition(async () => {
                            await updateTournament(
                                tournament.id,
                                {
                                    name: formData.get('name') as string,
                                    type: formData.get('type') as string,
                                    format: formData.get('format') as string,
                                    startDate: formData.get('startDate') as string,
                                    endDate: formData.get('endDate') as string,
                                    teamNames: teams
                                }
                            );
                            setIsOpen(false);
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Tournament Name</label>
                            <input
                                name="name"
                                defaultValue={tournament.name}
                                required
                                className="w-full rounded bg-[var(--surface)] p-2 border border-white/10"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Type</label>
                            <select name="type" defaultValue={tournament.type} className="w-full rounded bg-[var(--surface)] p-2 border border-white/10">
                                <option value="T20">T20</option>
                                <option value="ODI">ODI</option>
                                <option value="TEST">TEST</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Format</label>
                            <select name="format" defaultValue={tournament.format} className="w-full rounded bg-[var(--surface)] p-2 border border-white/10">
                                <option value="LEAGUE">League (IPL/BBL)</option>
                                <option value="BILATERAL">Bilateral Series</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    defaultValue={new Date(tournament.startDate).toISOString().split('T')[0]}
                                    required
                                    className="w-full rounded bg-[var(--surface)] p-2 border border-white/10"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    defaultValue={new Date(tournament.endDate).toISOString().split('T')[0]}
                                    required
                                    className="w-full rounded bg-[var(--surface)] p-2 border border-white/10"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="mb-2 block text-sm font-medium">Participating Teams</label>

                            <div className="flex gap-2 mb-2">
                                <input
                                    value={teamInput}
                                    onChange={(e) => setTeamInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter team name"
                                    className="flex-1 rounded bg-[var(--surface)] p-2 border border-white/10"
                                />
                                <button type="button" onClick={addTeam} className="bg-white/10 hover:bg-white/20 p-2 rounded">
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 p-2 min-h-[60px] border border-white/10 rounded bg-black/20">
                                {teams.length === 0 && <span className="text-gray-500 text-sm p-1">No teams added.</span>}
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

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                            Cancel
                        </button>
                        <button disabled={isPending} type="submit" className="btn-primary px-6 py-2">
                            {isPending ? 'Updating...' : 'Update Tournament'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
