import { getRooms, joinRoom } from '@/actions/room';
import { getSession } from '@/lib/session';
import Link from 'next/link';

export default async function RoomsPage() {
    const session = await getSession();
    // Re-use logic: fetch all rooms, mark which ones I've joined
    // But for now let's just show all rooms and Join button.
    const rooms = await getRooms((session as any).userId);

    async function handleJoin(formData: FormData) {
        'use server';
        const roomId = formData.get('roomId') as string;
        await joinRoom(roomId);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="heading-gradient text-2xl font-bold">Groups & Rooms</h1>
                {(session as any)?.role === 'ADMIN' && <button className="btn-primary">+ Create Room</button>}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room: any) => (
                    <div key={room.id} className="glass p-6 rounded-xl relative group transition hover:border-[var(--primary)]/30 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <Link href={`/rooms/${room.id}`} className="hover:text-[var(--primary)] transition-colors">
                                    <h3 className="text-xl font-bold">{room.name}</h3>
                                </Link>
                                {room.isMember ? (
                                    <span className="text-xs bg-green-900/40 text-green-300 px-2 py-1 rounded">Joined</span>
                                ) : (
                                    <form action={handleJoin}>
                                        <input type="hidden" name="roomId" value={room.id} />
                                        <button className="text-xs bg-[var(--primary)] text-black px-3 py-1 rounded font-bold hover:bg-[var(--primary-variant)]">
                                            Join
                                        </button>
                                    </form>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 border-t border-white/5 pt-4">
                                {room._count.members} Members
                            </p>
                        </div>
                        <Link href={`/rooms/${room.id}`} className="mt-4 text-xs text-gray-500 hover:text-white flex items-center gap-1 group-hover/link:translate-x-1 transition-all">
                            View Room <span className="text-[var(--primary)]">&rarr;</span>
                        </Link>
                    </div>
                ))}
                {rooms.length === 0 && (
                    <p className="text-gray-500 col-span-full text-center py-8">No active rooms. Create one?</p>
                )}
            </div>
        </div>
    );
}
