import { NextRequest, NextResponse } from 'next/server';
 const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const skip = (page - 1) * limit;

        const where: any = {
            isActive: true,
        };

        if (category && category !== 'all') {
            where.category = { slug: category };
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { brand: { name: { contains: search } } },
            ];
        }

        // Only show non-expired offers
        where.AND = [
            {
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
        ];

        const [offers, total] = await Promise.all([
            prisma.offer.findMany({
                where,
                include: {
                    brand: true,
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.offer.count({ where }),
        ]);

        return NextResponse.json({
            offers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch offers' },
            { status: 500 }
        );
    }
}
