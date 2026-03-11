import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
 const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;

        if (user.verificationStatus !== 'APPROVED') {
            return NextResponse.json(
                { error: 'Your student ID must be verified before redeeming offers. Please upload your student ID for verification.' },
                { status: 403 }
            );
        }

        const { id: offerId } = await params;

        const offer = await prisma.offer.findUnique({
            where: { id: offerId },
            include: { brand: true },
        });

        if (!offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }

        if (!offer.isActive) {
            return NextResponse.json({ error: 'This offer is no longer active' }, { status: 400 });
        }

        if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'This offer has expired' }, { status: 400 });
        }

        if (offer.maxRedemptions && offer.currentRedemptions >= offer.maxRedemptions) {
            return NextResponse.json({ error: 'This offer has reached its maximum redemptions' }, { status: 400 });
        }

        // Check if user already redeemed this offer
        const existingRedemption = await prisma.redemption.findFirst({
            where: {
                offerId,
                userId: user.id,
            },
        });

        if (existingRedemption) {
            return NextResponse.json({
                message: 'You have already redeemed this offer',
                redemption: {
                    promoCode: existingRedemption.promoCode,
                    redeemedAt: existingRedemption.redeemedAt,
                },
            });
        }

        // Generate unique promo code
        const promoCode = `UNI-${offer.brand.name.substring(0, 3).toUpperCase()}-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Create redemption and update offer count
        const [redemption] = await prisma.$transaction([
            prisma.redemption.create({
                data: {
                    offerId,
                    userId: user.id,
                    promoCode,
                },
            }),
            prisma.offer.update({
                where: { id: offerId },
                data: { currentRedemptions: { increment: 1 } },
            }),
        ]);

        return NextResponse.json({
            message: 'Offer redeemed successfully!',
            redemption: {
                promoCode: redemption.promoCode,
                redeemedAt: redemption.redeemedAt,
                offerTitle: offer.title,
                brandName: offer.brand.name,
            },
        });
    } catch (error) {
        console.error('Redemption error:', error);
        return NextResponse.json(
            { error: 'Failed to redeem offer' },
            { status: 500 }
        );
    }
}
