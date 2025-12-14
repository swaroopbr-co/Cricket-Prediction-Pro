import { getLeaderboard } from '@/actions/prediction';
import { prisma } from '@/lib/prisma'; // Direct prisma access strictly for static data like Tournaments/Matches list
import { LeaderboardFilters } from '@/components/user/LeaderboardFilters';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const tournamentId = typeof searchParams.tournamentId === 'string' ? searchParams.tournamentId : undefined;
    const matchId = typeof searchParams.matchId === 'string' ? searchParams.matchId : undefined;

    const leaderboard = await getLeaderboard({ tournamentId, matchId });

    // Fetch data for filters
    const tournaments = await prisma.tournament.findMany({ select: { id: true, name: true } });
    const matches = await prisma.match.findMany({
        select: { id: true, teamA: true, teamB: true, tournamentId: true },
        orderBy: { date: 'desc' }
    });

    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">Leaderboard</h1>

            <LeaderboardFilters tournaments={tournaments} matches={matches} />

            <div className="glass overflow-hidden rounded-xl">
                <table className="w-full text-left text-sm text-[var(--foreground)]">
                    <thead className="bg-[var(--glass-bg)] text-xs uppercase text-[var(--secondary)]">
                        <tr>
                            <th className="px-4 py-3 md:px-6">Rank</th>
                            <th className="px-4 py-3 md:px-6">Player</th>
                            <th className="px-4 py-3 md:px-6 text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--glass-border)]">
                        {leaderboard.map((player, index) => (
                            <tr key={player.username} className={`hover:bg-[var(--glass-bg)] ${index < 3 ? 'bg-white/5' : ''}`}>
                                <td className="px-4 py-4 md:px-6 font-bold">
                                    {index === 0 && '🥇'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'}
                                    {index > 2 && index + 1}
                                </td>
                                <td className="px-4 py-4 md:px-6 font-medium">
                                    <div className="flex items-center gap-2">
                                        {/* Avatar placeholder if needed */}
                                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] font-bold">
                                            {player.username[0].toUpperCase()}
                                        </div>
                                        {player.username}
                                    </div>
                                </td>
                                <td className="px-4 py-4 md:px-6 text-right font-bold text-[var(--primary)]">{player.totalPoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leaderboard.length === 0 && <div className="p-8 text-center text-gray-400">No players found.</div>}
            </div>
        </div>
    );
}
