import { getAdminStats, getUsers, getRooms } from '@/actions/admin';
import { sendNotification } from '@/actions/notification';

export default async function AdminDashboard() {
    const stats = await getAdminStats();
    const users = await getUsers();
    const rooms = await getRooms();

    async function handleSendNotification(formData: FormData) {
        'use server';
        const target = formData.get('target') as string;
        const title = formData.get('title') as string;
        const message = formData.get('message') as string;
        const type = formData.get('type') as string;

        await sendNotification(target, title, message, type);
    }

    return (
        <div>
            <h1 className="heading-gradient mb-8 text-3xl font-bold">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <div className="glass p-6 rounded-xl">
                    <h3 className="text-gray-400 text-sm mb-1">Total Users</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers} <span className="text-sm text-gray-500 font-normal">({stats.pendingUsers} pending)</span></p>
                </div>
                <div className="glass p-6 rounded-xl">
                    <h3 className="text-gray-400 text-sm mb-1">Matches</h3>
                    <p className="text-3xl font-bold text-[var(--primary)]">{stats.totalMatches} <span className="text-sm text-gray-500 font-normal">({stats.liveMatches} live)</span></p>
                </div>
                <div className="glass p-6 rounded-xl">
                    <h3 className="text-gray-400 text-sm mb-1">Active Rooms</h3>
                    <p className="text-3xl font-bold text-[var(--secondary)]">{stats.totalRooms}</p>
                </div>
            </div>

            {/* Notification Center */}
            <div className="glass p-6 rounded-xl mb-8">
                <h2 className="text-xl font-bold mb-4">📢 Notification Center</h2>
                <form action={handleSendNotification} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <select name="target" className="p-3 rounded bg-[var(--surface)] border border-white/10" required>
                            <option value="ALL">Broadcast to All Users</option>
                            <optgroup label="Specific Room">
                                {rooms.map(r => <option key={r.id} value={`ROOM:${r.id}`}>Room: {r.name}</option>)}
                            </optgroup>
                            <optgroup label="Specific User">
                                {users.map(u => <option key={u.id} value={`USER:${u.id}`}>User: {u.username}</option>)}
                            </optgroup>
                        </select>
                        <select name="type" className="p-3 rounded bg-[var(--surface)] border border-white/10" required>
                            <option value="INFO">Information (Blue)</option>
                            <option value="WARNING">Warning (Yellow)</option>
                            <option value="SUCCESS">Success (Green)</option>
                            <option value="URGENT">Urgent (Red)</option>
                        </select>
                    </div>
                    <input name="title" placeholder="Notification Title" className="w-full p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    <textarea name="message" placeholder="Message content..." rows={3} className="w-full p-3 rounded bg-[var(--surface)] border border-white/10" required />
                    <button className="btn-primary w-full md:w-auto">Send Notification</button>
                </form>
            </div>
        </div>
    );
}
