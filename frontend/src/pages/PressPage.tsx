import { Link } from 'react-router-dom';
import { Sparkles, Download, ArrowRight } from 'lucide-react';

const BRAND = 'Minute Maker';

const pressReleases = [
    { title: 'Brevity Raises Series A to Revolutionize Meeting Productivity', date: 'Jan 15, 2025', source: 'TechCrunch' },
    { title: 'Product Hunt Product of the Day', date: 'Dec 10, 2024', source: 'Product Hunt' },
    { title: 'Brevity Launches Enterprise Tier with SOC 2 Compliance', date: 'Nov 28, 2024', source: 'Business Wire' }
];

const assets = [
    { title: 'Brand Guidelines', size: '2.5 MB', type: 'PDF' },
    { title: 'Logo Pack', size: '12 MB', type: 'ZIP' },
    { title: 'Product Screenshots', size: '45 MB', type: 'ZIP' }
];

export default function PressPage() {
    return (
        <div style={{ background: '#0A0A0C', minHeight: '100vh', color: '#F5F5F7', overflowY: 'auto', overflowX: 'hidden' }}>
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                padding: '14px 24px', background: 'rgba(10,10,12,0.95)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF6B4A, #FF9A7A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={20} color="#030303" strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: '22px', fontWeight: '800' }}>{BRAND}</span>
                    </Link>
                    <Link to="/login" style={{ padding: '10px 20px', background: '#FF6B4A', borderRadius: '8px', fontWeight: '600', fontSize: '14px', color: '#030303' }}>Get Started</Link>
                </div>
            </nav>

            <section style={{ paddingTop: '160px', paddingBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Newsroom</h1>
                <p style={{ fontSize: '20px', color: '#A1A1A6' }}>Latest news, updates, and brand assets.</p>
            </section>

            <section style={{ padding: '40px 24px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>In the News</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {pressReleases.map((pr, i) => (
                            <a key={i} href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: '#111114', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
                                <div>
                                    <p style={{ fontSize: '13px', color: '#FF6B4A', fontWeight: '600', marginBottom: '8px' }}>{pr.source} • {pr.date}</p>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#F5F5F7' }}>{pr.title}</h3>
                                </div>
                                <ArrowRight size={20} color="#6B6B70" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '60px 24px 100px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Brand Assets</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {assets.map((asset, i) => (
                            <div key={i} style={{ padding: '24px', background: '#111114', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <div style={{ marginBottom: '16px', display: 'inline-flex', padding: '12px', background: 'rgba(255,107,74,0.1)', borderRadius: '50%' }}>
                                    <Download size={24} color="#FF6B4A" />
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{asset.title}</h3>
                                <p style={{ fontSize: '13px', color: '#6B6B70' }}>{asset.type} • {asset.size}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2025 {BRAND}. All rights reserved.</p>
            </footer>
        </div>
    );
}
