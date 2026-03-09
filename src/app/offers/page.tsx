'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function OffersContent() {
    const searchParams = useSearchParams();
    const [offers, setOffers] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (activeCategory !== 'all') params.set('category', activeCategory);
        if (search) params.set('search', search);
        params.set('page', page.toString());
        params.set('limit', '12');

        try {
            const res = await fetch(`/api/offers?${params}`);
            const data = await res.json();
            setOffers(data.offers || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch { }
        setLoading(false);
    }, [activeCategory, search, page]);

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => { });
    }, []);

    useEffect(() => { fetchOffers(); }, [fetchOffers]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setPage(1);
        fetchOffers();
    }

    return (
        <>
            <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="trust-badge" style={{
                        display: 'inline-block', padding: '6px 16px', background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '30px',
                        color: '#22D3EE', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <span style={{ marginRight: '8px' }}>💎</span> Premium Deals
                    </div>
                    <h1>Explore Member Privileges</h1>
                    <p>Unlock elite discounts from top Sri Lankan brands and elevate your lifestyle.</p>
                </div>
            </div>

            <section className="section" style={{ paddingTop: 40, paddingBottom: 100 }}>
                <div className="container">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="search-bar">
                        <input
                            type="text"
                            placeholder="Search by brand, category, or keyword..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-lg" style={{ padding: '0 40px' }}>
                            Discover
                        </button>
                    </form>

                    {/* Category Chips */}
                    <div className="category-chips">
                        <button className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => { setActiveCategory('all'); setPage(1); }}>
                            All Privileges
                        </button>
                        {categories.map((cat: any) => (
                            <button key={cat.id} className={`category-chip ${activeCategory === cat.slug ? 'active' : ''}`} onClick={() => { setActiveCategory(cat.slug); setPage(1); }}>
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Offers Grid */}
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />)}
                        </div>
                    ) : offers.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">🔍</div>
                            <h3>No privileges found</h3>
                            <p>Try adjusting your search criteria or explore another category.</p>
                            <button className="btn btn-secondary" style={{ marginTop: '24px' }} onClick={() => { setSearch(''); setActiveCategory('all'); }}>
                                View All Offers
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="offers-grid">
                                {offers.map((offer: any) => (
                                    <Link key={offer.id} href={`/offers/${offer.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="offer-card">
                                            <div className="offer-card-header">
                                                <div className="offer-brand-icon">{offer.brand?.name?.charAt(0) || '✨'}</div>
                                                <div>
                                                    <span className="offer-brand-name">{offer.brand?.name || 'Partner'}</span>
                                                </div>
                                            </div>
                                            <div className="offer-card-body">
                                                <h3>{offer.title}</h3>
                                                <p>{offer.description}</p>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                                    <div className="offer-discount-badge">{offer.discount}</div>
                                                    <span className="offer-category-tag">{offer.category?.icon} {offer.category?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '60px' }}>
                                    <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                        &larr; Previous
                                    </button>
                                    <span style={{ padding: '12px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600 }}>
                                        {page} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {totalPages}</span>
                                    </span>
                                    <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                                        Next &rarr;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </>
    );
}

export default function OffersPage() {
    return (
        <Suspense fallback={<div className="loading-page"><div className="spinner" /></div>}>
            <OffersContent />
        </Suspense>
    );
}
