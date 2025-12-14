import { getRooms, createRoom, addMemberToRoom, removeMemberFromRoom } from '@/actions/admin';
import { prisma } from '@/lib/prisma';
import { UserMinus, UserPlus } from 'lucide-react';

export default async function AdminRoomsPage() {
    const rooms = await getRooms();
    const users = await prisma.user.findMany({ orderBy: { username: 'asc' } });

    async function handleCreate(formData: FormData) {
        'use server';
        const name = formData.get('name') as string;
        const members = formData.getAll('members') as string[];
        await createRoom(name, members);
    }

    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">Room Management</h1>

            <div className="glass mb-8 p-6 rounded-xl">
                <h2 className="text-lg font-bold mb-4">Create New Room</h2>
                <form action={handleCreate} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Room Name"
                        required
                        className="w-full rounded-lg bg-[var(--surface)] p-3 border border-[var(--glass-border)] focus:outline-none focus:border-[var(--secondary)]"
                    />
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Initial Members (Hold Cmd/Ctrl to select multiple)</label>
                        <select
                            name="members"
                            multiple
                            className="w-full h-32 rounded-lg bg-[var(--surface)] p-2 border border-[var(--glass-border)] text-sm"
                        >
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn-primary w-full md:w-auto">
                        Create Room
                    </button>
                </form>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                    <div key={room.id} className="glass p-6 rounded-xl flex flex-col h-full">
                        <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                        <p className="text-xs text-gray-500 mb-4">ID: {room.id}</p>

                        <div className="flex-1 overflow-y-auto max-h-40 space-y-2 mb-4 pr-1 scrollbar-hide">
                            <h4 className="text-xs font-bold text-gray-400 sticky top-0 bg-black/80 backdrop-blur p-1 z-10">
                                Members ({room._count.members})
                            </h4>
                            {room.members.map((m: any) => (
                                <div key={m.userId} className="flex justify-between items-center text-sm bg-white/5 p-2 rounded">
                                    <span>{m.user.username}</span>
                                    <form action={async () => {
                                        'use server';
                                        await removeMemberFromRoom(room.id, m.userId);
                                    }}>
                                        <button className="text-red-400 hover:text-red-300"><UserMinus size={14} /></button>
                                    </form>
                                </div>
                            ))}
                        </div>

                        <form action={async (formData) => {
                            'use server';
                            const userId = formData.get('userId') as string;
                            if (userId) await addMemberToRoom(room.id, userId);
                        }} className="mt-auto flex gap-2">
                            <select
                                name="userId"
                                className="flex-1 rounded bg-black/30 p-2 text-sm border border-white/10"
                                required
                            >
                                <option value="">Add User...</option>
                                {users.filter(u => !room.members.some((m: any) => m.userId === u.id)).map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                            <button type="submit" className="bg-[var(--primary)] text-black p-2 rounded hover:bg-[var(--primary-variant)]">
                                <UserPlus size={16} />
                            </button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
}
