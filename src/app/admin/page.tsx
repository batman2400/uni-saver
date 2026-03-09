'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

type Tab = 'dashboard' | 'verifications' | 'brands' | 'offers' | 'notifications';

export default function AdminPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user as any;
    const [tab, setTab] = useState<Tab>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (session && user?.role !== 'ADMIN') router.push('/');
    }, [session, user, router]);

    if (!session || user?.role !== 'ADMIN') return <div className="loading-page"><div className="spinner" /></div>;

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'verifications', label: 'Verifications', icon: '✅' },
        { id: 'brands', label: 'Brands', icon: '💎' },
        { id: 'offers', label: 'Offers', icon: '🎫' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
    ];

    return (
        <div className="admin-layout" style={{ background: 'var(--bg-dark)' }}>
            <button className="mobile-menu-btn" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 200, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '50%', width: 60, height: 60, display: 'none', boxShadow: '0 10px 30px var(--primary-glow)', border: 'none', color: 'white' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? '✕' : '☰'}
            </button>
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '0 12px', marginBottom: '40px', marginTop: '12px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Core</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Management Console</p>
                </div>
                {tabs.map(t => (
                    <button key={t.id} className={`admin-sidebar-link ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setSidebarOpen(false); }}>
                        <span style={{ fontSize: '1.2rem' }}>{t.icon}</span> {t.label}
                    </button>
                ))}
            </aside>

            <div className="admin-content">
                {tab === 'dashboard' && <DashboardTab />}
                {tab === 'verifications' && <VerificationsTab />}
                {tab === 'brands' && <BrandsTab />}
                {tab === 'offers' && <OffersTab />}
                {tab === 'notifications' && <NotificationsTab />}
            </div>

            <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
        </div>
    );
}

/* ========== DASHBOARD TAB ========== */
function DashboardTab() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics').then(r => r.json()).then(d => { setAnalytics(d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}><div className="skeleton" style={{ height: 160, borderRadius: 24 }} /><div className="skeleton" style={{ height: 160, borderRadius: 24 }} /><div className="skeleton" style={{ height: 160, borderRadius: 24 }} /><div className="skeleton" style={{ height: 160, borderRadius: 24 }} /></div>;
    if (!analytics) return <div className="empty-state">Failed to load analytics dashboard</div>;

    const catLabels = Object.keys(analytics.redemptionsByCategory || {});
    const catValues = Object.values(analytics.redemptionsByCategory || {}) as number[];
    const colors = ['#8B5CF6', '#22D3EE', '#F472B6', '#60A5FA', '#FBBF24', '#34D399', '#A78BFA', '#FB923C', '#38BDF8'];

    return (
        <div style={{ animation: 'slideIn 0.4s ease' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '32px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, var(--text-primary), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Overview</h1>

            <div className="stats-grid">
                <div className="stat-card purple"><div className="stat-value">{analytics.overview.totalUsers}</div><div className="stat-label">Verified Students</div></div>
                <div className="stat-card green"><div className="stat-value">{analytics.overview.totalRedemptions}</div><div className="stat-label">Lifetime Redemptions</div></div>
                <div className="stat-card blue"><div className="stat-value">{analytics.overview.activeOffers}</div><div className="stat-label">Live Active Offers</div></div>
                <div className="stat-card red"><div className="stat-value">{analytics.overview.pendingVerifications}</div><div className="stat-label">Pending Approvals</div></div>
            </div>

            <div className="charts-grid">
                {catLabels.length > 0 && (
                    <div className="chart-card glass-card">
                        <h3>Redemption Distribution</h3>
                        <Doughnut data={{ labels: catLabels, datasets: [{ data: catValues, backgroundColor: colors.slice(0, catLabels.length), borderWidth: 2, borderColor: '#0A071A' }] }} options={{ plugins: { legend: { position: 'right', labels: { color: '#CBD5E1', padding: 20, font: { family: 'Inter', size: 12 } } } }, maintainAspectRatio: false }} />
                    </div>
                )}
                {analytics.topOffers?.length > 0 && (
                    <div className="chart-card glass-card">
                        <h3>Most Popular Privileges</h3>
                        <Bar data={{ labels: analytics.topOffers.map((o: any) => o.title.substring(0, 20) + '...'), datasets: [{ label: 'Claims', data: analytics.topOffers.map((o: any) => o.currentRedemptions), backgroundColor: 'rgba(139, 92, 246, 0.8)', hoverBackgroundColor: '#A78BFA', borderRadius: 8, barThickness: 24 }] }} options={{ plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(10,7,26,0.9)', titleColor: '#fff', bodyColor: '#A78BFA', padding: 12, cornerRadius: 8 } }, scales: { x: { ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } }, grid: { display: false } }, y: { ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } } }, maintainAspectRatio: false }} />
                    </div>
                )}
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div className="stat-card" style={{ borderTop: '4px solid #60A5FA' }}><div className="stat-value" style={{ color: '#60A5FA' }}>{analytics.overview.totalBrands}</div><div className="stat-label">Corporate Partners</div></div>
                <div className="stat-card" style={{ borderTop: '4px solid #FBBF24' }}><div className="stat-value" style={{ color: '#FBBF24' }}>{analytics.overview.totalOffers}</div><div className="stat-label">Total Offers Processed</div></div>
            </div>
        </div>
    );
}

/* ========== VERIFICATIONS TAB ========== */
function VerificationsTab() {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [filter, setFilter] = useState('PENDING');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/admin/verifications?status=${filter}`);
        const data = await res.json();
        setVerifications(Array.isArray(data) ? data : []);
        setLoading(false);
    }, [filter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    async function handleAction(userId: string, action: string) {
        setActionLoading(userId);
        await fetch('/api/admin/verifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action }),
        });
        setActionLoading('');
        fetchData();
    }

    return (
        <div style={{ animation: 'slideIn 0.4s ease' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '24px' }}>Identity Verifications</h1>
            <div className="category-chips" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
                {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
                    <button key={s} className={`category-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)} style={{ padding: '8px 24px' }}>
                        {s === 'PENDING' ? '⏳' : s === 'APPROVED' ? '✅' : '❌'} {s}
                    </button>
                ))}
            </div>

            {loading ? <div className="skeleton" style={{ height: 400, borderRadius: 24 }} /> : verifications.length === 0 ? (
                <div className="empty-state"><div className="icon">✓</div><h3>Inbox Zero</h3><p>No {filter.toLowerCase()} verifications found.</p></div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Student Name</th><th>Email Access</th><th>Institution ID</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {verifications.map((v: any) => (
                                <tr key={v.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{v.email}</td>
                                    <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{v.institution?.name || 'N/A'}</span></td>
                                    <td><span className={`verification-badge ${v.verificationStatus.toLowerCase()}`}>{v.verificationStatus}</span></td>
                                    <td>
                                        {v.verificationStatus === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <button className="btn btn-sm btn-success" disabled={actionLoading === v.id} onClick={() => handleAction(v.id, 'APPROVED')} style={{ padding: '6px 16px' }}>Approve</button>
                                                <button className="btn btn-sm btn-danger" disabled={actionLoading === v.id} onClick={() => handleAction(v.id, 'REJECTED')} style={{ padding: '6px 16px' }}>Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ========== BRANDS TAB ========== */
function BrandsTab() {
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', website: '', categoryId: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/brands').then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
        ]).then(([b, c]) => {
            setBrands(b); setCategories(c); setLoading(false);
        });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch('/api/admin/brands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            const newBrand = await res.json();
            setBrands(prev => [...prev, newBrand]);
            setForm({ name: '', description: '', website: '', categoryId: '' });
            setShowForm(false);
        }
        setSaving(false);
    }

    async function deleteBrand(id: string) {
        if (!confirm('Are you absolutely sure you want to delete this brand partner?')) return;
        const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
        if (res.ok) setBrands(prev => prev.filter(b => b.id !== id));
        else { const d = await res.json(); alert(d.error); }
    }

    return (
        <div style={{ animation: 'slideIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Brand Partners</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Partner</button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ marginBottom: '40px', maxWidth: '700px', borderTop: '4px solid var(--primary-light)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>New Partner Organization</h2>
                    <form onSubmit={handleSave}>
                        <div className="form-group"><label>Brand Name</label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                        <div className="form-group"><label>Primary Category</label><select className="form-control" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} required><option value="">Select Category</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div className="form-group"><label>Description / Pitch</label><textarea className="form-control" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                        <div className="form-group"><label>Website URL</label><input className="form-control" type="url" placeholder="https://" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} /></div>
                        <div style={{ display: 'flex', gap: 12, marginTop: '32px' }}><button className="btn btn-primary" disabled={saving}>{saving ? 'Registering...' : 'Register Brand'}</button><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Discard</button></div>
                    </form>
                </div>
            )}

            {loading ? <div className="skeleton" style={{ height: 400, borderRadius: 24 }} /> : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Partner Identity</th><th>Sector</th><th>Profile Outline</th><th>Actions</th></tr></thead>
                        <tbody>
                            {brands.map((b: any) => (
                                <tr key={b.id}>
                                    <td style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary-light)' }}>{b.name}</td>
                                    <td><span className="offer-category-tag" style={{ margin: 0 }}>{b.category?.icon} {b.category?.name}</span></td>
                                    <td style={{ color: 'var(--text-muted)', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.description}</td>
                                    <td><button className="btn btn-sm btn-ghost" style={{ color: '#EF4444' }} onClick={() => deleteBrand(b.id)}>Remove</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ========== OFFERS TAB ========== */
function OffersTab() {
    const [offers, setOffers] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', discount: '', terms: '', brandId: '', categoryId: '', expiresAt: '', maxRedemptions: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/offers').then(r => r.json()),
            fetch('/api/admin/brands').then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
        ]).then(([o, b, c]) => {
            setOffers(Array.isArray(o) ? o : []); setBrands(b); setCategories(c); setLoading(false);
        });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch('/api/admin/offers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            const created = await res.json();
            setOffers(prev => [created, ...prev]);
            setForm({ title: '', description: '', discount: '', terms: '', brandId: '', categoryId: '', expiresAt: '', maxRedemptions: '' });
            setShowForm(false);
        }
        setSaving(false);
    }

    async function toggleActive(id: string, current: boolean) {
        const res = await fetch(`/api/admin/offers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !current }),
        });
        if (res.ok) {
            setOffers(prev => prev.map(o => o.id === id ? { ...o, isActive: !current } : o));
        }
    }

    async function deleteOffer(id: string) {
        if (!confirm('Permanent action. Delete this privilege?')) return;
        const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
        if (res.ok) setOffers(prev => prev.filter(o => o.id !== id));
    }

    return (
        <div style={{ animation: 'slideIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Live Privileges</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Publish Offer</button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ marginBottom: '40px', borderTop: '4px solid var(--secondary-light)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Draft New Privilege</h2>
                    <form onSubmit={handleSave}>
                        <div className="form-group"><label>Marketing Title</label><input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div className="form-group"><label>Partner</label><select className="form-control" value={form.brandId} onChange={e => setForm(p => ({ ...p, brandId: e.target.value }))} required><option value="">Select Brand</option>{brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                            <div className="form-group"><label>Category Cluster</label><select className="form-control" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} required><option value="">Select Category</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        </div>
                        <div className="form-group"><label>Detailed Benefits</label><textarea className="form-control" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div className="form-group"><label>Discount Value</label><input className="form-control" placeholder="e.g. 20% OFF or Rs. 1000" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} required /></div>
                            <div className="form-group"><label>Max Redemptions (Blank = Unlimited)</label><input className="form-control" type="number" min="1" value={form.maxRedemptions} onChange={e => setForm(p => ({ ...p, maxRedemptions: e.target.value }))} /></div>
                            <div className="form-group"><label>Expiry Date</label><input className="form-control" type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} /></div>
                        </div>
                        <div className="form-group"><label>Terms & Context</label><textarea className="form-control" style={{ minHeight: '80px' }} value={form.terms} onChange={e => setForm(p => ({ ...p, terms: e.target.value }))} /></div>
                        <div style={{ display: 'flex', gap: 12, marginTop: '16px' }}><button className="btn btn-primary" disabled={saving}>{saving ? 'Publishing...' : 'Deploy to Network'}</button><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Discard Draft</button></div>
                    </form>
                </div>
            )}

            {loading ? <div className="skeleton" style={{ height: 400, borderRadius: 24 }} /> : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Campaign Title</th><th>Partner</th><th>Value</th><th>Engagement</th><th>Run Status</th><th>Controls</th></tr></thead>
                        <tbody>
                            {offers.map((o: any) => (
                                <tr key={o.id}>
                                    <td style={{ fontWeight: 700, maxWidth: 250, color: 'var(--text-primary)' }}>{o.title}</td>
                                    <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{o.brand?.name}</span></td>
                                    <td><span className="offer-discount-badge" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{o.discount}</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: '20px', display: 'inline-block' }}>
                                            {o.currentRedemptions} {o.maxRedemptions ? <span style={{ color: 'var(--text-muted)' }}>/ {o.maxRedemptions}</span> : ''}
                                        </div>
                                    </td>
                                    <td><span className={`verification-badge ${o.isActive ? 'approved' : 'rejected'}`}>{o.isActive ? 'Live' : 'Paused'}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className={`btn btn-sm ${o.isActive ? 'btn-secondary' : 'btn-success'}`} onClick={() => toggleActive(o.id, o.isActive)} style={{ width: '90px' }}>{o.isActive ? 'Pause' : 'Activate'}</button>
                                            <button className="btn btn-sm btn-ghost" style={{ color: '#EF4444' }} onClick={() => deleteOffer(o.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ========== NOTIFICATIONS TAB ========== */
function NotificationsTab() {
    const [history, setHistory] = useState<any[]>([]);
    const [form, setForm] = useState({ title: '', message: '' });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetch('/api/admin/notifications').then(r => r.json()).then(d => setHistory(Array.isArray(d) ? d : []));
    }, []);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        setSuccess('');
        const res = await fetch('/api/admin/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess(data.message);
            setForm({ title: '', message: '' });
            const updated = await fetch('/api/admin/notifications').then(r => r.json());
            setHistory(Array.isArray(updated) ? updated : []);
        }
        setSending(false);
    }

    return (
        <div style={{ animation: 'slideIn 0.4s ease' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '32px' }}>Global Comms</h1>

            <div className="glass-card" style={{ maxWidth: '800px', marginBottom: '48px', borderTop: '4px solid var(--accent)' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📡</span> Broadcast Message</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This will trigger in-app notifications for all registered students across the network.</p>
                {success && <div className="alert alert-success" style={{ animation: 'slideIn 0.3s ease' }}>{success}</div>}

                <form onSubmit={handleSend}>
                    <div className="form-group"><label>Broadcast Subject</label><input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Flash Deal: 50% OFF Apple Store!" /></div>
                    <div className="form-group"><label>Transmission Message</label><textarea className="form-control" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required placeholder="Craft your message to the student network..." /></div>
                    <button className="btn btn-primary btn-lg" disabled={sending} style={{ boxShadow: '0 10px 30px rgba(236, 72, 153, 0.4)', background: 'linear-gradient(135deg, var(--accent), #BE185D)' }}>
                        {sending ? 'Encrypting & Dispatching...' : '🚀 Dispatch Broadcast'}
                    </button>
                </form>
            </div>

            <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Transmission History</h3>
            {history.length === 0 ? (
                <div className="empty-state"><div className="icon">📭</div><h3>Zero Transmissions Logged</h3><p>Engage the user network using the broadcast module above.</p></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
                    {history.map((n: any) => (
                        <div key={n.id} className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--accent)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{n.title}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>{n.message}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                    <div style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--accent-light)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block' }}>
                                        {n._count?.users || 0} reached
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
