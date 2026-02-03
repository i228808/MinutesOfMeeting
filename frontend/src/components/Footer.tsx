import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const BRAND = 'Minute Maker';

const footerLinks = {
    product: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'Changelog', href: '/changelog' }
    ],
    company: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Contact', href: '/contact' }
    ],
    resources: [
        { label: 'Documentation', href: '/docs' },
        { label: 'Help Center', href: '/help' },
        { label: 'API Reference', href: '/docs/api' },
        { label: 'Status', href: '/status' }
    ],
    legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'GDPR', href: '/gdpr' }
    ]
};

export default function Footer() {
    return (
        <footer style={{ padding: '80px 24px 40px', background: '#0f0f12', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '48px', marginBottom: '60px' }}>
                    {/* Brand column */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'linear-gradient(135deg, #FF6B4A, #FF9A7A)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Sparkles size={16} color="#030303" strokeWidth={2.5} />
                            </div>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#F5F5F7' }}>{BRAND}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#6B6B70', lineHeight: 1.6, maxWidth: '260px' }}>
                            Automated meeting workflows for modern teams. Transcribe, analyze, and act — all in one place.
                        </p>
                    </div>

                    {/* Link columns */}
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#F5F5F7', marginBottom: '16px', letterSpacing: '0.05em' }}>PRODUCT</p>
                        {footerLinks.product.map(link => (
                            <Link key={link.label} to={link.href} style={{ display: 'block', fontSize: '14px', color: '#A1A1A6', padding: '6px 0', textDecoration: 'none' }}>{link.label}</Link>
                        ))}
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#F5F5F7', marginBottom: '16px', letterSpacing: '0.05em' }}>COMPANY</p>
                        {footerLinks.company.map(link => (
                            <Link key={link.label} to={link.href} style={{ display: 'block', fontSize: '14px', color: '#A1A1A6', padding: '6px 0', textDecoration: 'none' }}>{link.label}</Link>
                        ))}
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#F5F5F7', marginBottom: '16px', letterSpacing: '0.05em' }}>RESOURCES</p>
                        {footerLinks.resources.map(link => (
                            <Link key={link.label} to={link.href} style={{ display: 'block', fontSize: '14px', color: '#A1A1A6', padding: '6px 0', textDecoration: 'none' }}>{link.label}</Link>
                        ))}
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#F5F5F7', marginBottom: '16px', letterSpacing: '0.05em' }}>LEGAL</p>
                        {footerLinks.legal.map(link => (
                            <Link key={link.label} to={link.href} style={{ display: 'block', fontSize: '14px', color: '#A1A1A6', padding: '6px 0', textDecoration: 'none' }}>{link.label}</Link>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2026 {BRAND}. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <a href="#" style={{ fontSize: '13px', color: '#6B6B70', textDecoration: 'none' }}>Twitter</a>
                        <a href="#" style={{ fontSize: '13px', color: '#6B6B70', textDecoration: 'none' }}>LinkedIn</a>
                        <a href="#" style={{ fontSize: '13px', color: '#6B6B70', textDecoration: 'none' }}>GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
