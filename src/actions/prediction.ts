'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

async function verifyUser() {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');
    return session;
}

export async function getUpcomingMatches() {
    const session = await verifyUser();
    const now = new Date();

    // Fetch matches that are partially scheduled or live or recently completed
    // And include user's existing prediction
    const matches = await prisma.match.findMany({
        where: {
            date: { gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } // Show matches from last 24h too
        },
        orderBy: { date: 'asc' },
        include: {
            predictions: {
                where: { userId: session.userId }
            },
            tournament: true
        }
    });

    return matches;
}

export async function makePrediction(matchId: string, tossPick: string, matchPick: string) {
    const session = await verifyUser();

    const match = await prisma.match.findUnique({
        where: { id: matchId },
    });

    if (!match) throw new Error('Match not found');

    // Lock Logic: 2 hours before toss. Assuming Toss is 30 mins before match date.
    // So lock time = Match Date - 30m - 2h = Match Date - 2.5h
    const lockTime = new Date(match.date.getTime() - (2.5 * 60 * 60 * 1000));

    if (new Date() > lockTime) {
        throw new Error('Prediction window is closed.');
    }

    await prisma.prediction.upsert({
        where: {
            userId_matchId: {
                userId: session.userId,
                matchId: matchId
            }
        },
        update: {
            tossPick,
            matchPick
        },
        create: {
            userId: session.userId,
            matchId,
            tossPick,
            matchPick
        }
    });

    revalidatePath('/dashboard');
}

export async function getLeaderboard() {
    const users = await prisma.user.findMany({
        select: {
            username: true,
            predictions: {
                select: { points: true }
            }
        }
    });

    // Simple aggregate
    const leaderboard = users.map((u: any) => ({
        username: u.username,
        totalPoints: u.predictions.reduce((acc: number, p: any) => acc + p.points, 0)
    })).sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    return leaderboard;
}
