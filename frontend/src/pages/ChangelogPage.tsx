import { Link } from 'react-router-dom';
import { Sparkles, Bug, Wrench, Star } from 'lucide-react';

const BRAND = 'Brevity';

const releases = [
    { version: '2.4.0', date: 'Jan 28, 2025', type: 'feature', title: 'AI Contract Generation', items: ['Generate contracts from meeting content', 'Support for 20+ jurisdictions', 'Automatic compliance checks'] },
    { version: '2.3.2', date: 'Jan 20, 2025', type: 'fix', title: 'Bug Fixes', items: ['Fixed transcript export formatting', 'Resolved calendar sync delay', 'Fixed speaker identification edge case'] },
    { version: '2.3.0', date: 'Jan 15, 2025', type: 'feature', title: 'Calendar Integration', items: ['Google Calendar sync', 'Smart deadline reminders', 'Team calendar support'] },
    { version: '2.2.1', date: 'Jan 8, 2025', type: 'improvement', title: 'Performance Improvements', items: ['50% faster transcript processing', 'Reduced API latency', 'Improved mobile responsiveness'] }
];

export default function ChangelogPage() {
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
                <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Changelog</h1>
                <p style={{ fontSize: '20px', color: '#A1A1A6' }}>New features, improvements, and fixes.</p>
            </section>

            <section style={{ padding: '40px 24px 100px' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    {releases.map((r, i) => {
                        const Icon = r.type === 'feature' ? Star : r.type === 'fix' ? Bug : Wrench;
                        const color = r.type === 'feature' ? '#FF6B4A' : r.type === 'fix' ? '#FFB84D' : '#4AE3B5';
                        return (
                            <div key={i} style={{ marginBottom: '40px', paddingLeft: '32px', borderLeft: '2px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-15px', top: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#0A0A0C', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={14} color={color} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{ padding: '4px 10px', background: `${color}20`, borderRadius: '4px', fontSize: '12px', color, fontWeight: '700' }}>v{r.version}</span>
                                    <span style={{ fontSize: '13px', color: '#6B6B70' }}>{r.date}</span>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>{r.title}</h3>
                                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                    {r.items.map((item, j) => (
                                        <li key={j} style={{ fontSize: '14px', color: '#A1A1A6', lineHeight: 1.8 }}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </section>

            <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2025 {BRAND}. All rights reserved.</p>
            </footer>
        </div>
    );
}
