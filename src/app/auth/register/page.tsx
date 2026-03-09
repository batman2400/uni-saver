'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', institutionId: '' });
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/institutions').then(r => r.json()).then(setInstitutions).catch(() => { });
    }, []);

    function update(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    institutionId: form.institutionId || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }

            router.push('/auth/login?registered=true');
        } catch {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card glass-card">
                <h1>Join UNI Savers</h1>
                <p className="subtitle">Create your free account and start saving</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input id="name" type="text" className="form-control" placeholder="Your full name" value={form.name} onChange={e => update('name', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <input id="reg-email" type="email" className="form-control" placeholder="you@university.lk" value={form.email} onChange={e => update('email', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="institution">Institution</label>
                        <select id="institution" className="form-control" value={form.institutionId} onChange={e => update('institutionId', e.target.value)}>
                            <option value="">Select your school / university</option>
                            {institutions.map((inst: any) => (
                                <option key={inst.id} value={inst.id}>{inst.name} ({inst.type})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input id="reg-password" type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input id="confirm-password" type="password" className="form-control" placeholder="Confirm your password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="footer">
                    Already have an account? <Link href="/auth/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
