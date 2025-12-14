'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createPoll(question: string, options: string[], tournamentId?: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error("Unauthorized");

    await prisma.poll.create({
        data: {
            question,
            tournamentId: tournamentId || null,
            options: {
                create: options.map(text => ({ text }))
            }
        }
    });
    revalidatePath('/admin/polls');
}

export async function deletePoll(pollId: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error("Unauthorized");

    // Delete related votes/options first (Cascade usually handles this but safety first)
    // Actually simpler to just delete poll if Cascade is on, but here separate deletes are safer without proper DB cascade setup in dev
    await prisma.pollVote.deleteMany({ where: { pollId } });
    await prisma.pollOption.deleteMany({ where: { pollId } });
    await prisma.poll.delete({ where: { id: pollId } });

    revalidatePath('/admin/polls');
}

export async function getPolls(isAdmin: boolean = false) {
    // Admins see all, users see active only
    const where = isAdmin ? {} : { isActive: true };
    return await prisma.poll.findMany({
        where,
        include: {
            options: { include: { _count: { select: { votes: true } } } },
            tournament: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function votePoll(pollId: string, optionId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Check if user already voted
    const existingVote = await prisma.pollVote.findUnique({
        where: { userId_pollId: { userId: session.userId, pollId } }
    });

    if (existingVote) {
        // Change vote? Or throw error? Let's allow change.
        await prisma.pollVote.update({
            where: { id: existingVote.id },
            data: { optionId }
        });
    } else {
        await prisma.pollVote.create({
            data: {
                pollId,
                optionId,
                userId: session.userId
            }
        });
    }
    revalidatePath('/polls'); // User side path
    revalidatePath('/dashboard');
}
