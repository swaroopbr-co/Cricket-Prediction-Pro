'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
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
