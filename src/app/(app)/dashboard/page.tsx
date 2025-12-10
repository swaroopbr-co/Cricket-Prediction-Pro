import { getUpcomingMatches } from '@/actions/prediction';
import { MatchCard } from '@/components/user/MatchCard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const matches = await getUpcomingMatches();

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="heading-gradient text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-400">Upcoming Matches & Predictions</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400">Total Points</p>
                    <p className="text-2xl font-bold text-[var(--primary)]">0</p>
                    {/* TODO: Fetch total points dynamically */}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {matches.map((match) => (
                    <MatchCard
                        key={match.id}
                        match={match}
                        userPrediction={match.predictions[0]} // Since we included where userId=current
                    />
                ))}
            </div>

            {matches.length === 0 && (
                <div className="glass rounded-xl p-12 text-center text-gray-400">
                    No upcoming matches found. Ask your Admin to schedule some!
                </div>
            )}
        </div>
    );
}
