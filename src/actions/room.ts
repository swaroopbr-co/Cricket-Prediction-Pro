'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function getRooms(currentUserId?: string) {
    const rooms = await prisma.room.findMany({
        include: {
            _count: { select: { members: true } },
            members: { where: { userId: currentUserId } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return rooms.map((room: any) => ({
        ...room,
        isMember: room.members.length > 0
    }));
}

export async function joinRoom(roomId: string) {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    await prisma.roomMember.create({
        data: {
            roomId,
            userId: session.userId
        }
    });

    revalidatePath('/rooms');
}
