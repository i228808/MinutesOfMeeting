import { Link } from 'react-router-dom';
import {
    Sparkles,
    Users,
    Target,
    Heart,
    Zap,
    ArrowRight,
    Globe,
    Shield,
    Award
} from 'lucide-react';

const BRAND = 'Brevity';

const values = [
    {
        icon: Target,
        title: 'Mission-Driven',
        description: 'We believe meetings should create value, not consume it. Every feature we build brings teams closer to this vision.'
    },
    {
        icon: Users,
        title: 'User-Centric',
        description: 'Our users are at the heart of every decision. We ship fast, listen carefully, and iterate relentlessly.'
    },
    {
        icon: Heart,
        title: 'Transparent',
        description: 'We build trust through openness. Our pricing is clear, our policies are readable, and our roadmap is public.'
    },
    {
        icon: Zap,
        title: 'Excellence',
        description: 'We sweat the details. From pixel-perfect UI to sub-second latency, we hold ourselves to the highest standards.'
    }
];

const stats = [
    { value: '50K+', label: 'Active users' },
    { value: '2M+', label: 'Meetings processed' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '50+', label: 'Languages supported' }
];

const team = [
    { name: 'Sarah Chen', role: 'CEO & Co-founder', image: null },
    { name: 'Mike Johnson', role: 'CTO & Co-founder', image: null },
    { name: 'Lisa Park', role: 'VP Engineering', image: null },
    { name: 'David Wong', role: 'VP Product', image: null }
];

export default function AboutPage() {
    return (
        <div style={{ background: '#0A0A0C', minHeight: '100vh', color: '#F5F5F7', overflowY: 'auto', overflowX: 'hidden' }}>
            {/* Nav */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                padding: '14px 24px', background: 'rgba(10,10,12,0.95)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #FF6B4A, #FF9A7A)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Sparkles size={20} color="#030303" strokeWidth={2.5} />
                            </div>
                            <span style={{ fontSize: '22px', fontWeight: '800' }}>{BRAND}</span>
                        </Link>
                        <div style={{ display: 'flex', gap: '28px' }}>
                            <Link to="/features" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>Features</Link>
                            <Link to="/pricing" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>Pricing</Link>
                            <Link to="/docs" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>Docs</Link>
                            <Link to="/about" style={{ fontSize: '14px', color: '#FF6B4A', fontWeight: '600' }}>About</Link>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link to="/login" style={{ padding: '10px 18px', color: '#A1A1A6', fontWeight: '600', fontSize: '14px' }}>Log in</Link>
                        <Link to="/login" style={{
                            padding: '10px 20px', background: '#FF6B4A', borderRadius: '8px',
                            fontWeight: '600', fontSize: '14px', color: '#030303'
                        }}>Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ paddingTop: '160px', paddingBottom: '80px', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
                    <h1 style={{ fontSize: '52px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.03em' }}>
                        Making meetings <span style={{ color: '#FF6B4A' }}>actually useful</span>
                    </h1>
                    <p style={{ fontSize: '20px', color: '#A1A1A6', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
                        We're building the future of meeting productivity. Our AI-powered platform transforms
                        conversations into action, helping teams ship faster and communicate better.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section style={{ padding: '60px 24px', background: '#0f0f12' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <p style={{ fontSize: '40px', fontWeight: '800', color: '#FF6B4A', marginBottom: '8px' }}>{stat.value}</p>
                                <p style={{ fontSize: '14px', color: '#6B6B70' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section style={{ padding: '100px 24px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '13px', color: '#FF6B4A', fontWeight: '600', letterSpacing: '0.1em', marginBottom: '12px' }}>OUR MISSION</p>
                            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px', lineHeight: 1.2 }}>
                                Turn every meeting into measurable progress
                            </h2>
                            <p style={{ fontSize: '16px', color: '#A1A1A6', lineHeight: 1.8, marginBottom: '16px' }}>
                                We started {BRAND} because we were tired of leaving meetings with no clear next steps.
                                Important decisions got lost. Action items fell through the cracks. Follow-ups never happened.
                            </p>
                            <p style={{ fontSize: '16px', color: '#A1A1A6', lineHeight: 1.8 }}>
                                Today, we're building the AI-powered platform that makes every meeting productive by default.
                                From transcription to task management to contract generation — all automated, all connected.
                            </p>
                        </div>
                        <div style={{ background: '#111114', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #FF6B4A, #FF9A7A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={24} color="#030303" />
                                </div>
                                <div>
                                    <p style={{ fontWeight: '600', fontSize: '16px' }}>{BRAND}</p>
                                    <p style={{ fontSize: '13px', color: '#6B6B70' }}>Founded 2024 • San Francisco</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Globe size={16} color="#4AE3B5" />
                                    <span style={{ fontSize: '13px', color: '#A1A1A6' }}>Global</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Shield size={16} color="#4AE3B5" />
                                    <span style={{ fontSize: '13px', color: '#A1A1A6' }}>SOC 2 Certified</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Award size={16} color="#4AE3B5" />
                                    <span style={{ fontSize: '13px', color: '#A1A1A6' }}>GDPR Compliant</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section style={{ padding: '100px 24px', background: '#0f0f12' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <p style={{ fontSize: '13px', color: '#FF6B4A', fontWeight: '600', letterSpacing: '0.1em', marginBottom: '12px' }}>OUR VALUES</p>
                        <h2 style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-0.02em' }}>What we believe</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                        {values.map((value) => {
                            const Icon = value.icon;
                            return (
                                <div key={value.title} style={{
                                    background: '#111114',
                                    borderRadius: '16px',
                                    padding: '28px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: 'rgba(255, 107, 74, 0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <Icon size={24} color="#FF6B4A" />
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>{value.title}</h3>
                                    <p style={{ fontSize: '15px', color: '#A1A1A6', lineHeight: 1.7 }}>{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section style={{ padding: '100px 24px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <p style={{ fontSize: '13px', color: '#FF6B4A', fontWeight: '600', letterSpacing: '0.1em', marginBottom: '12px' }}>OUR TEAM</p>
                        <h2 style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-0.02em' }}>Meet the people behind {BRAND}</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                        {team.map((member) => (
                            <div key={member.name} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '120px', height: '120px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                                    margin: '0 auto 16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <Users size={40} color="#6B6B70" />
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{member.name}</h3>
                                <p style={{ fontSize: '13px', color: '#6B6B70' }}>{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '100px 24px', background: '#0f0f12', textAlign: 'center' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
                        Ready to join us?
                    </h2>
                    <p style={{ fontSize: '18px', color: '#A1A1A6', marginBottom: '32px' }}>
                        We're always looking for talented people who share our mission.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <Link to="/careers" style={{
                            padding: '14px 28px', background: '#FF6B4A', borderRadius: '10px',
                            fontWeight: '600', fontSize: '15px', color: '#030303',
                            display: 'inline-flex', alignItems: 'center', gap: '8px'
                        }}>
                            View open positions <ArrowRight size={16} />
                        </Link>
                        <Link to="/login" style={{
                            padding: '14px 28px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
                            fontWeight: '600', fontSize: '15px', color: '#F5F5F7', border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            Try {BRAND} free
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2025 {BRAND}. All rights reserved.</p>
            </footer>
        </div>
    );
}
