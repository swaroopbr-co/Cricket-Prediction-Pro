import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session');
    let session = null;

    if (sessionCookie) {
        try {
            session = await decrypt(sessionCookie.value);
        } catch (e) {
            // Invalid session
        }
    }

    const { pathname } = request.nextUrl;

    // 1. Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // 2. Protect App Routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/leaderboard') || pathname.startsWith('/profile')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 3. Redirect authenticated users away from auth pages
    if (session && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
