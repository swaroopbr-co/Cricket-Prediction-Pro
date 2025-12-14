'use client';

import { useState, useMemo } from 'react';
import { MatchCard } from './MatchCard';
import { motion, AnimatePresence } from 'framer-motion';

export function MatchesView({ matches }: { matches: any[] }) {
    const [filter, setFilter] = useState('ALL');

    // Extract unique tournaments for filter dropdown
    const tournaments = useMemo(() => {
        const unique = new Set(matches.map(m => m.tournament.name));
        return Array.from(unique);
    }, [matches]);

    const filteredMatches = useMemo(() => {
        if (filter === 'ALL') return matches;
        return matches.filter(m => m.tournament.name === filter);
    }, [filter, matches]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="heading-gradient text-xl font-bold">Upcoming Matches</h2>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[var(--surface)] p-2 text-sm outline-none focus:border-[var(--primary)]"
                >
                    <option value="ALL">All Tournaments</option>
                    {tournaments.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode='popLayout'>
                    {filteredMatches.map((match: any) => (
                        <motion.div
                            key={match.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                        >
                            <MatchCard
                                match={match}
                                userPrediction={match.predictions[0]}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredMatches.length === 0 && (
                <div className="glass rounded-xl p-12 text-center text-gray-400">
                    No matches found for this filter.
                </div>
            )}
        </div>
    );
}
