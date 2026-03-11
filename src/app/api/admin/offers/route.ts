import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
 const dynamic = 'force-dynamic';

// GET: List all offers (admin)
export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const offers = await prisma.offer.findMany({
            include: { brand: true, category: true },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(offers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}

// POST: Create new offer
export async function POST(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, discount, terms, brandId, categoryId, expiresAt, maxRedemptions } = body;

        if (!title || !description || !discount || !brandId || !categoryId) {
            return NextResponse.json(
                { error: 'Title, description, discount, brand, and category are required' },
                { status: 400 }
            );
        }

        const offer = await prisma.offer.create({
            data: {
                title,
                description,
                discount,
                terms: terms || null,
                brandId,
                categoryId,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
            },
            include: { brand: true, category: true },
        });

        return NextResponse.json(offer, { status: 201 });
    } catch (error) {
        console.error('Error creating offer:', error);
        return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
    }
}

