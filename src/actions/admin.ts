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

export async function createRoom(name: string) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUB_ADMIN')) {
        throw new Error("Unauthorized");
    }

    if (!name || name.trim() === '') {
        return { error: "Room name is required" };
    }

    await prisma.room.create({
        data: {
            name,
            adminId: session.userId,
            members: {
                create: { userId: session.userId }
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
        include: { _count: { select: { members: true } } },
        orderBy: { createdAt: 'desc' }
    });
}
