import { getTournaments } from '@/actions/match';
import { CreateTournamentForm } from '@/components/admin/CreateTournamentForm';
import { createTournament, createMatch, deleteTournament, deleteMatch, publishTournamentWinner } from '@/actions/admin';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function AdminMatchesPage() {
    const tournaments = await prisma.tournament.findMany({
        include: { matches: true },
        orderBy: { startDate: 'desc' }
    });
    const matches = await prisma.match.findMany({
        include: { tournament: true },
        orderBy: { date: 'desc' }
    });

    // ... existing handlers ...
    async function handleCreateTournament(formData: FormData) {
        'use server';
        await createTournament(
            formData.get('name') as string,
            formData.get('type') as string,
            formData.get('format') as string,
            formData.get('startDate') as string,
            formData.get('endDate') as string
        );
    }

    async function handleCreateMatch(formData: FormData) {
        'use server';
        await createMatch(
            formData.get('tournamentId') as string,
            parseInt(formData.get('number') as string) || 0,
            formData.get('teamA') as string,
            formData.get('teamB') as string,
            formData.get('date') as string
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="heading-gradient text-2xl font-bold">Match & Tournament Center</h1>

            {/* Tournament Creation */}
            <div className="glass p-6 rounded-xl relative group">
                <h2 className="text-lg font-bold mb-4">Create Tournament</h2>
                <form action={handleCreateTournament} className="grid grid-cols-2 gap-4">
                    {/* ... inputs ... */}
                    <input name="name" placeholder="Tournament Name (e.g. IPL 2026)" className="col-span-2 p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    <select name="type" className="p-3 rounded bg-[var(--surface)] border border-white/10" required>
                        <option value="T20">T20</option>
                        <option value="ODI">ODI</option>
                        <option value="TEST">TEST</option>
                    </select>
                    <select name="format" className="p-3 rounded bg-[var(--surface)] border border-white/10" required>
                        <option value="LEAGUE">League (IPL/BBL)</option>
                        <option value="BILATERAL">Bilateral Series</option>
                    </select>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1">Start Date</label>
                        <input type="date" name="startDate" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1">End Date</label>
                        <input type="date" name="endDate" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    </div>
                    <button className="col-span-2 btn-primary">Create Tournament</button>
                </form>
            </div>

            {/* Match Creation */}
            <div className="glass p-6 rounded-xl">
                <h2 className="text-lg font-bold mb-4">Create Match</h2>
                <form action={handleCreateMatch} className="grid grid-cols-2 gap-4">
                    <select name="tournamentId" className="col-span-2 p-3 rounded bg-[var(--surface)] border border-white/10" required>
                        <option value="">Select Tournament</option>
                        {tournaments.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
                    </select>
                    <input type="number" name="number" placeholder="Match No (e.g. 1)" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1">Match Date & Time</label>
                        <input type="datetime-local" name="date" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    </div>
                    <input name="teamA" placeholder="Team A (e.g. MI)" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    <input name="teamB" placeholder="Team B (e.g. CSK)" className="p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    <button className="col-span-2 btn-primary">Create Match</button>
                </form>
            </div>

            <h2 className="text-xl font-bold">Active Tournaments</h2>
            {tournaments.map((t: any) => (
                <div key={t.id} className="glass rounded-xl p-6 relative">
                    <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-[var(--secondary)]">{t.name}</h3>
                            <span className="text-sm text-gray-400">{t.type} ({t.format}) • {t.startDate.toLocaleDateString()} to {t.endDate.toLocaleDateString()}</span>
                            {t.winner && <div className="mt-1 text-green-400 font-bold">🏆 Winner: {t.winner}</div>}
                        </div>

                        <div className="flex gap-2">
                            {/* Publish Winner Form */}
                            {!t.winner && (
                                <form action={async (formData) => {
                                    'use server';
                                    await publishTournamentWinner(t.id, formData.get('winner') as string);
                                }} className="flex gap-2">
                                    <input name="winner" placeholder="Winner Team" className="p-2 rounded bg-white/5 border border-white/10 text-xs" required />
                                    <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs">Publish Winner</button>
                                </form>
                            )}

                            {/* Delete Tournament */}
                            <form action={async () => {
                                'use server';
                                await deleteTournament(t.id);
                            }}>
                                <button className="bg-red-900/40 hover:bg-red-600 text-red-200 px-3 py-2 rounded text-xs transition-colors" title="Delete Tournament">
                                    🗑️
                                </button>
                            </form>
                        </div>
                    </div>

                    {t.matches.length === 0 ? (
                        <p className="text-sm text-gray-500">No matches scheduled.</p>
                    ) : (
                        <ul className="space-y-2">
                            {t.matches.map((m: any) => (
                                <li key={m.id} className="flex items-center justify-between border-b border-[var(--glass-border)] py-2 text-sm last:border-0">
                                    <span>Match {m.number}: {m.teamA} vs {m.teamB}</span>

                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2 py-0.5 rounded ${m.status === 'LIVE' ? 'bg-red-500 animate-pulse text-white' : 'text-gray-400 bg-white/5'}`}>
                                            {m.status}
                                        </span>
                                        {/* Delete Match */}
                                        <form action={async () => {
                                            'use server';
                                            await deleteMatch(m.id);
                                        }}>
                                            <button className="text-red-400 hover:text-red-200" title="Delete Match">✕</button>
                                        </form>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
            {tournaments.length === 0 && <p className="text-gray-500">No tournaments found.</p>}
        </div>
    );
}
