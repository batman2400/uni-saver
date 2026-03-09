import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT for mobile client
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, verificationStatus: user.verificationStatus },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Strip password before returning user
        const { passwordHash: _, ...userWithoutPassword } = user;

        return NextResponse.json({ token, user: userWithoutPassword }, { status: 200 });

    } catch (error: any) {
        console.error('Mobile login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
