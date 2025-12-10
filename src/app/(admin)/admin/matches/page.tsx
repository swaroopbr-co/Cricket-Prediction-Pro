import { getTournaments } from '@/actions/match';
import { CreateTournamentForm } from '@/components/admin/CreateTournamentForm';
import { AddMatchForm } from '@/components/admin/AddMatchForm';

export default async function MatchesPage() {
    const tournaments = await getTournaments();

    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">Match Management</h1>

            <div className="glass mb-8 rounded-xl p-6">
                <h2 className="mb-4 text-xl font-bold">Create Tournament</h2>
                <CreateTournamentForm />
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold">Active Tournaments</h2>
                {tournaments.map((t) => (
                    <div key={t.id} className="glass rounded-xl p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--secondary)]">{t.name}</h3>
                                <span className="text-sm text-gray-400">{t.type} • {t.startDate.toLocaleDateString()} to {t.endDate.toLocaleDateString()}</span>
                            </div>
                            <AddMatchForm tournamentId={t.id} />
                        </div>

                        {t.matches.length === 0 ? (
                            <p className="text-sm text-gray-500">No matches scheduled.</p>
                        ) : (
                            <ul className="space-y-2">
                                {t.matches.map(m => (
                                    <li key={m.id} className="flex justify-between border-b border-[var(--glass-border)] py-2 text-sm last:border-0">
                                        <span>{m.teamA} vs {m.teamB}</span>
                                        <span className="text-gray-400">{m.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
                {tournaments.length === 0 && <p className="text-gray-500">No tournaments found.</p>}
            </div>
        </div>
    );
}
