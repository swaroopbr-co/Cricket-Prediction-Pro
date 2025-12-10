import { getLeaderboard } from '@/actions/prediction';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
    const leaderboard = await getLeaderboard();

    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">Global Leaderboard</h1>

            <div className="glass overflow-hidden rounded-xl">
                <table className="w-full text-left text-sm text-[var(--foreground)]">
                    <thead className="bg-[var(--glass-bg)] text-xs uppercase text-[var(--secondary)]">
                        <tr>
                            <th className="px-6 py-3">Rank</th>
                            <th className="px-6 py-3">Player</th>
                            <th className="px-6 py-3 text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--glass-border)]">
                        {leaderboard.map((player, index) => (
                            <tr key={player.username} className={`hover:bg-[var(--glass-bg)] ${index < 3 ? 'bg-white/5' : ''}`}>
                                <td className="px-6 py-4 font-bold">
                                    {index === 0 && '🥇'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'}
                                    {index > 2 && index + 1}
                                </td>
                                <td className="px-6 py-4 font-medium">{player.username}</td>
                                <td className="px-6 py-4 text-right font-bold text-[var(--primary)]">{player.totalPoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {leaderboard.length === 0 && <div className="p-8 text-center text-gray-400">No players yet.</div>}
            </div>
        </div>
    );
}
