import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { institution: true },
                });

                if (!user) {
                    throw new Error('Invalid email or password');
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) {
                    throw new Error('Invalid email or password');
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    verificationStatus: user.verificationStatus,
                    emailVerified: user.emailVerified,
                    institutionName: user.institution?.name || null,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.verificationStatus = (user as any).verificationStatus;
                token.emailVerified = (user as any).emailVerified;
                token.institutionName = (user as any).institutionName;
            }
            // Handle session updates (e.g., after verification status change)
            if (trigger === 'update' && session) {
                token.verificationStatus = session.verificationStatus;
                token.emailVerified = session.emailVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).verificationStatus = token.verificationStatus;
                (session.user as any).emailVerified = token.emailVerified;
                (session.user as any).institutionName = token.institutionName;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
