import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Total counts
        const [totalUsers, totalOffers, totalRedemptions, totalBrands] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.offer.count(),
            prisma.redemption.count(),
            prisma.brand.count(),
        ]);

        // Active offers
        const activeOffers = await prisma.offer.count({ where: { isActive: true } });

        // Pending verifications
        const pendingVerifications = await prisma.user.count({
            where: { verificationStatus: 'PENDING' },
        });

        // Redemptions by category
        const redemptionsByCategory = await prisma.redemption.groupBy({
            by: ['offerId'],
            _count: { id: true },
        });

        // Get category data for each redemption group
        const categoryData: Record<string, number> = {};
        for (const r of redemptionsByCategory) {
            const offer = await prisma.offer.findUnique({
                where: { id: r.offerId },
                include: { category: true },
            });
            if (offer) {
                categoryData[offer.category.name] = (categoryData[offer.category.name] || 0) + r._count.id;
            }
        }

        // Redemptions over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRedemptions = await prisma.redemption.findMany({
            where: { redeemedAt: { gte: thirtyDaysAgo } },
            select: { redeemedAt: true },
            orderBy: { redeemedAt: 'asc' },
        });

        // Group by date
        const redemptionsOverTime: Record<string, number> = {};
        for (const r of recentRedemptions) {
            const date = r.redeemedAt.toISOString().split('T')[0];
            redemptionsOverTime[date] = (redemptionsOverTime[date] || 0) + 1;
        }

        // Top redeemed offers
        const topOffers = await prisma.offer.findMany({
            orderBy: { currentRedemptions: 'desc' },
            take: 5,
            include: { brand: true },
        });

        return NextResponse.json({
            overview: {
                totalUsers,
                totalOffers,
                activeOffers,
                totalRedemptions,
                totalBrands,
                pendingVerifications,
            },
            redemptionsByCategory: categoryData,
            redemptionsOverTime,
            topOffers,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}

