import { getRooms, createRoom } from '@/actions/admin';
import { revalidatePath } from 'next/cache';

export default async function AdminRoomsPage() {
    const rooms = await getRooms();

    async function handleCreate(formData: FormData) {
        'use server';
        const name = formData.get('name') as string;
        await createRoom(name);
        revalidatePath('/admin/rooms');
    }

    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">Room Management</h1>

            <div className="glass mb-8 p-6 rounded-xl">
                <h2 className="text-lg font-bold mb-4">Create New Room</h2>
                <form action={handleCreate} className="flex gap-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Room Name"
                        required
                        className="flex-1 rounded-lg bg-[var(--surface)] p-3 border border-[var(--glass-border)] focus:outline-none focus:border-[var(--secondary)]"
                    />
                    <button type="submit" className="btn-primary">
                        Create Room
                    </button>
                </form>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                    <div key={room.id} className="glass p-6 rounded-xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                        <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                            <span>Members: {room._count.members}</span>
                            <span>ID: {room.id.slice(0, 8)}...</span>
                        </div>
                    </div>
                ))}
                {rooms.length === 0 && (
                    <p className="text-gray-500 col-span-full text-center py-8">No rooms created yet.</p>
                )}
            </div>
        </div>
    );
}
