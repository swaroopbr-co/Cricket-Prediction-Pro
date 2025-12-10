import { getUsers } from '@/actions/admin';
import { ActionButtons } from '@/components/admin/UserActions';

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">User Management</h1>

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
                    </tbody>
                </table>
            </div>
        </div>
    );
}
