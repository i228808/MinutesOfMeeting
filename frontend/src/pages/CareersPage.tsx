import { Link } from 'react-router-dom';
import { Sparkles, MapPin, ArrowRight } from 'lucide-react';

const BRAND = 'Brevity';

const openings = [
    {
        dept: 'Engineering', roles: [
            { title: 'Senior Backend Engineer', location: 'Remote', type: 'Full-time' },
            { title: 'ML Engineer', location: 'San Francisco', type: 'Full-time' },
            { title: 'Frontend Engineer', location: 'Remote', type: 'Full-time' }
        ]
    },
    {
        dept: 'Product', roles: [
            { title: 'Product Manager', location: 'San Francisco', type: 'Full-time' },
            { title: 'Product Designer', location: 'Remote', type: 'Full-time' }
        ]
    },
    {
        dept: 'Sales', roles: [
            { title: 'Enterprise Account Executive', location: 'New York', type: 'Full-time' }
        ]
    }
];

export default function CareersPage() {
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

            <section style={{ paddingTop: '160px', paddingBottom: '60px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Join our team</h1>
                <p style={{ fontSize: '20px', color: '#A1A1A6', maxWidth: '500px', margin: '0 auto' }}>Help us build the future of meeting productivity.</p>
            </section>

            <section style={{ padding: '40px 24px 100px' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    {openings.map((d) => (
                        <div key={d.dept} style={{ marginBottom: '48px' }}>
                            <h2 style={{ fontSize: '14px', color: '#6B6B70', fontWeight: '600', marginBottom: '20px', letterSpacing: '0.1em' }}>{d.dept.toUpperCase()}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {d.roles.map((r) => (
                                    <Link key={r.title} to="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#111114', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{r.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '13px', color: '#6B6B70', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {r.location}</span>
                                                <span style={{ fontSize: '13px', color: '#6B6B70' }}>{r.type}</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} color="#FF6B4A" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ padding: '80px 24px', background: '#0f0f12', textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Don't see a fit?</h2>
                <p style={{ fontSize: '16px', color: '#A1A1A6', marginBottom: '24px' }}>Send us your resume and we'll keep you in mind.</p>
                <a href="mailto:careers@getbrevity.com" style={{ padding: '14px 28px', background: '#FF6B4A', borderRadius: '10px', fontWeight: '600', fontSize: '15px', color: '#030303' }}>Get in touch</a>
            </section>

            <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2025 {BRAND}. All rights reserved.</p>
            </footer>
        </div>
    );
}
