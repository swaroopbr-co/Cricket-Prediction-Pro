import Link from 'next/link';
import { logout } from '@/lib/session';
import { redirect } from 'next/navigation';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[var(--background)]">
            {/* Sidebar */}
            <aside className="fixed bottom-0 z-50 w-full border-t border-[var(--glass-border)] bg-[var(--surface)] p-2 md:relative md:h-screen md:w-64 md:border-r md:border-t-0 md:p-6">
                <div className="hidden md:block">
                    <h1 className="heading-gradient mb-8 text-2xl font-bold">Cricket Pro</h1>
                </div>

                <nav className="flex justify-around md:block md:space-y-2">
                    <Link href="/dashboard" className="flex flex-col items-center rounded-lg p-2 text-[var(--foreground)] hover:bg-[var(--glass-bg)] md:flex-row md:gap-3 md:p-3">
                        <span className="text-2xl md:text-base">🏠</span>
                        <span className="text-xs md:text-base">Home</span>
                    </Link>
                    <Link href="/leaderboard" className="flex flex-col items-center rounded-lg p-2 text-[var(--foreground)] hover:bg-[var(--glass-bg)] md:flex-row md:gap-3 md:p-3">
                        <span className="text-2xl md:text-base">🏆</span>
                        <span className="text-xs md:text-base">Leaderboard</span>
                    </Link>
                    <Link href="/rooms" className="flex flex-col items-center rounded-lg p-2 text-[var(--foreground)] hover:bg-[var(--glass-bg)] md:flex-row md:gap-3 md:p-3">
                        <span className="text-2xl md:text-base">👥</span>
                        <span className="text-xs md:text-base">Rooms</span>
                    </Link>
                    <form action={async () => {
                        'use server';
                        await logout();
                        redirect('/login');
                    }} className="flex flex-col items-center p-2 md:block md:w-full md:p-0">
                        <button className="flex flex-col items-center rounded-lg text-red-200 hover:bg-red-900/40 md:w-full md:flex-row md:gap-3 md:p-3">
                            <span className="text-2xl md:text-base">🚪</span>
                            <span className="text-xs md:text-base">Logout</span>
                        </button>
                    </form>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="mb-16 flex-1 p-4 md:mb-0 md:p-8">
                {children}
            </main>
        </div>
    );
}
