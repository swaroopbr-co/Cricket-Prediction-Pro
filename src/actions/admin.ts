'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function verifyAdmin() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }
}

export async function createTournament(name: string, type: string, format: string, startDate: string, endDate: string, teamNames: string[]) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error("Unauthorized");

    await prisma.tournament.create({
        data: {
            name,
            type, // T20, ODI, TEST
            format, // LEAGUE, BILATERAL
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            teams: {
                connectOrCreate: teamNames.map(n => ({
                    where: { name: n },
                    create: { name: n }
                }))
            }
        }
    });
    revalidatePath('/admin/matches');
}

export async function createMatch(tournamentId: string, number: number, teamA: string, teamB: string, date: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error("Unauthorized");

    await prisma.match.create({
        data: {
            tournamentId,
            number,
            teamA,
            teamB,
            date: new Date(date),
            status: 'SCHEDULED'
        }
    });
    revalidatePath('/admin/matches');
}

export async function getUsers() {
    await verifyAdmin();
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function approveUser(userId: string) {
    await verifyAdmin();
    await prisma.user.update({
        where: { id: userId },
        data: { isApproved: true },
    });
    revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
    await verifyAdmin();
    await prisma.user.delete({
        where: { id: userId },
    });
    revalidatePath('/admin/users');
}

export async function toggleRole(userId: string, newRole: 'USER' | 'ADMIN' | 'SUB_ADMIN') {
    await verifyAdmin();
    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
    });
    revalidatePath('/admin/users');
}

export async function getAdminStats() {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUB_ADMIN')) {
        return {
            totalUsers: 0, pendingUsers: 0,
            totalMatches: 0, liveMatches: 0,
            totalRooms: 0
        };
    }

    const [totalUsers, pendingUsers, totalMatches, liveMatches, totalRooms] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isApproved: false } }),
        prisma.match.count(),
        prisma.match.count({ where: { status: 'LIVE' } }),
        prisma.room.count(),
    ]);

    return { totalUsers, pendingUsers, totalMatches, liveMatches, totalRooms };
}

export async function updateUserCredentials(userId: string, newUsername?: string, newPassword?: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    const data: any = {};
    if (newUsername && newUsername.trim() !== '') data.username = newUsername;
    if (newPassword && newPassword.trim() !== '') {
        data.password = await hashPassword(newPassword);
    }

    if (Object.keys(data).length > 0) {
        await prisma.user.update({
            where: { id: userId },
            data
        });
        revalidatePath('/admin/users');
    }
}

export async function createRoom(name: string, type: 'PUBLIC' | 'PRIVATE' | 'REQUEST' = 'PUBLIC', initialMemberIds: string[] = []) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUB_ADMIN')) {
        throw new Error("Unauthorized");
    }

    if (!name || name.trim() === '') {
        return { error: "Room name is required" };
    }

    // Always include admin as member? Yes.
    const memberData = [
        { userId: session.userId, isApproved: true },
        ...initialMemberIds.filter(id => id !== session.userId).map(userId => ({ userId, isApproved: true }))
    ];

    await prisma.room.create({
        data: {
            name,
            type,
            adminId: session.userId,
            members: {
                create: memberData
            }
        }
    });
    revalidatePath('/admin/rooms');
    return { success: true };
}

export async function adminUpdateRoom(roomId: string, name: string, type: 'PUBLIC' | 'PRIVATE' | 'REQUEST') {
    await verifyAdmin();
    await prisma.room.update({
        where: { id: roomId },
        data: { name, type }
    });
    revalidatePath('/admin/rooms');
}

export async function adminDeleteRoom(roomId: string) {
    await verifyAdmin();
    // Delete members first
    await prisma.roomMember.deleteMany({ where: { roomId } });
    await prisma.room.delete({ where: { id: roomId } });
    revalidatePath('/admin/rooms');
}

