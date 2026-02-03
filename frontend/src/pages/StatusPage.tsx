import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const BRAND = 'Brevity';

const services = [
    { name: 'API', status: 'operational', uptime: '99.99%' },
    { name: 'Web Application', status: 'operational', uptime: '99.98%' },
    { name: 'Transcription Service', status: 'operational', uptime: '99.95%' },
    { name: 'AI Processing', status: 'operational', uptime: '99.90%' },
    { name: 'Calendar Sync', status: 'operational', uptime: '99.97%' }
];

const incidents = [
    { date: 'Jan 25, 2025', title: 'Elevated API latency', status: 'resolved', desc: 'Brief period of elevated API response times. Issue resolved.' },
    { date: 'Jan 18, 2025', title: 'Scheduled maintenance', status: 'resolved', desc: 'Planned maintenance completed successfully with no downtime.' }
];

export default function StatusPage() {
    const allOperational = services.every(s => s.status === 'operational');

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
                <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>System Status</h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: allOperational ? 'rgba(74,227,181,0.15)' : 'rgba(255,107,74,0.15)', borderRadius: '100px' }}>
                    {allOperational ? <CheckCircle size={20} color="#4AE3B5" /> : <AlertCircle size={20} color="#FF6B4A" />}
                    <span style={{ fontSize: '16px', fontWeight: '600', color: allOperational ? '#4AE3B5' : '#FF6B4A' }}>
                        {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
                    </span>
                </div>
            </section>

            <section style={{ padding: '40px 24px' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Services</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {services.map((s) => (
                            <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#111114', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '15px', fontWeight: '500' }}>{s.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '13px', color: '#6B6B70' }}>{s.uptime} uptime</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4AE3B5', fontWeight: '600' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4AE3B5' }} />
                                        Operational
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '40px 24px 100px' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Recent Incidents</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {incidents.map((i, idx) => (
                            <div key={idx} style={{ padding: '20px', background: '#111114', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                    <span style={{ padding: '3px 10px', background: 'rgba(74,227,181,0.15)', borderRadius: '4px', fontSize: '11px', color: '#4AE3B5', fontWeight: '600' }}>Resolved</span>
                                    <span style={{ fontSize: '13px', color: '#6B6B70', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> {i.date}</span>
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>{i.title}</h3>
                                <p style={{ fontSize: '14px', color: '#A1A1A6' }}>{i.desc}</p>
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
