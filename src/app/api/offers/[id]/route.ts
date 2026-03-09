import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const offer = await prisma.offer.findUnique({
            where: { id },
            include: {
                brand: true,
                category: true,
            },
        });

        if (!offer) {
            return NextResponse.json(
                { error: 'Offer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(offer);
    } catch (error) {
        console.error('Error fetching offer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch offer' },
            { status: 500 }
        );
    }
}
