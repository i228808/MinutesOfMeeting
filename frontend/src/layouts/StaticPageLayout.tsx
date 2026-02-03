import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

const BRAND = 'Minute Maker';

interface StaticPageLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    lastUpdated?: string;
}

export default function StaticPageLayout({ title, subtitle, children, lastUpdated }: StaticPageLayoutProps) {
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
                            <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>{BRAND}</span>
                        </Link>
                        <div style={{ display: 'flex', gap: '28px' }}>
                            <Link to="/features" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>Features</Link>
                            <Link to="/pricing" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>Pricing</Link>
                            <Link to="/docs" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>Docs</Link>
                            <Link to="/about" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>About</Link>
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

            {/* Header */}
            <section style={{ paddingTop: '140px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6B6B70', marginBottom: '24px' }}>
                        <ArrowLeft size={16} /> Back to home
                    </Link>
                    <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: subtitle ? '12px' : '0', letterSpacing: '-0.02em' }}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p style={{ fontSize: '18px', color: '#A1A1A6' }}>{subtitle}</p>
                    )}
                    {lastUpdated && (
                        <p style={{ fontSize: '14px', color: '#6B6B70', marginTop: '16px' }}>Last updated: {lastUpdated}</p>
                    )}
                </div>
            </section>

            {/* Content */}
            <section style={{ padding: '60px 24px 100px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {children}
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}

// Reusable styles for legal content
export const legalStyles = {
    section: {
        marginBottom: '48px'
    },
    heading: {
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#F5F5F7'
    },
    subheading: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#F5F5F7',
        marginTop: '24px'
    },
    paragraph: {
        fontSize: '16px',
        color: '#A1A1A6',
        lineHeight: 1.8,
        marginBottom: '16px'
    },
    list: {
        paddingLeft: '24px',
        marginBottom: '16px'
    },
    listItem: {
        fontSize: '16px',
        color: '#A1A1A6',
        lineHeight: 1.8,
        marginBottom: '8px'
    }
};
