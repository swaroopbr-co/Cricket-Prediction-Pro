import { getTournaments } from '@/actions/match';
import { CreateTournamentForm } from '@/components/admin/CreateTournamentForm';
import { CreateMatchForm } from '@/components/admin/CreateMatchForm';
import { EditTournamentModal } from '@/components/admin/EditTournamentModal';
import { EditMatchModal } from '@/components/admin/EditMatchModal';
import { TournamentAccordion } from '@/components/admin/TournamentAccordion';
import { createTournament, createMatch, deleteTournament, deleteMatch, publishTournamentWinner } from '@/actions/admin';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminMatchesPage() {
    const tournaments = await prisma.tournament.findMany({
        include: { matches: true, teams: true },
        orderBy: { startDate: 'desc' }
    });
    const matches = await prisma.match.findMany({
        include: { tournament: { include: { teams: true } } },
        orderBy: { date: 'desc' }
    });

    // ... existing handlers ...

    async function handleCreateMatch(formData: FormData) {
        'use server';
        await createMatch(
            formData.get('tournamentId') as string,
            parseInt(formData.get('number') as string) || 0,
            formData.get('teamA') as string,
            formData.get('teamB') as string,
            formData.get('date') as string
        );
    }

    // Mapping for cleaner tournament usage in CreateMatchForm and EditMatch logic
    const tournamentList = tournaments.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        teams: t.teams
    }));

    return (
        <div className="space-y-8">
            <h1 className="heading-gradient text-2xl font-bold">Match & Tournament Center</h1>

            {/* Tournament Creation */}
            <div className="glass p-6 rounded-xl relative group">
                <CreateTournamentForm />
            </div>

            {/* Match Creation */}
            <CreateMatchForm tournaments={tournamentList} />

            <h2 className="text-xl font-bold">Active Tournaments</h2>

            <div className="space-y-4">
                {tournaments.map((t: any) => (
                    <TournamentAccordion
                        key={t.id}
                        tournament={t}
                        tournamentList={tournamentList}
                    />
                ))}
            </div>

            {tournaments.length === 0 && <p className="text-gray-500">No tournaments found.</p>}
        </div>
    );
}
