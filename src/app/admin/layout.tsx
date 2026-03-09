import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard - UNI Savers',
    description: 'Admin dashboard for managing UNI Savers platform',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
