import { Link } from 'react-router-dom';
import { Sparkles, Book, Code, FileText, ArrowRight, Search, ChevronRight } from 'lucide-react';

const BRAND = 'Minute Maker';

const docSections = [
    {
        title: 'Getting Started',
        icon: Book,
        items: [
            { title: 'Quick Start Guide', desc: 'Get up and running in 5 minutes', href: '/docs/quickstart' },
            { title: 'Account Setup', desc: 'Configure your account', href: '/docs/account-setup' }
        ]
    },
    {
        title: 'Features',
        icon: FileText,
        items: [
            { title: 'Transcription', desc: 'How our transcription works', href: '/docs/transcription' },
            { title: 'AI Insights', desc: 'AI-generated summaries', href: '/docs/ai-insights' }
        ]
    },
    {
        title: 'API Reference',
        icon: Code,
        items: [
            { title: 'Authentication', desc: 'API keys and OAuth', href: '/docs/api/auth' },
            { title: 'Meetings API', desc: 'Manage meetings', href: '/docs/api/meetings' }
        ]
    }
];

export default function DocsPage() {
    return (
        <div style={{ background: '#0A0A0C', minHeight: '100vh', color: '#F5F5F7', overflowY: 'auto', overflowX: 'hidden' }}>
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                padding: '14px 24px', background: 'rgba(10,10,12,0.95)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #FF6B4A, #FF9A7A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={20} color="#030303" strokeWidth={2.5} />
                            </div>
                            <span style={{ fontSize: '22px', fontWeight: '800' }}>{BRAND}</span>
                        </Link>
                        <div style={{ display: 'flex', gap: '28px' }}>
                            <Link to="/features" style={{ fontSize: '14px', color: '#A1A1A6' }}>Features</Link>
                            <Link to="/pricing" style={{ fontSize: '14px', color: '#A1A1A6' }}>Pricing</Link>
                            <Link to="/docs" style={{ fontSize: '14px', color: '#FF6B4A', fontWeight: '600' }}>Docs</Link>
                        </div>
                    </div>
                    <Link to="/login" style={{ padding: '10px 20px', background: '#FF6B4A', borderRadius: '8px', fontWeight: '600', fontSize: '14px', color: '#030303' }}>Get Started</Link>
                </div>
            </nav>

            <section style={{ paddingTop: '160px', paddingBottom: '40px', textAlign: 'center' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Documentation</h1>
                    <p style={{ fontSize: '20px', color: '#A1A1A6', marginBottom: '32px' }}>Everything you need to get the most out of {BRAND}.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#111114', borderRadius: '12px', padding: '14px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Search size={20} color="#6B6B70" />
                        <input type="text" placeholder="Search documentation..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#F5F5F7' }} />
                    </div>
                </div>
            </section>

            <section style={{ padding: '60px 24px 100px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {docSections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <div key={section.title} style={{ marginBottom: '60px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 107, 74, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon size={20} color="#FF6B4A" />
                                    </div>
                                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{section.title}</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    {section.items.map((item) => (
                                        <Link key={item.title} to={item.href} style={{ padding: '20px', background: '#111114', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{item.title}</h3>
                                                <p style={{ fontSize: '14px', color: '#6B6B70' }}>{item.desc}</p>
                                            </div>
                                            <ChevronRight size={20} color="#6B6B70" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section style={{ padding: '80px 24px', background: '#0f0f12', textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Need help?</h2>
                <p style={{ fontSize: '16px', color: '#A1A1A6', marginBottom: '24px' }}>Our support team is here to help.</p>
                <Link to="/help" style={{ padding: '14px 28px', background: '#FF6B4A', borderRadius: '10px', fontWeight: '600', fontSize: '15px', color: '#030303', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Contact Support <ArrowRight size={16} />
                </Link>
            </section>

            <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2025 {BRAND}. All rights reserved.</p>
            </footer>
        </div>
    );
}
