import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
 const dynamic = 'force-dynamic';

// GET: Get single offer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const offer = await prisma.offer.findUnique({
            where: { id },
            include: { brand: true, category: true, redemptions: { include: { user: true } } },
        });

        if (!offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }

        return NextResponse.json(offer);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 });
    }
}

// PUT: Update offer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, description, discount, terms, brandId, categoryId, expiresAt, isActive, maxRedemptions } = body;

        const offer = await prisma.offer.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(discount && { discount }),
                ...(terms !== undefined && { terms }),
                ...(brandId && { brandId }),
                ...(categoryId && { categoryId }),
                ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
                ...(isActive !== undefined && { isActive }),
                ...(maxRedemptions !== undefined && { maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null }),
            },
            include: { brand: true, category: true },
        });

        return NextResponse.json(offer);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
    }
}

// DELETE: Delete offer
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        // Delete related redemptions first
        await prisma.redemption.deleteMany({ where: { offerId: id } });
        await prisma.offer.delete({ where: { id } });

        return NextResponse.json({ message: 'Offer deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
    }
}
