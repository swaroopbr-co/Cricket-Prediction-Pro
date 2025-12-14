'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// Fetch notifications for the current user
export async function getNotifications() {
    const session = await getSession();
    if (!session) return [];

    return await prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' }
    });
}

// Mark a notification as read
export async function markNotificationRead(id: string) {
    const session = await getSession();
    if (!session) return;

    await prisma.notification.update({
        where: { id, userId: session.userId },
        data: { isRead: true }
    });
    revalidatePath('/dashboard'); // revalidate everywhere?
}

// Admin: Send Notification
// Target: 'ALL', 'ROOM:{id}', 'USER:{id}'
export async function sendNotification(target: string, title: string, message: string, type: string = 'INFO') {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error("Unauthorized");

    if (target === 'ALL') {
        const users = await prisma.user.findMany({ select: { id: true } });
        await prisma.notification.createMany({
            data: users.map(u => ({
                userId: u.id,
                title,
                message,
                type
            }))
        });
    } else if (target.startsWith('ROOM:')) {
        const roomId = target.split(':')[1];
        const members = await prisma.roomMember.findMany({ where: { roomId }, select: { userId: true } });
        await prisma.notification.createMany({
            data: members.map(m => ({
                userId: m.userId,
                title,
                message,
                type
            }))
        });
    } else if (target.startsWith('USER:')) {
        const userId = target.split(':')[1];
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });
    }
    revalidatePath('/admin/dashboard');
}

// User: Request Vote Change
export async function requestVoteChange(matchId: string, reason: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Notify all admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });

    await prisma.notification.createMany({
        data: admins.map(a => ({
            userId: a.id,
            title: `Vote Change Request: ${session.username}`,
            message: `User ${session.username} requests to change vote for Match ${matchId}. Reason: ${reason}`,
            type: 'VOTE_REQUEST'
        }))
    });
}
