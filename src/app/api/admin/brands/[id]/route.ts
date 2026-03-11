import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
 const dynamic = 'force-dynamic';

// GET: Get single brand
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const brand = await prisma.brand.findUnique({
            where: { id },
            include: { category: true, offers: true },
        });

        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }

        return NextResponse.json(brand);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
    }
}

// PUT: Update brand (admin only)
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
        const { name, description, website, categoryId } = body;

        const brand = await prisma.brand.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(website !== undefined && { website }),
                ...(categoryId && { categoryId }),
            },
            include: { category: true },
        });

        return NextResponse.json(brand);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
    }
}

// DELETE: Delete brand (admin only)
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

        // Check if brand has offers
        const offers = await prisma.offer.count({ where: { brandId: id } });
        if (offers > 0) {
            return NextResponse.json(
                { error: 'Cannot delete brand with existing offers. Delete offers first.' },
                { status: 400 }
            );
        }

        await prisma.brand.delete({ where: { id } });

        return NextResponse.json({ message: 'Brand deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
    }
}
