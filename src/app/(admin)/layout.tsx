import Link from 'next/link';
import { logout } from '@/lib/session';
import { redirect } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[var(--background)]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[var(--glass-border)] bg-[var(--surface)] p-6">
                <h1 className="heading-gradient mb-8 text-2xl font-bold">Admin Panel</h1>

                <nav className="space-y-2">
                    <Link
                        href="/admin/dashboard"
                        className="block rounded-lg p-3 text-[var(--foreground)] hover:bg-[var(--glass-bg)]"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/users"
                        className="block rounded-lg p-3 text-[var(--foreground)] hover:bg-[var(--glass-bg)]"
                    >
                        User Management
                    </Link>
                    <Link
                        href="/admin/matches"
                        className="block rounded-lg p-3 text-[var(--foreground)] hover:bg-[var(--glass-bg)]"
                    >
                        Matches & Tournaments
                    </Link>
                    <Link
                        href="/admin/rooms"
                        className="block rounded-lg p-3 text-[var(--foreground)] hover:bg-[var(--glass-bg)]"
                    >
                        Rooms
                    </Link>
                </nav>

                <div className="mt-12">
                    <form action={async () => {
                        'use server';
                        await logout();
                        redirect('/login');
                    }}>
                        <button className="w-full rounded-lg bg-red-900/20 p-3 text-red-200 hover:bg-red-900/40">
                            Logout
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
