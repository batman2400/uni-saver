'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef<HTMLDivElement>(null);
    const user = session?.user as any;

    useEffect(() => {
        if (session) fetchNotifications();
        const interval = setInterval(() => { if (session) fetchNotifications(); }, 30000);
        return () => clearInterval(interval);
    }, [session]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch { }
    }

    async function markRead(id: string) {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: id }),
        });
        fetchNotifications();
    }

    function timeAgo(date: string) {
        const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (s < 60) return 'just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    }

    return (
        <>
            <nav className="navbar">
                <div className="container">
                    <Link href="/" className="nav-logo">
                        🎓 <span>UNI Savers</span>
                    </Link>
                    <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? '✕' : '☰'}
                    </button>
                    <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                        <Link href="/offers" onClick={() => setMenuOpen(false)}>Offers</Link>
                        {session ? (
                            <>
                                {user?.role === 'ADMIN' ? (
                                    <Link href="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                                ) : (
                                    <>
                                        <Link href="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                                        <div className="nav-notification" ref={notifRef}>
                                            <button className="btn-ghost" onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative' }}>
                                                🔔
                                                {unreadCount > 0 && <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                                            </button>
                                        </div>
                                    </>
                                )}
                                <button className="btn btn-sm btn-secondary" onClick={() => signOut({ callbackUrl: '/' })}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="btn btn-sm btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
                                <Link href="/auth/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {notifOpen && (
                <div className="notification-panel" ref={notifRef}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="btn btn-sm btn-ghost" onClick={() => markRead('all')}>Mark all read</button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="empty-state"><p>No notifications yet</p></div>
                    ) : (
                        notifications.map((n: any) => (
                            <div
                                key={n.id}
                                className={`notification-item ${!n.read ? 'unread' : ''}`}
                                onClick={() => !n.read && markRead(n.id)}
                            >
                                <h4>{n.notification.title}</h4>
                                <p>{n.notification.message}</p>
                                <div className="notification-time">{timeAgo(n.notification.createdAt)}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </>
    );
}
