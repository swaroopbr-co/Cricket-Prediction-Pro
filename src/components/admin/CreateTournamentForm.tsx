'use client';

import { createTournament } from '@/actions/match';
import { useTransition, useRef } from 'react';

export function CreateTournamentForm() {
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <form
            ref={formRef}
            action={(formData) => {
                startTransition(() => {
                    createTournament(formData);
                    formRef.current?.reset();
                });
            }}
            className="space-y-4"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium">Tournament Name</label>
                    <input name="name" required className="w-full rounded bg-[var(--background)] p-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Type</label>
                    <select name="type" className="w-full rounded bg-[var(--background)] p-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]">
                        <option value="T20">T20</option>
                        <option value="ODI">ODI</option>
                        <option value="TEST">TEST</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Start Date</label>
                    <input type="date" name="startDate" required className="w-full rounded bg-[var(--background)] p-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">End Date</label>
                    <input type="date" name="endDate" required className="w-full rounded bg-[var(--background)] p-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
                </div>
            </div>
            <button disabled={isPending} type="submit" className="rounded bg-[var(--primary)] px-4 py-2 font-bold text-black hover:bg-[var(--primary-variant)]">
                {isPending ? 'Creating...' : 'Create Tournament'}
            </button>
        </form>
    );
}
