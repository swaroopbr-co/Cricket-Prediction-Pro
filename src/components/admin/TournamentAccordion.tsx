'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EditTournamentModal } from './EditTournamentModal';
import { EditMatchModal } from './EditMatchModal';
import { PublishMatchResultModal } from './PublishMatchResultModal';
import { PublishTournamentWinnerModal } from './PublishTournamentWinnerModal';
import { deleteTournament, deleteMatch, publishTournamentWinner } from '@/actions/admin';
import { formatDate, formatDateTime } from '@/lib/format';

interface TournamentAccordionProps {
    tournament: {
        id: string;
        name: string;
        type: string;
        format: string;
        startDate: Date;
        endDate: Date;
        winner: string | null;
        teams: { name: string }[];
        matches: any[]; // Using any for brevity, but should match Prisma return
    };
    tournamentList: any[]; // For dropdowns in edit modals
}

export function TournamentAccordion({ tournament, tournamentList }: TournamentAccordionProps) {
    const [isOpen, setIsOpen] = useState(false); // Default closed as requested to minimize clutter
    // Note: User can toggle.

    return (
        <div className="glass rounded-xl relative overflow-hidden transition-all">
            <div
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${isOpen ? 'bg-white/10' : 'bg-transparent'}`}>
                            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--secondary)]">{tournament.name}</h3>
                            <span className="text-sm text-gray-400">
                                {tournament.type} ({tournament.format}) • {formatDate(tournament.startDate)} to {formatDate(tournament.endDate)}
                            </span>
                            {tournament.winner && <div className="mt-1 text-green-400 font-bold">🏆 Winner: {tournament.winner}</div>}
                        </div>
                    </div>

                    <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                        {/* Publish Winner Modal */}
                        {!tournament.winner && (
                            <PublishTournamentWinnerModal tournament={tournament} />
                        )}

                        <EditTournamentModal tournament={tournament} />

                        <form action={async () => {
                            if (confirm('Are you sure? This will delete all matches in this tournament.')) {
                                await deleteTournament(tournament.id);
                            }
                        }}>
                            <button className="bg-red-900/40 hover:bg-red-600 text-red-200 px-3 py-2 rounded text-xs transition-colors" title="Delete Tournament">
                                🗑️
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-[var(--glass-border)] bg-black/20 p-6">
                    {tournament.matches.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No matches scheduled for this tournament.</p>
                    ) : (
                        <div className="space-y-3">
                            {tournament.matches.map((m: any) => (
                                <div key={m.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="min-w-[50px] flex flex-col items-center">
                                            <div className="bg-white/10 px-3 py-1 rounded text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">
                                                Match
                                            </div>
                                            <div className="text-2xl font-bold font-mono text-white">
                                                {m.number || '?'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 font-medium text-lg">
                                                <span>{m.teamA}</span>
                                                <span className="text-gray-500 text-sm">vs</span>
                                                <span>{m.teamB}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span>{formatDateTime(m.date)}</span>
                                                <span className={`px-2 py-0.5 rounded ${m.status === 'LIVE' ? 'bg-red-500 animate-pulse text-white' :
                                                    m.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' : 'bg-white/10'}`}>
                                                    {m.status}
                                                </span>
                                            </div>
                                            {m.result && (
                                                <div className="text-xs text-green-400 mt-1">
                                                    ✨ {m.result}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <PublishMatchResultModal match={{ ...m, tournamentId: tournament.id }} />

                                        <EditMatchModal
                                            match={{
                                                ...m,
                                                tournament: { teams: tournament.teams }
                                            }}
                                            tournaments={tournamentList}
                                        />

                                        <form action={async () => {
                                            if (confirm('Delete this match?')) {
                                                await deleteMatch(m.id);
                                            }
                                        }}>
                                            <button className="text-red-400 hover:text-red-200 p-2 hover:bg-white/5 rounded" title="Delete Match">✕</button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
