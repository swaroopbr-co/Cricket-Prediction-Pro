'use client';

import { useState, useTransition } from 'react';
import { updateUserCredentials } from '@/actions/admin';

export default function EditUserModal({ user, onClose }: { user: any, onClose: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState('');

    const handleSave = () => {
        startTransition(async () => {
            await updateUserCredentials(user.id, username, password);
            onClose();
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass w-full max-w-md p-6">
                <h2 className="mb-4 text-xl font-bold">Edit User: {user.username}</h2>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm">New Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded bg-white/5 p-2 text-white border border-white/10"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Reset Password (Optional)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full rounded bg-white/5 p-2 text-white border border-white/10"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded px-4 py-2 hover:bg-white/10">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="rounded bg-[var(--primary)] px-4 py-2 text-black font-bold hover:bg-[var(--primary-variant)]"
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