export async function getRooms() {
    const session = await getSession();
    if (!session) return [];

    // For admins, return all rooms. For users, maybe only theirs? 
    // For now, adhering to Admin Management context.
    return await prisma.room.findMany({
        include: {
            _count: { select: { members: true } },
            members: { include: { user: true } } // Fetch members for management UI
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function addMemberToRoom(roomId: string, userId: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error("Unauthorized");

    try {
        await prisma.roomMember.create({
            data: { roomId, userId }
        });
        revalidatePath('/admin/rooms');
        return { success: true };
    } catch (e: any) { // Type as any to safely access code
        if (e.code === 'P2002') return { error: "User already in room" };
        throw e;
    }
}

// ... (existing export functions)

export async function updateTournament(id: string, data: { name: string, type: string, format: string, startDate: string, endDate: string, teamNames?: string[], locked?: boolean }) {
    await verifyAdmin();

    const updateData: any = {
        name: data.name,
        type: data.type,
        format: data.format,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
    };

    if (data.teamNames && data.teamNames.length > 0) {
        // 1. Ensure all teams exist
        const teams = await Promise.all(data.teamNames.map(async (name) => {
            return await prisma.team.upsert({
                where: { name },
                update: {},
                create: { name }
            });
        }));

        // 2. Set the relation
        updateData.teams = {
            set: teams.map(t => ({ id: t.id }))
        };
    }

    if (data.locked !== undefined) updateData.locked = data.locked;

    await prisma.tournament.update({
        where: { id },
        data: updateData
    });

    revalidatePath('/admin/matches');
}

export async function updateMatch(id: string, data: { tournamentId: string, number: number, teamA: string, teamB: string, date: string, status: string, tossWinner?: string, matchWinner?: string, result?: string }) {
    await verifyAdmin();

    await prisma.match.update({
        where: { id },
        data: {
            tournamentId: data.tournamentId,
            number: data.number,
            teamA: data.teamA,
            teamB: data.teamB,
            date: new Date(data.date),
            status: data.status,
            tossWinner: data.tossWinner,
            matchWinner: data.matchWinner,
            result: data.result
        }
    });

    revalidatePath('/admin/matches');
}

export async function removeMemberFromRoom(roomId: string, userId: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error("Unauthorized");

    await prisma.roomMember.deleteMany({
        where: { roomId, userId }
    });
    revalidatePath('/admin/rooms');
}

// === Phase 6: Admin Controls ===

export async function deleteTournament(id: string) {
    await verifyAdmin();
    // Cascade delete matches? Prisma usually handles this if configured, or we do manually.
    // Ideally, we should delete matches first.
    await prisma.match.deleteMany({ where: { tournamentId: id } });
    await prisma.tournament.delete({ where: { id } });
    revalidatePath('/admin/matches');
}

export async function deleteMatch(id: string) {
    await verifyAdmin();
    await prisma.match.delete({ where: { id } });
    revalidatePath('/admin/matches');
}

export async function updateMatchStatus(id: string, status: string, winner?: string, result?: string, tossWinner?: string) {
    await verifyAdmin();

    // 1. Update Match
    const match = await prisma.match.update({
        where: { id },
        data: {
            status,
            matchWinner: winner,
            result,
            tossWinner
        },
        include: {
            predictions: true
        }
    });

    // 2. Calculate Points if Completed
    if (status === 'COMPLETED') {
        const isDrawOrAbandoned = result === 'DRAW' || result === 'TIE' || result === 'ABANDONED' || result === 'NO_RESULT';

        if (isDrawOrAbandoned) {
            // Give 10 points to everyone who predicted
            await prisma.prediction.updateMany({
                where: { matchId: id },
                data: { points: 10 }
            });
        } else {
            // Standard Calculation
            // We need to loop because each user needs different points based on their picks
            // Bulk update is hard if logic differs per row.
            // Using a loop for now (assuming users < 1000 per match for this scale).

            for (const p of match.predictions) {
                let points = 0;

                // Toss Points (10)
                if (p.tossPick && p.tossPick === tossWinner) {
                    points += 10;
                }

                // Match Winner Points (20)
                if (p.matchPick && p.matchPick === winner) {
                    points += 20;
                }

                if (points > 0) {
                    await prisma.prediction.update({
                        where: { id: p.id },
                        data: { points }
                    });
                }
            }
        }
    }

    revalidatePath('/admin/matches');
}

export async function publishTournamentWinner(id: string, winner: string) {
    await verifyAdmin();
    await prisma.tournament.update({
        where: { id },
        data: {
            winner,
            locked: true
        }
    });

    // Calculate Points for Tournament Winner Predictions (100 Points)
    await prisma.prediction.updateMany({
        where: {
            tournamentId: id,
            matchPick: winner // matchPick stores the team name for tournament predictions
        },
        data: {
            points: 100
        }
    });

    // Zero out incorrect ones? (Optional, but default is 0 so fine)

    revalidatePath('/admin/matches');
}


export async function getRevoteRequests() {
    await verifyAdmin();
    const requests = await prisma.notification.findMany({
        where: {
            type: 'VOTE_REQUEST',
            isRead: false
        },
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    });

    // Enrich with metadata details
    const enrichedRequests = await Promise.all(requests.map(async (req) => {
        let tournamentName = 'Unknown Tournament';
        let metadataObj: any = {};

        // Explicit cast to avoid type error until client is fully synced
        const rawMetadata = (req as any).metadata;

        if (rawMetadata) {
            try {
                metadataObj = JSON.parse(rawMetadata);
                if (metadataObj.tournamentId) {
                    const tournament = await prisma.tournament.findUnique({
                        where: { id: metadataObj.tournamentId },
                        select: { name: true }
                    });
                    if (tournament) tournamentName = tournament.name;
                }
            } catch (e) {
                console.error('Error parsing metadata', e);
            }
        }

        return {
            ...req,
            tournamentName,
            metadataObj
        };
    }));

    return enrichedRequests;
}

export async function getAllTournaments() {
    await verifyAdmin();
    return await prisma.tournament.findMany({
        orderBy: { startDate: 'desc' },
        select: { id: true, name: true }
    });
}

export async function getRecentVotes(filters?: { search?: string, tournamentId?: string, roomId?: string }) {
    await verifyAdmin();

    const where: any = {};

    if (filters?.search) {
        where.user = {
            username: {
                contains: filters.search
            }
        };
    }

    if (filters?.roomId) {
        // Filter users who are members of this room
        // Note: This filters predictions by users who are in the room, 
        // not necessarily predictions MADE in the context of that room (if that distinction existed)
        // Since predictions are global per match/tournament, this is the correct interpretation.
        where.user = {
            ...where.user,
            joinedRooms: {
                some: {
                    roomId: filters.roomId
                }
            }
        };
    }

    if (filters?.tournamentId) {
        where.OR = [
            { tournamentId: filters.tournamentId },
            { match: { tournamentId: filters.tournamentId } }
        ];
    }

    const predictions = await prisma.prediction.findMany({
        take: 50,
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
            user: {
                select: { username: true, avatar: true }
            },
            match: {
                include: {
                    tournament: { select: { name: true } }
                }
            },
            tournament: { select: { name: true } }
        }
    });

    return predictions;
}

export async function handleRevoteRequest(notificationId: string, approved: boolean) {
    await verifyAdmin();

    const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
    });

    if (!notification || !(notification as any).metadata) {
        throw new Error("Invalid request");
    }

    const { requesterId, tournamentId, action } = JSON.parse((notification as any).metadata);

    if (approved) {
        if (action === 'REVOTE_TOURNAMENT' && tournamentId) {
            await prisma.prediction.deleteMany({
                where: {
                    userId: requesterId,
                    tournamentId: tournamentId
                }
            });
        }
        // Add other types if needed
    }

    // Mark request as read
    await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });

    // Notify user
    await prisma.notification.create({
        data: {
            userId: requesterId,
            type: approved ? 'SUCCESS' : 'INFO',
            title: approved ? 'Revote Request Approved' : 'Revote Request Declined',
            message: approved
                ? 'Your request to change your vote has been approved. You can now vote again.'
                : 'Your request to change your vote was declined by the admin.'
        }
    });

    revalidatePath('/admin/dashboard');
}

export async function ignoreRevoteRequest(notificationId: string) {
    await verifyAdmin();

    // Just mark as read, no notification to user
    await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });

    revalidatePath('/admin/dashboard');
}

export async function getPendingRoomRequests() {
    await verifyAdmin();
    return await prisma.roomMember.findMany({
        where: { isApproved: false },
        include: {
            room: { select: { id: true, name: true } },
            user: { select: { id: true, username: true, email: true } }
        },
        orderBy: { joinedAt: 'asc' }
    });
}

export async function adminApproveJoinRequest(roomId: string, userId: string) {
    await verifyAdmin();
    await prisma.roomMember.update({
        where: { roomId_userId: { roomId, userId } },
        data: { isApproved: true }
    });
    revalidatePath('/admin/rooms');
}

export async function adminRejectJoinRequest(roomId: string, userId: string) {
    await verifyAdmin();
    await prisma.roomMember.delete({
        where: { roomId_userId: { roomId, userId } }
    });
    revalidatePath('/admin/rooms');
}
