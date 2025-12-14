'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export function LeaderboardFilters({ tournaments, matches }: { tournaments: any[], matches: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentTournament = searchParams.get('tournamentId') || 'ALL';
    const currentMatch = searchParams.get('matchId') || 'ALL';

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === 'ALL') {
            params.delete(key);
        } else {
            params.set(key, value);
            // Reset match if tournament changes
            if (key === 'tournamentId') {
                params.delete('matchId');
            }
        }
        router.push(`/leaderboard?${params.toString()}`);
    };

    // Filter matches based on selected tournament
    const filteredMatches = useMemo(() => {
        if (currentTournament === 'ALL') return matches;
        return matches.filter(m => m.tournamentId === currentTournament);
    }, [currentTournament, matches]);

    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <select
                value={currentTournament}
                onChange={(e) => handleFilterChange('tournamentId', e.target.value)}
                className="rounded-lg border border-white/10 bg-[var(--surface)] p-2 text-sm text-white outline-none focus:border-[var(--primary)]"
            >
                <option value="ALL">All Tournaments</option>
                {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>

            <select
                value={currentMatch}
                onChange={(e) => handleFilterChange('matchId', e.target.value)}
                className="rounded-lg border border-white/10 bg-[var(--surface)] p-2 text-sm text-white outline-none focus:border-[var(--primary)]"
            >
                <option value="ALL">All Matches</option>
                {filteredMatches.map(m => (
                    <option key={m.id} value={m.id}>{m.teamA} vs {m.teamB}</option>
                ))}
            </select>
        </div>
    );
}
