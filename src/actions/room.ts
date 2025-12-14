'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createRoom(name: string, type: 'PUBLIC' | 'PRIVATE' | 'REQUEST' = 'PUBLIC') {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const newRoom = await prisma.room.create({
        data: {
            name,
            adminId: session.userId,
            type,
            members: {
                create: {
                    userId: session.userId,
                    isApproved: true // Creator is always approved
                }
            }
        }
    });

    revalidatePath('/rooms');
    return newRoom;
}

export async function getRooms(currentUserId?: string) {
    const rooms = await prisma.room.findMany({
        where: {
            OR: [
                { type: 'PUBLIC' },
                { type: 'REQUEST' },
                { members: { some: { userId: currentUserId } } } // Show private only if member
            ]
        },
        include: {
            _count: { select: { members: true } },
            members: { where: { userId: currentUserId } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return rooms.map((room: any) => {
        const membership = room.members[0];
        return {
            ...room,
            isMember: !!membership,
            isPending: membership ? !membership.isApproved : false
        };
    });
}

export async function approveRoomMember(roomId: string, userId: string) {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const room = await prisma.room.findUnique({ where: { id: roomId }, select: { adminId: true } });
    if (!room || room.adminId !== session.userId) throw new Error("Unauthorized");

    await prisma.roomMember.update({
        where: { roomId_userId: { roomId, userId } },
        data: { isApproved: true }
    });

    revalidatePath(`/rooms/${roomId}`);
}

export async function rejectRoomMember(roomId: string, userId: string) {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const room = await prisma.room.findUnique({ where: { id: roomId }, select: { adminId: true } });
    if (!room || room.adminId !== session.userId) throw new Error("Unauthorized");

    await prisma.roomMember.delete({
        where: { roomId_userId: { roomId, userId } }
    });

    revalidatePath(`/rooms/${roomId}`);
}

export async function joinRoom(roomId: string) {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { type: true }
    });

    if (!room) throw new Error('Room not found');

    // PUBLIC: Approved immediately
    // REQUEST: Not approved (Pending)
    // PRIVATE: (Invite only - usually handled via dedicated invite link action, but if joining via public ID?)
    // Let's assume if you can see it and click join, it acts like REQUEST if private, or just error?
    // Plan said: "REQUEST: isApproved = false". "PRIVATE: Prevent join if not invited?"
    // For now, if PRIVATE rooms are mostly hidden, standard join might not happen. 
    // But if someone gets the ID, treat as REQUEST (Pending).

    const isApproved = room.type === 'PUBLIC';

    await prisma.roomMember.create({
        data: {
            roomId,
            userId: session.userId,
            isApproved
        }
    });

    revalidatePath('/rooms');
}

export async function updateRoom(roomId: string, name: string, type: 'PUBLIC' | 'PRIVATE' | 'REQUEST') {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { adminId: true }
    });

    if (!room || room.adminId !== session.userId) {
        throw new Error("Unauthorized");
    }

    await prisma.room.update({
        where: { id: roomId },
        data: { name, type }
    });

    revalidatePath(`/rooms/${roomId}`);
    revalidatePath('/rooms');
}

export async function deleteRoom(roomId: string) {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { adminId: true }
    });

    if (!room || room.adminId !== session.userId) {
        throw new Error("Unauthorized");
    }

    // Delete members first (cascade usually handles this but safe to be explicit if no cascade)
    // Actually Prisma schema handles cascade if configured, but let's just delete room.
    // Assuming DB handles cascade or we delete members.
    // Let's rely on cascade or explicit delete.
    await prisma.roomMember.deleteMany({
        where: { roomId }
    });

    await prisma.room.delete({
        where: { id: roomId }
    });

    revalidatePath('/rooms');
}
