import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev';

export async function getSession(req?: NextRequest) {
    // 1. Check for Mobile JWT Header
    if (req) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                return { user: decoded };
            } catch (err) {
                console.error("Invalid mobile JWT token", err);
            }
        }
    }

    // 2. Fall back to NextAuth Web Session (Cookies)
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user;
}

export async function requireAdmin() {
    const user = await requireAuth();
    if (user.role !== 'ADMIN') {
        throw new Error('Forbidden');
    }
    return user;
}

export async function requireVerifiedStudent() {
    const user = await requireAuth();
    if (user.role !== 'STUDENT') {
        throw new Error('Not a student');
    }
    if (user.verificationStatus !== 'APPROVED') {
        throw new Error('Student not verified');
    }
    return user;
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbiddenResponse() {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export function errorResponse(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status });
}
