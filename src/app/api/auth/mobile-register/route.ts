import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, institutionId } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: 'STUDENT',
                verificationStatus: 'UNVERIFIED',
                institutionId: institutionId || null,
            },
        });

        // Generate JWT for mobile client
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, verificationStatus: user.verificationStatus },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Strip password before returning user
        const { passwordHash: _, ...userWithoutPassword } = user;

        return NextResponse.json({ token, user: userWithoutPassword }, { status: 201 });

    } catch (error: any) {
        console.error('Mobile registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
