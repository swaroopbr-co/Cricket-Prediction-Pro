'use client';

import { adminUpdateRoom, adminDeleteRoom } from '@/actions/admin';
import { useState, useTransition } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Settings, Trash2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminRoomActionsProps {
    room: {
        id: string;
        name: string;
        type: string;
    }
}

export function AdminRoomActions({ room }: AdminRoomActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        await adminDeleteRoom(room.id);
        setIsOpen(false);
    };

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                >
                    <Settings size={16} />
                </button>
            </div>

            <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setConfirmDelete(false); }} title="Manage Room (Admin)">
                <form
                    action={(formData) => {
                        startTransition(async () => {
                            await adminUpdateRoom(
                                room.id,
                                formData.get('name') as string,
                                formData.get('type') as any
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
                        <label className="block text-sm font-medium mb-2 text-gray-300">Room Type</label>
                        <select
                            name="type"
                            defaultValue={room.type}
                            className="w-full p-3 rounded-lg bg-[var(--surface)] border border-white/10 text-white focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        >
                            <option value="PUBLIC">Public</option>
                            <option value="REQUEST">Request-to-Join</option>
                            <option value="PRIVATE">Private</option>
                        </select>
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
                                className="btn-primary px-6 py-2 flex items-center gap-2"
                            >
                                {isPending ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
