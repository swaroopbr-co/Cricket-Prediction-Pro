import { getAdminStats } from '@/actions/admin';

export default async function AdminDashboard() {
    const stats = await getAdminStats();

    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="glass rounded-xl p-6">
                    <h3 className="mb-2 text-lg font-bold text-[var(--primary)]">Users</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-400">{stats.pendingUsers} Pending Approval</p>
                </div>
                <div className="glass rounded-xl p-6">
                    <h3 className="mb-2 text-lg font-bold text-[var(--secondary)]">Matches</h3>
                    <p className="text-3xl font-bold">{stats.totalMatches}</p>
                    <p className="text-sm text-gray-400">{stats.liveMatches} Live Now</p>
                </div>
                <div className="glass rounded-xl p-6">
                    <h3 className="mb-2 text-lg font-bold text-pink-400">Rooms</h3>
                    <p className="text-3xl font-bold">{stats.totalRooms}</p>
                    <p className="text-sm text-gray-400">Active Groups</p>
                </div>
            </div>
        </div>
    );
}
