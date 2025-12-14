'use client';

import { useState, useTransition } from 'react';
import { handleRevoteRequest } from '@/actions/admin';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/lib/format';

type Request = {
    id: string;
    user: {
        username: string;
        email: string;
    };
    title: string;
    message: string;
    createdAt: Date;
    metadata: string | null;
};

export default function RevoteRequests({ requests }: { requests: Request[] }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    if (requests.length === 0) {
        return (
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <h2 className="text-xl font-bold mb-4">Revote Requests</h2>
                <p className="text-gray-400">No pending requests.</p>
            </div>
        );
    }

    const onHandle = (id: string, approved: boolean) => {
        startTransition(async () => {
            try {
                await handleRevoteRequest(id, approved);
                // Router refresh handled by revalidatePath in action, but explicit refresh ensures client update
                // router.refresh(); 
            } catch (e) {
                console.error(e);
                alert('Failed to process request');
            }
        });
    };

    return (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
            <h2 className="text-xl font-bold mb-4">Revote Requests</h2>
            <div className="space-y-4">
                {requests.map((req: any) => (
                    <div key={req.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 p-4 rounded-lg border border-white/5">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-white text-lg">{req.user.username}</p>
                                <span className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded">
                                    {formatDateTime(req.createdAt)}
                                </span>
                            </div>

                            {req.tournamentName && req.tournamentName !== 'Unknown Tournament' && (
                                <p className="text-[var(--primary)] font-medium text-sm mb-1">
                                    Tournament: {req.tournamentName}
                                </p>
                            )}

                            <p className="text-sm text-gray-300">{req.message}</p>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0 md:ml-6 shrink-0">
                            <button
                                onClick={() => onHandle(req.id, true)}
                                disabled={isPending}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => {
                                    startTransition(async () => {
                                        try {
                                            await import('@/actions/admin').then(mod => mod.ignoreRevoteRequest(req.id));
                                        } catch (e) {
                                            console.error(e);
                                            alert('Failed to ignore request');
                                        }
                                    });
                                }}
                                disabled={isPending}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                            >
                                Ignore
                            </button>
                            <button
                                onClick={() => onHandle(req.id, false)}
                                disabled={isPending}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
