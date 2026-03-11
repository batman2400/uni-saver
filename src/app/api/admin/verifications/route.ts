import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: List pending verifications
export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PENDING';

        const verifications = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                verificationStatus: status,
            },
            include: {
                institution: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(verifications);
    } catch (error) {
        console.error('Error fetching verifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch verifications' },
            { status: 500 }
        );
    }
}

// PATCH: Approve or reject a student
export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, action } = body;

        if (!userId || !['APPROVED', 'REJECTED'].includes(action)) {
            return NextResponse.json(
                { error: 'Valid userId and action (APPROVED/REJECTED) are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { verificationStatus: action },
        });

        return NextResponse.json({
            message: `Student ${action.toLowerCase()} successfully`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                verificationStatus: user.verificationStatus,
            },
        });
    } catch (error) {
        console.error('Error updating verification:', error);
        return NextResponse.json(
            { error: 'Failed to update verification' },
            { status: 500 }
        );
    }
}
