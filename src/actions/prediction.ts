'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { updateMatchStatuses } from './schedule_helper';

async function verifyUser() {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');
    return session;
}

export async function getUpcomingMatches() {
    const session = await verifyUser();
    const now = new Date();

    // Trigger status update check
    await updateMatchStatuses();

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

    // Lock Logic: 1 hour before toss. 
    // Toss is generally 30 mins before match.
    // So 1 hour before toss = 1.5 hours before match start.
    const lockTime = new Date(match.date.getTime() - (1.5 * 60 * 60 * 1000));

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

export async function getLeaderboard(filter?: { tournamentId?: string, matchId?: string, roomId?: string }) {
    // 1. Filter out Admins (unless in a room? No, rules same usually)
    const userWhere: any = {
        role: { notIn: ['ADMIN', 'MASTER_ADMIN'] },
        isApproved: true
    };

    // If filtering by room, only get users who are members of that room
    if (filter?.roomId && filter.roomId !== 'ALL') {
        userWhere.joinedRooms = {
            some: {
                roomId: filter.roomId,
                isApproved: true
            }
        };
    }

    // 2. Filter Predictions based on Match/Tournament
    const predictionsWhere: any = {};

    if (filter?.matchId && filter.matchId !== 'ALL') {
        predictionsWhere.matchId = filter.matchId;
    } else if (filter?.tournamentId && filter.tournamentId !== 'ALL') {
        predictionsWhere.match = { tournamentId: filter.tournamentId };
    }

    const users = await prisma.user.findMany({
        where: userWhere,
        select: {
            username: true,
            avatar: true,
            predictions: {
                where: predictionsWhere,
                select: { points: true }
            }
        }
    });

    // 3. Aggregate Points
    const leaderboard = users.map((u: any) => ({
        username: u.username,
        avatar: u.avatar,
        totalPoints: u.predictions.reduce((acc: number, p: any) => acc + p.points, 0)
    }))
        .filter((u: any) => u.totalPoints >= 0) // Optional: keep everyone
        .sort((a: any, b: any) => b.totalPoints - a.totalPoints);

    return leaderboard;
}

export async function getMyPredictions() {
    const session = await verifyUser();

    return await prisma.prediction.findMany({
        where: { userId: session.userId },
        include: {
            match: {
                include: {
                    tournament: true
                }
            }
        },
        orderBy: {
            match: {
                date: 'desc'
            }
        }
    });
}

export async function predictTournamentWinner(tournamentId: string, teamName: string) {
    const session = await verifyUser();

    // Check Deadline: 24h before FIRST match of tournament
    // Find first match
    const firstMatch = await prisma.match.findFirst({
        where: { tournamentId },
        orderBy: { date: 'asc' }
    });

    if (!firstMatch) {
        // Fallback if no matches scheduled yet? 
        // If tournament has start date, use that?
        // Let's use Tournament Start Date if no match found, or strictly First Match.
        // Usually tournament has `startDate`.
        const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
        if (!tournament) throw new Error("Tournament not found");

        const deadline = new Date(tournament.startDate.getTime() - (24 * 60 * 60 * 1000));
        if (new Date() > deadline) {
            throw new Error('Tournament prediction window is closed (24h before start).');
        }
    } else {
        const deadline = new Date(firstMatch.date.getTime() - (24 * 60 * 60 * 1000));
        if (new Date() > deadline) {
            throw new Error('Tournament prediction window is closed (24h before first match).');
        }
    }


    // Check if already predicted
    const existing = await prisma.prediction.findUnique({
        where: {
            userId_tournamentId: {
                userId: session.userId,
                tournamentId
            }
        }
    });

    if (existing) {
        throw new Error('You have already predicted the winner for this tournament.');
    }

    await prisma.prediction.create({
        data: {
            userId: session.userId,
            tournamentId,
            matchPick: teamName
        }
    });
    revalidatePath('/dashboard');
}

export async function requestTournamentRevote(tournamentId: string) {
    const session = await verifyUser();

    // Find an admin to notify
    const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!admin) throw new Error('No admin found to process request.');

    await prisma.notification.create({
        data: {
            userId: admin.id,
            type: 'VOTE_REQUEST',
            title: 'Revote Request',
            message: `User ${session.username} requested to change their vote for tournament ID: ${tournamentId}.`,
            metadata: JSON.stringify({
                requesterId: session.userId,
                tournamentId: tournamentId,
                action: 'REVOTE_TOURNAMENT'
            })
        }
    });
}

export async function getActiveTournamentsWithUserPrediction() {
    const session = await verifyUser();
    const now = new Date();

    return await prisma.tournament.findMany({
        where: {
            endDate: { gt: now } // Active tournaments
        },
        include: {
            teams: true,
            predictions: {
                where: { userId: session.userId }
            }
        }
    });
}
