'use client';

import { createMatch } from '@/actions/match';
import { useTransition, useRef, useState } from 'react';

export function AddMatchForm({ tournamentId }: { tournamentId: string }) {
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="rounded bg-[var(--surface)] px-3 py-1 text-sm hover:bg-white/10"
            >
                Add Match
            </button>
        );
    }

    return (
        <div className="mt-4 rounded border border-[var(--glass-border)] p-4">
            <h4 className="mb-2 text-sm font-bold">New Match</h4>
            <form
                ref={formRef}
                action={(formData) => {
                    startTransition(() => {
                        createMatch(tournamentId, formData);
                        formRef.current?.reset();
                        setIsOpen(false);
                    });
                }}
                className="space-y-3"
            >
                <div className="flex gap-2">
                    <input name="teamA" placeholder="Team A" required className="w-full rounded bg-[var(--background)] p-2 text-sm" />
                    <span className="self-center">vs</span>
                    <input name="teamB" placeholder="Team B" required className="w-full rounded bg-[var(--background)] p-2 text-sm" />
                </div>
                <div>
                    <input type="datetime-local" name="date" required className="w-full rounded bg-[var(--background)] p-2 text-sm" />
                </div>
                <div className="flex gap-2">
                    <button disabled={isPending} type="submit" className="rounded bg-[var(--primary)] px-3 py-1 text-sm text-black">
                        {isPending ? 'Adding...' : 'Save Match'}
                    </button>
                    <button type="button" onClick={() => setIsOpen(false)} className="rounded px-3 py-1 text-sm text-gray-400">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
