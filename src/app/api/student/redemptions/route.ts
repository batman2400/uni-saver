import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
 const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;

        if (user.role !== 'STUDENT' && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Not a student' }, { status: 403 });
        }

        const redemptions = await prisma.redemption.findMany({
            where: { userId: user.id },
            include: {
                offer: {
                    include: {
                        brand: true,
                        category: true,
                    },
                },
            },
            orderBy: { redeemedAt: 'desc' },
        });

        return NextResponse.json(redemptions);
    } catch (error) {
        console.error('Error fetching redemptions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch redemptions' },
            { status: 500 }
        );
    }
}
