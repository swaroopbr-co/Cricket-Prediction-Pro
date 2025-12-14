import Link from 'next/link';
import { logout } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getNotifications } from '@/actions/notification';
import { NotificationsList } from '@/components/user/NotificationsList';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const notifications = await getNotifications();

    return (
        <div className="flex min-h-screen bg-[var(--background)]">
            {/* Sidebar */}
            <aside className="fixed bottom-0 z-50 w-full border-t border-[var(--glass-border)] bg-[var(--surface)] p-2 md:relative md:h-screen md:w-64 md:border-r md:border-t-0 md:p-6">
                <div className="hidden md:block">
                    {/* Fixed single line title */}
                    <div className="mb-8">
                        <h1 className="heading-gradient text-xl font-bold whitespace-nowrap">Cricket Predictor Pro</h1>
                        <p className="text-xs text-gray-400 mt-1 ml-1">By SBR.Co</p>
                    </div>
                </div>

                <nav className="flex justify-around md:block md:space-y-2">
                    <Link href="/dashboard" className="group flex flex-col items-center rounded-lg p-2 text-gray-400 hover:bg-[var(--glass-bg)] hover:text-white md:flex-row md:gap-3 md:p-3 transition-colors">
                        <span className="text-2xl md:text-base group-hover:text-[var(--primary)]">🏠</span>
                        <span className="text-xs md:text-base">Home</span>
                    </Link>
                    <Link href="/leaderboard" className="group flex flex-col items-center rounded-lg p-2 text-gray-400 hover:bg-[var(--glass-bg)] hover:text-white md:flex-row md:gap-3 md:p-3 transition-colors">
                        <span className="text-2xl md:text-base group-hover:text-[var(--secondary)]">🏆</span>
                        <span className="text-xs md:text-base">Leaderboard</span>
                    </Link>
                    <Link href="/my-predictions" className="group flex flex-col items-center rounded-lg p-2 text-gray-400 hover:bg-[var(--glass-bg)] hover:text-white md:flex-row md:gap-3 md:p-3 transition-colors">
                        <span className="text-2xl md:text-base group-hover:text-purple-400">🔮</span>
                        <span className="text-xs md:text-base">My Predictions</span>
                    </Link>
                    <Link href="/rooms" className="group flex flex-col items-center rounded-lg p-2 text-gray-400 hover:bg-[var(--glass-bg)] hover:text-white md:flex-row md:gap-3 md:p-3 transition-colors">
                        <span className="text-2xl md:text-base group-hover:text-[var(--primary)]">👥</span>
                        <span className="text-xs md:text-base">Rooms</span>
                    </Link>

                    {/* Notification Component */}
                    <NotificationsList notifications={notifications} />

                    <form action={async () => {
                        'use server';
                        await logout();
                        redirect('/login');
                    }} className="flex flex-col items-center p-2 md:block md:w-full md:p-0">
                        <button className="group flex flex-col items-center rounded-lg text-red-400 hover:bg-red-900/40 hover:text-red-200 md:w-full md:flex-row md:gap-3 md:p-3 transition-colors">
                            <span className="text-2xl md:text-base group-hover:text-red-500">🚪</span>
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
