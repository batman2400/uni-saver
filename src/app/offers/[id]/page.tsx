'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function OfferDetailPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter();
    const [offer, setOffer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);
    const [redemption, setRedemption] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const qrRef = useRef<HTMLCanvasElement>(null);
    const user = session?.user as any;

    useEffect(() => {
        fetch(`/api/offers/${id}`).then(r => r.json()).then(data => {
            setOffer(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (redemption?.promoCode && qrRef.current) {
            QRCode.toCanvas(qrRef.current, redemption.promoCode, {
                width: 220,
                color: { dark: '#030014', light: '#FFFFFF' },
            });
        }
    }, [redemption, showModal]);

    async function handleRedeem() {
        if (!session) { router.push('/auth/login'); return; }
        if (user?.verificationStatus !== 'APPROVED') {
            setError('Your student identity must be officially verified before accessing premium offers. Please update your profile.');
            return;
        }

        setRedeeming(true);
        setError('');

        try {
            const res = await fetch(`/api/offers/${id}/redeem`, { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to authenticate redemption requested.');
                setRedeeming(false);
                return;
            }

            setRedemption(data.redemption);
            setShowModal(true);
        } catch {
            setError('An unexpected error occurred during redemption.');
        }
        setRedeeming(false);
    }

    if (loading) return (
        <div className="offer-detail-page">
            <div className="container">
                <div className="offer-detail-grid">
                    <div className="skeleton" style={{ height: '500px', borderRadius: 'var(--radius-xl)' }} />
                    <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
                </div>
            </div>
        </div>
    );

    if (!offer) return (
        <div className="loading-page">
            <div className="empty-state" style={{ maxWidth: '500px' }}>
                <div className="icon">⚠️</div>
                <h3>Privilege Not Found</h3>
                <p>The offer you are looking for might have expired or does not exist.</p>
                <Link href="/offers" className="btn btn-primary" style={{ marginTop: '24px' }}>Return to Offers</Link>
            </div>
        </div>
    );

    const isExpired = offer.expiresAt && new Date(offer.expiresAt) < new Date();
    const isFull = offer.maxRedemptions && offer.currentRedemptions >= offer.maxRedemptions;

    return (
        <>
            <div className="page-header" style={{ padding: 'calc(var(--nav-height) + 40px) 0 40px', background: 'transparent' }}>
                <div className="container" style={{ textAlign: 'left' }}>
                    <Link href="/offers" className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: '20px' }}>
                        <span style={{ marginRight: '8px' }}>&larr;</span> Back to Gallery
                    </Link>
                </div>
            </div>

            <div className="offer-detail-page" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="offer-detail-grid">
                        <div className="offer-detail-main">
                            <div className="glass-card" style={{ padding: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                                    <div className="offer-brand-icon" style={{ width: '80px', height: '80px', fontSize: '2rem', borderRadius: '24px' }}>
                                        {offer.brand?.name?.charAt(0) || '✨'}
                                    </div>
                                    <div>
                                        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4px', lineHeight: 1.2 }}>{offer.title}</h1>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Offered by <strong style={{ color: 'var(--text-secondary)' }}>{offer.brand?.name}</strong></p>
                                    </div>
                                </div>

                                <div className="offer-discount-badge" style={{ fontSize: '1.4rem', padding: '12px 24px', marginBottom: '32px', display: 'inline-block' }}>
                                    {offer.discount}
                                </div>

                                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>About this Privilege</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '40px', color: 'var(--text-secondary)' }}>
                                    {offer.description}
                                </p>

                                {offer.terms && (
                                    <div style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}>
                                        <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-light)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Terms & Conditions</h4>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{offer.terms}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="offer-detail-sidebar">
                            <div className="glass-card" style={{ position: 'sticky', top: 'calc(var(--nav-height) + 32px)', padding: '32px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <span className="offer-category-tag" style={{ marginBottom: '24px', fontSize: '0.9rem', padding: '8px 16px' }}>
                                        {offer.category?.icon} {offer.category?.name}
                                    </span>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
                                        {offer.expiresAt && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                                                <span style={{ color: isExpired ? '#EF4444' : '#10B981', fontWeight: 600 }}>
                                                    {isExpired ? 'Expired' : `Active until ${new Date(offer.expiresAt).toLocaleDateString()}`}
                                                </span>
                                            </div>
                                        )}

                                        {offer.maxRedemptions && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Claimed</span>
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                    {offer.currentRedemptions} / {offer.maxRedemptions}
                                                </span>
                                            </div>
                                        )}
                                        {!offer.maxRedemptions && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Availability</span>
                                                <span style={{ color: '#10B981', fontWeight: 600 }}>Unlimited</span>
                                            </div>
                                        )}
                                    </div>

                                    {error && <div className="alert alert-error" style={{ textAlign: 'left', marginBottom: '24px' }}>{error}</div>}

                                    <button
                                        className="btn btn-primary btn-lg"
                                        style={{ width: '100%', padding: '20px', fontSize: '1.1rem', boxShadow: '0 10px 30px var(--primary-glow)' }}
                                        onClick={handleRedeem}
                                        disabled={redeeming || isExpired || isFull || !offer.isActive}
                                    >
                                        {redeeming ? 'Authenticating...' : isExpired ? 'Offer Expired' : isFull ? 'Fully Claimed' : !offer.isActive ? 'Inactive' : 'Unlock Privilege'}
                                    </button>

                                    {!session && (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '20px' }}>
                                            <Link href="/auth/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>Sign in to verify</Link> and redeem this privilege.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Redemption Modal */}
            {showModal && redemption && (
                <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ backdropFilter: 'blur(16px)' }}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '48px 32px' }}>
                        <div className="modal-header" style={{ display: 'block', marginBottom: '24px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'bounce 1s ease' }}>🎉</div>
                            <h2 style={{ fontSize: '2rem', background: 'linear-gradient(135deg, var(--secondary-light), var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Privilege Unlocked!
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '24px', right: '24px' }}>✕</button>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.05rem', lineHeight: 1.6 }}>
                            Present this secure digital code to the merchant staff to claim your exclusive student discount.
                        </p>

                        <div className="qr-container" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)', padding: '40px', maxWidth: '380px', margin: '0 auto 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                            <div className="promo-code" onClick={() => navigator.clipboard.writeText(redemption.promoCode)} title="Click to copy">
                                {redemption.promoCode}
                            </div>

                            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                                <canvas ref={qrRef} style={{ display: 'block', margin: '0 auto' }} />
                            </div>

                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{redemption.offerTitle}</strong><br />
                                at {redemption.brandName}
                            </p>
                        </div>

                        <button className="btn btn-secondary btn-lg" style={{ width: '100%', maxWidth: '380px' }} onClick={() => {
                            navigator.clipboard.writeText(redemption.promoCode);
                            const btn = document.activeElement as HTMLButtonElement;
                            if (btn) { btn.innerText = '✓ Copied to Clipboard'; setTimeout(() => btn.innerText = '📋 Copy Secure Code', 2000); }
                        }}>
                            📋 Copy Secure Code
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
