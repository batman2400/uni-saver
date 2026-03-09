'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';

export default function ProfilePage() {
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();
    const [tab, setTab] = useState('overview');
    const [verification, setVerification] = useState<any>(null);
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const user = session?.user as any;

    useEffect(() => {
        if (!session) { router.push('/auth/login'); return; }
        Promise.all([
            fetch('/api/student/verify').then(r => r.json()),
            fetch('/api/student/redemptions').then(r => r.json()),
        ]).then(([v, r]) => {
            setVerification(v);
            setRedemptions(Array.isArray(r) ? r : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [session, router]);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadMsg('');

        const formData = new FormData();
        formData.append('studentId', file);

        try {
            const res = await fetch('/api/student/verify', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                setUploadMsg('Student ID uploaded! Pending admin review.');
                setVerification({ verificationStatus: 'PENDING' });
                updateSession({ verificationStatus: 'PENDING' });
            } else {
                setUploadMsg(data.error || 'Upload failed');
            }
        } catch {
            setUploadMsg('Upload failed. Please try again.');
        }
        setUploading(false);
    }

    function getStatusBadge(status: string) {
        const map: Record<string, string> = { UNVERIFIED: 'unverified', PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' };
        const labels: Record<string, string> = { UNVERIFIED: '⏳ Not Verified', PENDING: '🔄 Pending Review', APPROVED: '✅ Verified', REJECTED: '❌ Rejected' };
        return <span className={`verification-badge ${map[status] || 'unverified'}`}>{labels[status] || status}</span>;
    }

    if (!session) return null;
    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.name}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        <div style={{ marginTop: 8 }}>{getStatusBadge(verification?.verificationStatus || user?.verificationStatus || 'UNVERIFIED')}</div>
                        {user?.institutionName && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>🏫 {user.institutionName}</p>}
                    </div>
                </div>

                <div className="profile-tabs">
                    <button className={`profile-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
                    <button className={`profile-tab ${tab === 'verification' ? 'active' : ''}`} onClick={() => setTab('verification')}>Verification</button>
                    <button className={`profile-tab ${tab === 'redemptions' ? 'active' : ''}`} onClick={() => setTab('redemptions')}>My Redemptions</button>
                </div>

                {/* Overview Tab */}
                {tab === 'overview' && (
                    <div>
                        <div className="stats-grid">
                            <div className="stat-card purple"><div className="stat-value">{redemptions.length}</div><div className="stat-label">Offers Redeemed</div></div>
                            <div className="stat-card green"><div className="stat-value">{verification?.verificationStatus === 'APPROVED' ? '✓' : '✗'}</div><div className="stat-label">Verified Status</div></div>
                        </div>
                        {verification?.verificationStatus !== 'APPROVED' && (
                            <div className="alert alert-warning">
                                ⚡ Verify your student ID to start redeeming offers! Go to the <button style={{ background: 'none', border: 'none', color: '#FBBF24', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }} onClick={() => setTab('verification')}>Verification</button> tab.
                            </div>
                        )}
                    </div>
                )}

                {/* Verification Tab */}
                {tab === 'verification' && (
                    <div>
                        <div className="card" style={{ maxWidth: 600 }}>
                            <h3 style={{ marginBottom: 16 }}>Student ID Verification</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                                Upload a clear photo of your student ID card. Our team will verify it within 24 hours.
                            </p>
                            <div style={{ marginBottom: 16 }}>{getStatusBadge(verification?.verificationStatus || 'UNVERIFIED')}</div>

                            {(verification?.verificationStatus === 'UNVERIFIED' || verification?.verificationStatus === 'REJECTED') && (
                                <>
                                    {verification?.verificationStatus === 'REJECTED' && (
                                        <div className="alert alert-error" style={{ marginBottom: 16 }}>Your previous submission was rejected. Please upload a clearer photo of your student ID.</div>
                                    )}
                                    <label className="file-upload" htmlFor="student-id-upload">
                                        <input type="file" id="student-id-upload" accept="image/*" onChange={handleUpload} disabled={uploading} />
                                        <div className="icon" style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
                                        <p style={{ fontWeight: 600, marginBottom: 4 }}>{uploading ? 'Uploading...' : 'Click to upload your Student ID'}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>JPG, PNG, or WebP • Max 5MB</p>
                                    </label>
                                </>
                            )}
                            {verification?.verificationStatus === 'PENDING' && (
                                <div className="alert alert-info">Your student ID is being reviewed. You&apos;ll be notified once verified.</div>
                            )}
                            {verification?.verificationStatus === 'APPROVED' && (
                                <div className="alert alert-success">Your student ID has been verified! You can now redeem all offers.</div>
                            )}
                            {uploadMsg && <div className="alert alert-info" style={{ marginTop: 16 }}>{uploadMsg}</div>}
                        </div>
                    </div>
                )}

                {/* Redemptions Tab */}
                {tab === 'redemptions' && (
                    <div>
                        {redemptions.length === 0 ? (
                            <div className="empty-state">
                                <div className="icon">🎫</div>
                                <h3>No redemptions yet</h3>
                                <p>Browse offers and redeem your first discount!</p>
                            </div>
                        ) : (
                            <div className="offers-grid">
                                {redemptions.map((r: any) => (
                                    <div key={r.id} className="card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                            <div className="offer-brand-icon" style={{ width: 40, height: 40, fontSize: '1rem' }}>{r.offer?.brand?.name?.charAt(0)}</div>
                                            <div>
                                                <p style={{ fontWeight: 600 }}>{r.offer?.title}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.offer?.brand?.name}</p>
                                            </div>
                                        </div>
                                        <div className="promo-code" style={{ fontSize: '1rem', padding: '10px 16px', width: '100%', textAlign: 'center' }}>{r.promoCode}</div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                            Redeemed: {new Date(r.redeemedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
