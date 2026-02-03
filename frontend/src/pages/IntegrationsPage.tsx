import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Slack, Video, Database, ArrowRight } from 'lucide-react';

const BRAND = 'Brevity';

const integrations = [
    { name: 'Google Calendar', desc: 'Sync action items and deadlines automatically.', icon: Calendar, color: '#4285F4', status: 'Available' },
    { name: 'Slack', desc: 'Get meeting summaries delivered to your channels.', icon: Slack, color: '#4A154B', status: 'Available' },
    { name: 'Zoom', desc: 'Import recordings directly from Zoom.', icon: Video, color: '#2D8CFF', status: 'Coming Soon' },
    { name: 'Notion', desc: 'Export transcripts and action items to Notion.', icon: Database, color: '#000000', status: 'Coming Soon' }
];

export default function IntegrationsPage() {
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
                <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Integrations</h1>
                <p style={{ fontSize: '20px', color: '#A1A1A6' }}>Connect {BRAND} with the tools you already use.</p>
            </section>

            <section style={{ padding: '40px 24px 100px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {integrations.map((int) => {
                            const Icon = int.icon;
                            return (
                                <div key={int.name} style={{ padding: '28px', background: '#111114', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${int.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={24} style={{ color: int.color === '#000000' ? '#F5F5F7' : int.color }} />
                                        </div>
                                        <span style={{ padding: '4px 10px', background: int.status === 'Available' ? 'rgba(74,227,181,0.15)' : 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '11px', color: int.status === 'Available' ? '#4AE3B5' : '#6B6B70', fontWeight: '600' }}>{int.status}</span>
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{int.name}</h3>
                                    <p style={{ fontSize: '14px', color: '#A1A1A6', lineHeight: 1.6 }}>{int.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section style={{ padding: '80px 24px', background: '#0f0f12', textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Need a custom integration?</h2>
                <p style={{ fontSize: '16px', color: '#A1A1A6', marginBottom: '24px' }}>Enterprise customers can build custom integrations using our API.</p>
                <Link to="/docs/api" style={{ padding: '14px 28px', background: '#FF6B4A', borderRadius: '10px', fontWeight: '600', fontSize: '15px', color: '#030303', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    View API Docs <ArrowRight size={16} />
                </Link>
            </section>

            <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2025 {BRAND}. All rights reserved.</p>
            </footer>
        </div>
    );
}
