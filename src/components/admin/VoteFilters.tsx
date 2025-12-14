'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

interface VoteFiltersProps {
    tournaments: { id: string; name: string }[];
    rooms: { id: string; name: string }[];
}

export function VoteFilters({ tournaments, rooms }: VoteFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial state from URL
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [debouncedSearch] = useDebounce(search, 500);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    useEffect(() => {
        // Only push if the search param in URL is different from debounced value
        // to avoid loops or unnecessary pushes on load
        if (debouncedSearch !== (searchParams.get('search') || '')) {
            router.push('?' + createQueryString('search', debouncedSearch));
        }
    }, [debouncedSearch, router, createQueryString, searchParams]);

    const handleFilterChange = (key: string, value: string) => {
        router.push('?' + createQueryString(key, value));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* User Search */}
            <div>
                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Search User</label>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Username..."
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--primary)]"
                />
            </div>

            {/* Tournament Filter */}
            <div>
                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Tournament</label>
                <select
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--primary)] [&>option]:bg-gray-900"
                    value={searchParams.get('tournamentId') || ''}
                    onChange={(e) => handleFilterChange('tournamentId', e.target.value)}
                >
                    <option value="">All Tournaments</option>
                    {tournaments.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Room Filter */}
            <div>
                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Room</label>
                <select
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--primary)] [&>option]:bg-gray-900"
                    value={searchParams.get('roomId') || ''}
                    onChange={(e) => handleFilterChange('roomId', e.target.value)}
                >
                    <option value="">All Rooms</option>
                    {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
