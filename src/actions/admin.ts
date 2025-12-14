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

export async function createTournament(name: string, type: string, format: string, startDate: string, endDate: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error("Unauthorized");

    await prisma.tournament.create({
        data: {
            name,
            type, // T20, ODI, TEST
            format, // LEAGUE, BILATERAL
            startDate: new Date(startDate),
            endDate: new Date(endDate)
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

export async function createRoom(name: string, initialMemberIds: string[] = []) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUB_ADMIN')) {
        throw new Error("Unauthorized");
    }

    if (!name || name.trim() === '') {
        return { error: "Room name is required" };
    }

    // Always include admin as member? Yes.
    const memberData = [
        { userId: session.userId },
        ...initialMemberIds.filter(id => id !== session.userId).map(userId => ({ userId }))
    ];

    await prisma.room.create({
        data: {
            name,
            adminId: session.userId,
            members: {
                create: memberData
            }
        }
    });
    revalidatePath('/admin/rooms');
    return { success: true };
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

// ... existing actions ...

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

export async function updateMatchStatus(id: string, status: string, winner?: string) {
    await verifyAdmin();
    await prisma.match.update({
        where: { id },
        data: {
            status,
            matchWinner: winner,
            // If completed, maybe update points? (Handled separately usually, but for now simple update)
        }
    });
    revalidatePath('/admin/matches');
}

export async function publishTournamentWinner(id: string, winner: string) {
    await verifyAdmin();
    await prisma.tournament.update({
        where: { id },
        data: {
            winner,
            locked: true // Lock creating new matches?
        }
    });

    // TODO: Calculate Points for Tournament Winner Predictions
    // For now, just setting the winner.
    revalidatePath('/admin/matches');
}

