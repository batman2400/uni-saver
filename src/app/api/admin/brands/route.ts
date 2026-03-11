import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
 const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';

// GET: List all brands
export async function GET(request: NextRequest) {
    try {
        const brands = await prisma.brand.findMany({
            include: { category: true },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(brands);
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }
}

// POST: Create a new brand (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, website, categoryId } = body;

        if (!name || !categoryId) {
            return NextResponse.json(
                { error: 'Name and category are required' },
                { status: 400 }
            );
        }

        const brand = await prisma.brand.create({
            data: {
                name,
                description: description || null,
                website: website || null,
                categoryId,
            },
            include: { category: true },
        });

        return NextResponse.json(brand, { status: 201 });
    } catch (error) {
        console.error('Error creating brand:', error);
        return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
    }
}

