import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3>🎓 <span>UNI Savers</span></h3>
                        <p>Sri Lanka&apos;s #1 student discount platform. Exclusive deals for verified students across the island.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Platform</h4>
                        <Link href="/offers">Browse Offers</Link>
                        <Link href="/auth/register">Sign Up</Link>
                        <Link href="/auth/login">Login</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Categories</h4>
                        <Link href="/offers?category=food-drink">Food & Drink</Link>
                        <Link href="/offers?category=fashion">Fashion</Link>
                        <Link href="/offers?category=tech-mobile">Tech & Mobile</Link>
                        <Link href="/offers?category=entertainment">Entertainment</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Support</h4>
                        <a href="#">Help Center</a>
                        <a href="#">Contact Us</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} UNI Savers. Made with 💜 for Sri Lankan students.</p>
                </div>
            </div>
        </footer>
    );
}
