export default function AdminDashboard() {
    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="glass rounded-xl p-6">
                    <h3 className="mb-2 text-lg font-bold text-[var(--primary)]">Users</h3>
                    <p className="text-3xl font-bold">Manage</p>
                    <p className="text-sm text-gray-400">Approve and manage user roles</p>
                </div>
                <div className="glass rounded-xl p-6">
                    <h3 className="mb-2 text-lg font-bold text-[var(--secondary)]">Matches</h3>
                    <p className="text-3xl font-bold">Schedule</p>
                    <p className="text-sm text-gray-400">Create matches and update scores</p>
                </div>
                <div className="glass rounded-xl p-6">
                    <h3 className="mb-2 text-lg font-bold text-pink-400">Rooms</h3>
                    <p className="text-3xl font-bold">Groups</p>
                    <p className="text-sm text-gray-400">Manage private prediction rooms</p>
                </div>
            </div>
        </div>
    );
}
