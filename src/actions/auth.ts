'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function signup(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!username || !email || !password) {
        return { error: 'All fields are required.' };
    }

    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
        return { error: 'Username or Email already exists.' };
    }

    const hashedPassword = await hashPassword(password);

    // Check if this is the first user (make them admin if so - safety net)
    const userCount = await prisma.user.count();
    const isAdmin = userCount === 0 || email === 'swaroopbr.co@gmail.com';

    await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
            role: isAdmin ? 'ADMIN' : 'USER',
            isApproved: isAdmin, // First user/Admin is auto-approved
        },
    });

    redirect('/login?message=Account created. Please login.');
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Special Case: Lazy Create Admin if matches hardcoded credentials
            if (email === 'swaroopbr.co@gmail.com' && password === 'Me@admin04') {
                const hashedPassword = await hashPassword(password);

                // Ensure username is unique
                let username = 'Admin';
                let counter = 1;
                while (await prisma.user.findUnique({ where: { username } })) {
                    username = `Admin${counter++}`;
                }

                try {
                    const newUser = await prisma.user.create({
                        data: {
                            username,
                            email: email,
                            password: hashedPassword,
                            role: 'ADMIN',
                            isApproved: true
                        }
                    });
                    await createSession(newUser.id, newUser.role);
                } catch (innerError) {
                    console.error("Admin Creation Failed:", innerError);
                    return { error: 'Failed to auto-create admin.' };
                }
                redirect('/admin/dashboard');
            }
            return { error: 'Invalid credentials.' };
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            // If it's the admin email but wrong password, maybe we should warn specifically?
            // For now, keep generic security.
            return { error: 'Invalid credentials.' };
        }

        if (!user.isApproved) {
            return { error: 'Your account is pending Admin approval.' };
        }

        await createSession(user.id, user.role);

        if (user.role === 'ADMIN' || user.role === 'SUB_ADMIN') {
            redirect('/admin/dashboard');
        } else {
            redirect('/dashboard');
        }

    } catch (e) {
        console.error("Login Error:", e);
        if ((e as any)?.message?.includes('NEXT_REDIRECT')) {
            throw e; // Propagate redirect
        }
        return { error: 'Authentication failed: ' + (e as Error).message };
    }
}
