'use client';

import { approveUser, deleteUser, toggleRole } from '@/actions/admin';
import { useTransition, useState } from 'react';
import EditUserModal from './EditUserModal';

export function ActionButtons({ user }: { user: any }) {
    const [isPending, startTransition] = useTransition();
    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <div className="flex gap-2">
            {!user.isApproved && (
                <button
                    disabled={isPending}
                    onClick={() => startTransition(() => approveUser(user.id))}
                    className="rounded bg-green-900/40 px-3 py-1 text-sm text-green-300 hover:bg-green-900/60"
                >
                    Approve
                </button>
            )}

            <button
                onClick={() => setShowEditModal(true)}
                className="rounded bg-gray-700 px-3 py-1 text-sm text-gray-200 hover:bg-gray-600"
            >
                Edit
            </button>

            <button
                disabled={isPending}
                onClick={() => startTransition(() => {
                    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
                    if (confirm(`Change role to ${nextRole}?`)) toggleRole(user.id, nextRole);
                })}
                className="rounded bg-blue-900/40 px-3 py-1 text-sm text-blue-300 hover:bg-blue-900/60"
            >
                {user.role}
            </button>

            <button
                disabled={isPending}
                onClick={() => startTransition(() => {
                    if (confirm('Delete user?')) deleteUser(user.id);
                })}
                className="rounded bg-red-900/40 px-3 py-1 text-sm text-red-300 hover:bg-red-900/60"
            >
                Delete
            </button>

            {showEditModal && (
                <EditUserModal user={user} onClose={() => setShowEditModal(false)} />
            )}
        </div>
    );
}
