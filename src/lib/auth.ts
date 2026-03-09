import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';

export async function getSession() {
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
