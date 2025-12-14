'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

async function verifyAdmin() {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUB_ADMIN')) {
        throw new Error('Unauthorized');
    }
}

export async function createTournament(formData: FormData) {
    await verifyAdmin();
    const name = formData.get('name') as string;
    const type = formData.get('type') as string; // T20, ODI, TEST
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const teamsInput = formData.get('teams') as string;

    const teamNames = teamsInput ? teamsInput.split(',').map(t => t.trim()).filter(Boolean) : [];

    await prisma.tournament.create({
        data: {
            name,
            type,
            startDate,
            endDate,
            teams: {
                connectOrCreate: teamNames.map(name => ({
                    where: { name },
                    create: { name }
                }))
            }
        },
    });
    revalidatePath('/admin/matches');
}

export async function createMatch(tournamentId: string, formData: FormData) {
    await verifyAdmin();
    const teamA = formData.get('teamA') as string;
    const teamB = formData.get('teamB') as string;
    const date = new Date(formData.get('date') as string);
    const number = parseInt(formData.get('number') as string) || 0;

    await prisma.match.create({
        data: {
            tournamentId,
            number,
            teamA,
            teamB,
            date,
            status: 'SCHEDULED',
        },
    });
    revalidatePath('/admin/matches');
}

export async function updateMatchStatus(matchId: string, status: string, tossWinner?: string, matchWinner?: string, result?: string) {
    await verifyAdmin();

    // If match is completed, calculate points (TODO: Trigger point calculation job)

    await prisma.match.update({
        where: { id: matchId },
        data: {
            status,
            tossWinner,
            matchWinner,
            result
        },
    });
    revalidatePath('/admin/matches');
}

export async function getTournaments() {
    // Allow public public read? No, admin mostly. But users need it too.
    // For admin list, we verify.
    await verifyAdmin();
    return await prisma.tournament.findMany({
        include: {
            matches: { orderBy: { date: 'asc' } },
            teams: { orderBy: { name: 'asc' } }
        },
        orderBy: { startDate: 'desc' },
    });
}
