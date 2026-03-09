'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/offers?limit=6').then(r => r.json()),
    ]).then(([cats, offersData]) => {
      setCategories(cats);
      setFeaturedOffers(offersData.offers || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="trust-badge" style={{
            display: 'inline-block', padding: '6px 16px', background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '30px',
            color: '#A78BFA', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ marginRight: '8px' }}>✨</span> Trusted by 10,000+ Students in Sri Lanka
          </div>

          <h1>
            Experience Premium<br />
            Student Savings with<br />
            <span className="gradient">UNI Savers</span>
          </h1>
          <p>
            Unlock elite discounts from Sri Lanka&apos;s top brands and global giants.
            Verify your student status instantly and elevate your lifestyle without breaking the bank.
          </p>

          <div className="hero-buttons">
            {session ? (
              <Link href="/offers" className="btn btn-lg btn-primary">
                Explore Premium Deals
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="btn btn-lg btn-primary">
                  Get Started for Free
                </Link>
                <Link href="/offers" className="btn btn-lg btn-secondary">
                  Browse Guest Offers
                </Link>
              </>
            )}
          </div>

          <div style={{ marginTop: '60px', opacity: 0.6, fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span>Verified by <strong>Top Universities</strong></span>
            <span>•</span>
            <span>Secure <strong>ID Verification</strong></span>
            <span>•</span>
            <span>Exclusive <strong>Member Only</strong> Offers</span>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section" style={{ background: 'rgba(10, 7, 26, 0.5)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Your Journey to Savings</h2>
            <p>Three effortless steps to unlock your premium student lifestyle</p>
          </div>
          <div className="steps-grid">
            <div className="step-card glass-card">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>Register with your student email and select your recognized academic institution.</p>
            </div>
            <div className="step-card glass-card">
              <div className="step-number">2</div>
              <h3>Verify Identity</h3>
              <p>Upload your university ID for an automated, secure verification process.</p>
            </div>
            <div className="step-card glass-card">
              <div className="step-number">3</div>
              <h3>Redeem Instantly</h3>
              <p>Access exclusive promo codes and digital QR barcodes to claim your privileges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Curated Categories</h2>
            <p>Discover privileges tailored to every aspect of student life</p>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/offers?category=${cat.slug}`}>
                  <div className="category-card">
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-name">{cat.name}</span>
                    <span className="category-count">{cat._count?.offers || 0} Exclusive Deals</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Offers */}
      <section className="section" style={{ background: 'linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.05))', paddingBottom: '120px' }}>
        <div className="container">
          <div className="section-title">
            <h2>Trending Now</h2>
            <p>The most sought-after student privileges this week</p>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : (
            <>
              <div className="offers-grid">
                {featuredOffers.map((offer: any) => (
                  <Link key={offer.id} href={`/offers/${offer.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="offer-card">
                      <div className="offer-card-header">
                        <div className="offer-brand-icon">
                          {offer.brand?.name?.charAt(0) || '✨'}
                        </div>
                        <div>
                          <span className="offer-brand-name">{offer.brand?.name || 'Exclusive Partner'}</span>
                        </div>
                      </div>
                      <div className="offer-card-body">
                        <h3>{offer.title}</h3>
                        <p>{offer.description?.substring(0, 100)}{offer.description?.length > 100 ? '...' : ''}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <div className="offer-discount-badge">{offer.discount}</div>
                          <span className="offer-category-tag">{offer.category?.icon} {offer.category?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <Link href="/offers" className="btn btn-lg btn-primary" style={{ boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)' }}>
                  View All Premium Offers →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
