'use client';

import { updateRoom, deleteRoom } from '@/actions/room';
import { useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Users, Lock, UserPlus, Settings, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditRoomModalProps {
    room: {
        id: string;
        name: string;
        type: string;
    }
}

export function EditRoomModal({ room }: EditRoomModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [privacy, setPrivacy] = useState<'PUBLIC' | 'REQUEST' | 'PRIVATE'>(room.type as any);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        await deleteRoom(room.id);
        router.push('/rooms');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
                <Settings size={14} />
                Manage Room
            </button>

            <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setConfirmDelete(false); }} title="Manage Room">
                <form
                    action={(formData) => {
                        startTransition(async () => {
                            await updateRoom(
                                room.id,
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
                            defaultValue={room.name}
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
                    </div>

                    <div className="flex justify-between border-t border-white/5 pt-6">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${confirmDelete
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'text-red-400 hover:bg-red-500/10'
                                }`}
                        >
                            <Trash2 size={16} />
                            {confirmDelete ? 'Confirm Delete?' : 'Delete Room'}
                        </button>

                        <div className="flex gap-3">
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
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
