'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Student = {
    id: string;
    name: string;
    email: string;
    verificationStatus: string;
    studentIdImage: string | null;
    createdAt: string;
    institution: { name: string; type: string } | null;
};

type Stats = {
    totalUsers: number;
    pendingVerifications: number;
    totalRedemptions: number;
    activeOffers: number;
};

const STATUS_COLOR: Record<string, string> = {
    PENDING: '#f59e0b',
    APPROVED: '#22c55e',
    REJECTED: '#ef4444',
    UNVERIFIED: '#6b7280',
};

export default function AdminDashboard() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [adminName, setAdminName] = useState('Admin');
    const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
    const [students, setStudents] = useState<Student[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const t = localStorage.getItem('adminToken');
        const u = localStorage.getItem('adminUser');
        if (!t) { router.push('/'); return; }
        setToken(t);
        if (u) setAdminName(JSON.parse(u).name || 'Admin');
    }, []);

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchStats = useCallback(async (tok: string) => {
        try {
            const res = await fetch('/api/admin/analytics', {
                headers: { Authorization: `Bearer ${tok}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            setStats(data.overview);
        } catch { /* non-critical */ }
    }, []);

    const fetchStudents = useCallback(async (status: string, tok: string) => {
        if (!tok) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/verifications?status=${status}`, {
                headers: { Authorization: `Bearer ${tok}` },
            });
            const data = await res.json();
            setStudents(Array.isArray(data) ? data : []);
        } catch {
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchStudents(tab, token);
            fetchStats(token);
        }
    }, [tab, token, fetchStudents, fetchStats]);

    const handleAction = async (userId: string, action: 'APPROVED' | 'REJECTED') => {
        setActionLoading(userId);
        try {
            const res = await fetch('/api/admin/verifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId, action }),
            });
            if (!res.ok) throw new Error();
            showToast(`Student ${action === 'APPROVED' ? 'approved ✅' : 'rejected ❌'} successfully`);
            fetchStudents(tab, token);
            fetchStats(token);
        } catch {
            showToast('Action failed. Please try again.', false);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/');
    };

    const statCards = stats ? [
        { label: 'Total Students', value: stats.totalUsers, icon: '👥', color: '#8b5cf6' },
        { label: 'Pending Review', value: stats.pendingVerifications, icon: '⏳', color: '#f59e0b' },
        { label: 'Total Redemptions', value: stats.totalRedemptions, icon: '🎫', color: '#10b981' },
        { label: 'Active Offers', value: stats.activeOffers, icon: '🏷️', color: '#22d3ee' },
    ] : [];

    return (
        <div style={{ minHeight: '100vh', background: '#0a071a', display: 'flex' }}>
            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.ok ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`, borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 600, color: toast.ok ? '#4ade80' : '#f87171', backdropFilter: 'blur(8px)' }}>
                    {toast.msg}
                </div>
            )}

            {/* Image Lightbox */}
            {selectedImage && (
                <div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, cursor: 'zoom-out' }}>
                    <div style={{ position: 'relative' }}>
                        <img src={selectedImage} alt="Student ID" style={{ maxWidth: '88vw', maxHeight: '88vh', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', objectFit: 'contain' }} />
                        <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: -40, right: 0, background: 'transparent', border: 'none', color: '#aaa', fontSize: 14, cursor: 'pointer' }}>ESC to close</button>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside style={{ width: 220, background: 'rgba(255,255,255,0.025)', borderRight: '1px solid rgba(255,255,255,0.07)', padding: '28px 16px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ marginBottom: 36 }}>
                    <div style={{ fontSize: 30, marginBottom: 6 }}>🛡️</div>
                    <div style={{ fontWeight: 900, fontSize: 17, background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UniSavers</div>
                    <div style={{ color: '#444', fontSize: 11, marginTop: 2 }}>Admin Portal</div>
                </div>

                <div style={{ color: '#555', fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 8 }}>Verifications</div>
                {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
                    <button key={s} onClick={() => setTab(s)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', background: tab === s ? 'rgba(139,92,246,0.12)' : 'transparent', border: tab === s ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent', borderRadius: 10, color: tab === s ? '#c4b5fd' : '#666', fontWeight: tab === s ? 700 : 400, cursor: 'pointer', marginBottom: 4, fontSize: 13, textAlign: 'left', transition: 'all 0.15s' }}
                    >
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[s], flexShrink: 0 }} />
                        {s === 'PENDING' ? '⏳ Pending' : s === 'APPROVED' ? '✅ Approved' : '❌ Rejected'}
                    </button>
                ))}

                <div style={{ flex: 1 }} />
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
                    <div style={{ color: '#555', fontSize: 11, marginBottom: 2 }}>Logged in as</div>
                    <div style={{ color: '#ddd', fontWeight: 600, fontSize: 13, marginBottom: 14 }}>{adminName}</div>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '9px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
                {/* Stats Row */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                        {statCards.map(card => (
                            <div key={card.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '18px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ fontSize: 22 }}>{card.icon}</span>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: card.color }} />
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#f0f0f0', marginBottom: 4 }}>{card.value}</div>
                                <div style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>{card.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#f0f0f0' }}>
                            {tab === 'PENDING' ? '⏳ Pending Verifications' : tab === 'APPROVED' ? '✅ Approved Students' : '❌ Rejected Students'}
                        </h1>
                        <p style={{ color: '#555', margin: '4px 0 0', fontSize: 13 }}>
                            {students.length} student{students.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button onClick={() => fetchStudents(tab, token)} style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: '#aaa', cursor: 'pointer', fontSize: 13 }}>
                        ↺ Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80, color: '#555' }}>Loading...</div>
                ) : students.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '60px 40px', textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>{tab === 'PENDING' ? '📭' : tab === 'APPROVED' ? '✅' : '❌'}</div>
                        <div style={{ color: '#666', fontSize: 16 }}>No {tab.toLowerCase()} students</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {students.map(student => (
                            <div key={student.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18, transition: 'border-color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                            >
                                {/* Avatar */}
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontWeight: 900, color: 'white' }}>
                                    {student.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <span style={{ color: '#f0f0f0', fontWeight: 700, fontSize: 16 }}>{student.name}</span>
                                        <span style={{ background: STATUS_COLOR[student.verificationStatus] + '20', color: STATUS_COLOR[student.verificationStatus], padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                            {student.verificationStatus}
                                        </span>
                                    </div>
                                    <div style={{ color: '#888', fontSize: 13, marginTop: 3 }}>{student.email}</div>
                                    {student.institution && (
                                        <div style={{ color: '#555', fontSize: 12, marginTop: 3 }}>🏫 {student.institution.name}</div>
                                    )}
                                </div>

                                {/* Date */}
                                <div style={{ color: '#555', fontSize: 12, flexShrink: 0, textAlign: 'right' }}>
                                    <div>Submitted</div>
                                    <div style={{ color: '#777', marginTop: 2 }}>{new Date(student.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    {student.studentIdImage ? (
                                        <button
                                            onClick={() => setSelectedImage(student.studentIdImage?.startsWith('http') ? student.studentIdImage : `http://localhost:3000${student.studentIdImage}`)}
                                            style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#d1d5db', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                                        >
                                            📎 View ID
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: 12, color: '#444', fontStyle: 'italic', alignSelf: 'center' }}>No ID</span>
                                    )}
                                    {tab === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(student.id, 'APPROVED')}
                                                disabled={actionLoading === student.id}
                                                style={{ padding: '8px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#4ade80', cursor: actionLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 12 }}
                                            >
                                                {actionLoading === student.id ? '...' : '✓ Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleAction(student.id, 'REJECTED')}
                                                disabled={actionLoading === student.id}
                                                style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', cursor: actionLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 12 }}
                                            >
                                                {actionLoading === student.id ? '...' : '✕ Reject'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
