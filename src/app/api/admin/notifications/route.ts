import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get notification history
export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });

        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// POST: Send notification to all students
export async function POST(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { title, message } = body;

        if (!title || !message) {
            return NextResponse.json(
                { error: 'Title and message are required' },
                { status: 400 }
            );
        }

        // Create notification
        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                sentBy: (session.user as any).id,
            },
        });

        // Get all students
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: { id: true },
        });

        // Create UserNotification for each student
        if (students.length > 0) {
            await prisma.userNotification.createMany({
                data: students.map((student) => ({
                    notificationId: notification.id,
                    userId: student.id,
                })),
            });
        }

        return NextResponse.json({
            message: `Notification sent to ${students.length} students`,
            notification,
        }, { status: 201 });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}

