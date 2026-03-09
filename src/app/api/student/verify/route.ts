import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;

        if (user.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Only students can verify' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('studentId') as File;

        if (!file) {
            return NextResponse.json({ error: 'Student ID image is required' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Save file
        const uploadDir = path.join(process.cwd(), 'uploads', 'student-ids');
        await mkdir(uploadDir, { recursive: true });

        const ext = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);

        const bytes = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                studentIdImage: `/uploads/student-ids/${fileName}`,
                verificationStatus: 'PENDING',
            },
        });

        return NextResponse.json({
            message: 'Student ID uploaded successfully. Your verification is pending admin review.',
            status: 'PENDING',
        });
    } catch (error) {
        console.error('Verification upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload student ID' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: {
                verificationStatus: true,
                studentIdImage: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching verification status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch verification status' },
            { status: 500 }
        );
    }
}
