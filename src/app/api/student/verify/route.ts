import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
 const dynamic = 'force-dynamic';

// Configure Cloudinary using directly injected environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;

        if (user.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Only students can verify' }, { status: 403 });
        }

        const formData = await request.formData() as any;
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

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using an upload stream
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'unisavers_student_ids' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        }) as any;

        const secureUrl = uploadResult.secure_url;

        // Update user in database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                studentIdImage: secureUrl,
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
        const session = await getSession(request);
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
