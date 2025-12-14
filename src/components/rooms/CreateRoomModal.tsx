'use client';

import { createRoom } from '@/actions/room';
import { useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Users, Lock, UserPlus } from 'lucide-react';

export function CreateRoomModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [privacy, setPrivacy] = useState<'PUBLIC' | 'REQUEST' | 'PRIVATE'>('PUBLIC');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-primary flex items-center gap-2"
            >
                <Users size={16} />
                Create Room
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Room">
                <form
                    action={(formData) => {
                        startTransition(async () => {
                            await createRoom(
                                formData.get('name') as string,
                                privacy
                            );
                            setIsOpen(false);
                        });
                    }}
                    className="space-y-6"
                >
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Room Name</label>
                        <input
                            name="name"
                            required
                            placeholder="e.g. Office League 2025"
                            className="w-full p-3 rounded-lg bg-[var(--surface)] border border-white/10 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">Privacy Setting</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setPrivacy('PUBLIC')}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${privacy === 'PUBLIC'
                                        ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Users size={20} />
                                <span className="text-xs font-bold">Public</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPrivacy('REQUEST')}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${privacy === 'REQUEST'
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <UserPlus size={20} />
                                <span className="text-xs font-bold">Request</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPrivacy('PRIVATE')}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${privacy === 'PRIVATE'
                                        ? 'bg-red-500/20 border-red-500 text-red-400'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Lock size={20} />
                                <span className="text-xs font-bold">Private</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            {privacy === 'PUBLIC' && "Anyone can see and join this room instantly."}
                            {privacy === 'REQUEST' && "Visible to everyone, but admin must approve new members."}
                            {privacy === 'PRIVATE' && "Hidden from the list. Members must be invited manually."}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isPending}
                            type="submit"
                            className="btn-primary px-6 py-2"
                        >
                            {isPending ? 'Creating...' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
