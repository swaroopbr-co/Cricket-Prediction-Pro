import { getUpcomingMatches, getActiveTournamentsWithUserPrediction } from '@/actions/prediction';
import { getPolls, votePoll } from '@/actions/poll';
import { MatchesView } from '@/components/user/MatchesView';
import { TournamentPredictionCard } from '@/components/user/TournamentPredictionCard';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const matches = await getUpcomingMatches();
    const activeTournaments = await getActiveTournamentsWithUserPrediction();
    const polls = await getPolls(false); // Valid user-side call

    return (
        <div className="space-y-8">
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

            {/* Active Tournaments Voting */}
            {activeTournaments.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {activeTournaments.map((t: any) => (
                        <TournamentPredictionCard
                            key={t.id}
                            tournament={t}
                            userPrediction={t.predictions[0]}
                        />
                    ))}
                </div>
            )}

            {/* Client-side Match Filtering & Display */}
            <MatchesView matches={matches} />

            {matches.length === 0 && (
                <div className="glass rounded-xl p-12 text-center text-gray-400">
                    No upcoming matches found. Ask your Admin to schedule some!
                </div>
            )}
        </div>
    );
}
