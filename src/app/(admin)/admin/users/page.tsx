import { getUsers } from '@/actions/admin';
import { ActionButtons } from '@/components/admin/UserActions';

export default async function UsersPage() {
    const allUsers = await getUsers();

    const admins = allUsers.filter(u => u.role === 'ADMIN' || u.role === 'SUB_ADMIN');
    const regularUsers = allUsers.filter(u => u.role === 'USER');

    const UserTable = ({ users, title }: { users: typeof allUsers, title: string }) => (
        <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-[var(--primary)]">{title}</h2>
            <div className="glass overflow-hidden rounded-xl">
                <table className="w-full text-left text-sm text-[var(--foreground)]">
                    <thead className="bg-[var(--glass-bg)] text-xs uppercase text-[var(--secondary)]">
                        <tr>
                            <th className="px-6 py-3">Username</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--glass-border)]">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-[var(--glass-bg)]">
                                <td className="px-6 py-4">{user.username}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.isApproved ? (
                                        <span className="inline-flex rounded-full bg-green-900/30 px-2 text-xs font-semibold leading-5 text-green-200">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-yellow-900/30 px-2 text-xs font-semibold leading-5 text-yellow-200">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">{user.role}</td>
                                <td className="px-6 py-4">
                                    <ActionButtons user={user} />
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">User Management</h1>
            <UserTable users={admins} title="Administrators" />
            <UserTable users={regularUsers} title="Players" />
        </div>
    );
}
