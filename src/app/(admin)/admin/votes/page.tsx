import { getRecentVotes, getAllTournaments, getRooms } from '@/actions/admin';
import Link from 'next/link';
import { VoteFilters } from '@/components/admin/VoteFilters';
import { formatDateTime } from '@/lib/format';

export default async function VotesPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
    const filters = {
        search: searchParams.search,
        tournamentId: searchParams.tournamentId,
        roomId: searchParams.roomId
    };

    const votes = await getRecentVotes(filters);
    const tournaments = await getAllTournaments();
    const rooms = await getRooms(); // This returns a richer object, but we'll just use id/name

    return (
        <div>
            <h1 className="heading-gradient mb-8 text-3xl font-bold">Vote Monitor</h1>

            <VoteFilters
                tournaments={tournaments}
                rooms={rooms.map(r => ({ id: r.id, name: r.name }))}
            />

            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <h2 className="text-xl font-bold mb-6">Recent Predictions</h2>

                {votes.length === 0 ? (
                    <p className="text-gray-400">No predictions found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-300 uppercase text-xs">
                                <tr>
                                    <th className="p-3">User</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Event / Match</th>
                                    <th className="p-3">Pick</th>
                                    <th className="p-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {votes.map((vote) => (
                                    <tr key={vote.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-medium flex items-center gap-2">
                                            {vote.user.avatar ? (
                                                <img src={vote.user.avatar} className="w-6 h-6 rounded-full" alt="" />
                                            ) : (
                                                <span className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                                                    {vote.user.username[0]}
                                                </span>
                                            )}
                                            {vote.user.username}
                                        </td>
                                        <td className="p-3 text-sm">
                                            {vote.matchId ? (
                                                <span className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded text-xs">Match</span>
                                            ) : (
                                                <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded text-xs">Tournament</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm">
                                            {vote.match ? (
                                                <div>
                                                    <span className="block text-white">{vote.match.teamA} vs {vote.match.teamB}</span>
                                                    <span className="text-xs text-gray-500">{vote.match.tournament.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-white">{vote.tournament?.name}</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm">
                                            {vote.matchPick && (
                                                <div className="flex gap-1 items-center">
                                                    <span className="text-gray-400 text-xs">Winner:</span>
                                                    <span className="font-semibold text-[var(--primary)]">{vote.matchPick}</span>
                                                </div>
                                            )}
                                            {vote.tossPick && (
                                                <div className="flex gap-1 items-center">
                                                    <span className="text-gray-400 text-xs">Toss:</span>
                                                    <span className="font-semibold text-[var(--secondary)]">{vote.tossPick}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-xs text-gray-400">
                                            {formatDateTime(vote.updatedAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
