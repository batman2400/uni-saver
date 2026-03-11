import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
 const dynamic = 'force-dynamic';

// GET: List notifications for the current user
export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;

        const notifications = await prisma.userNotification.findMany({
            where: { userId: user.id },
            include: { notification: true },
            orderBy: { notification: { createdAt: 'desc' } },
            take: 50,
        });

        const unreadCount = await prisma.userNotification.count({
            where: { userId: user.id, read: false },
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// PATCH: Mark notification as read
export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId } = body;

        if (notificationId === 'all') {
            // Mark all as read
            await prisma.userNotification.updateMany({
                where: { userId: (session.user as any).id, read: false },
                data: { read: true, readAt: new Date() },
            });
        } else {
            await prisma.userNotification.update({
                where: { id: notificationId },
                data: { read: true, readAt: new Date() },
            });
        }

        return NextResponse.json({ message: 'Marked as read' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}

