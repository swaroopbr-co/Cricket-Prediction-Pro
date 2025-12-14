import { prisma } from '@/lib/prisma';
import { getUpcomingMatches } from '@/actions/prediction';
import { MatchesView } from '@/components/user/MatchesView';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { EditRoomModal } from '@/components/rooms/EditRoomModal';
import { RoomMembersList } from '@/components/rooms/RoomMembersList';

export const dynamic = 'force-dynamic';

export default async function RoomDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const room = await prisma.room.findUnique({
        where: { id: params.id },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            username: true,
                            avatar: true,
                            predictions: {
                                select: { points: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!room) return notFound();

    const session = await getSession();
    const isAdmin = room.adminId === session?.userId;

    const currentMember = room.members.find(m => m.userId === session?.userId);
    const isPending = currentMember && !currentMember.isApproved;

    // Pending Members (for Admin)
    const pendingMembers = room.members.filter(m => !m.isApproved);

    // If I am pending AND not admin (admin shouldn't be pending but safe check), show waiting screen
    if (isPending && !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="text-4xl">⏳</div>
                <h1 className="text-2xl font-bold">Membership Pending</h1>
                <p className="text-gray-400 max-w-md">
                    Your request to join <strong>{room.name}</strong> has been sent.
                    Please wait for the room admin to approve your request.
                </p>
            </div>
        );
    }

    // Filters for Leaderboard (only approved members)
    const approvedMembers = room.members.filter(m => m.isApproved);

    // Calculate Room Leaderboard
    const leaderboard = approvedMembers
        .map(m => ({
            username: m.user.username,
            avatar: m.user.avatar,
            totalPoints: m.user.predictions.reduce((acc, p) => acc + p.points, 0)
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints);

    // Fetch Matches
    const matches = await getUpcomingMatches();

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="heading-gradient text-3xl font-bold">{room.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-gray-400">{room.members.length} Members</p>
                        {isAdmin && <EditRoomModal room={room} />}
                    </div>
                </div>
            </div>

            <section>
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
                                    <td className="px-6 py-4 font-medium">
                                        <div className="flex items-center gap-2">
                                            {/* Avatar placeholder */}
                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] font-bold">
                                                {player.username[0].toUpperCase()}
                                            </div>
                                            {player.username}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-[var(--primary)]">{player.totalPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Matches Section within Room */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🏏</span>
                    <h2 className="text-xl font-bold text-white">Upcoming Matches</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">Make predictions for matches here to climb the room leaderboard!</p>
                <MatchesView matches={matches} />
            </section>
        </div>
    );
}
