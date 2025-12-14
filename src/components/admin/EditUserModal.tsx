'use client';

import { useState, useTransition } from 'react';
import { updateUserCredentials } from '@/actions/admin';

import { createPortal } from 'react-dom';

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

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-md p-6 border border-white/10 shadow-2xl shadow-[var(--primary)]/10">
                <h2 className="mb-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                    Edit User: {user.username}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">New Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded bg-white/5 p-3 text-white border border-white/10 focus:border-[var(--primary)] focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">Reset Password (Optional)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full rounded bg-white/5 p-3 text-white border border-white/10 focus:border-[var(--primary)] focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded px-4 py-2 text-sm hover:bg-white/10 transition">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-black font-bold hover:bg-[var(--primary-variant)] transition disabled:opacity-50"
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
