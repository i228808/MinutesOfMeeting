import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Check, ArrowRight, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const BRAND = 'Minute Maker';

const pricingTiers = [
    {
        name: 'Starter',
        price: { monthly: 10, annual: 8 },
        description: 'For individuals getting started',
        features: [
            '20 meetings per month',
            '2 hours of audio',
            '10 contracts',
            'Email support',
            'Basic analytics'
        ],
        limitations: [
            'No team collaboration',
            'No API access',
            'No custom templates'
        ],
        cta: 'Start free trial',
        popular: false
    },
    {
        name: 'Pro',
        price: { monthly: 30, annual: 24 },
        description: 'For teams and power users',
        features: [
            '50 meetings per month',
            '5 hours of audio',
            'Unlimited contracts',
            'Priority support',
            'Custom templates',
            'Team collaboration',
            'Advanced analytics',
            'Slack integration'
        ],
        limitations: [],
        cta: 'Start free trial',
        popular: true
    },
    {
        name: 'Enterprise',
        price: { monthly: 70, annual: 56 },
        description: 'For organizations at scale',
        features: [
            'Unlimited meetings',
            'Unlimited audio',
            'Unlimited contracts',
            'API access',
            'SSO & SAML',
            '24/7 dedicated support',
            'Custom integrations',
            'SLA guarantee',
            'Dedicated account manager'
        ],
        limitations: [],
        cta: 'Contact sales',
        popular: false
    }
];

const faqs = [
    {
        question: 'Can I try before I buy?',
        answer: 'Yes! All plans come with a 14-day free trial. No credit card required to start.'
    },
    {
        question: 'What happens if I exceed my limits?',
        answer: 'We\'ll notify you when you\'re approaching your limits. You can upgrade at any time, or we\'ll roll over unused capacity to the next month.'
    },
    {
        question: 'Can I cancel anytime?',
        answer: 'Absolutely. Cancel anytime from your account settings. If you cancel, you\'ll retain access until the end of your billing period.'
    },
    {
        question: 'Do you offer discounts for nonprofits?',
        answer: 'Yes, we offer 50% off for registered nonprofits and educational institutions. Contact our sales team to learn more.'
    },
    {
        question: 'Is my data secure?',
        answer: 'Security is our top priority. We\'re SOC 2 Type II certified, GDPR compliant, and all data is encrypted in transit and at rest.'
    }
];

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <div style={{ background: '#0A0A0C', minHeight: '100vh', color: '#F5F5F7', overflowY: 'auto', overflowX: 'hidden' }}>
            <Helmet>
                <title>Pricing | Minute Maker - Start Free, Upgrade for Power</title>
                <meta name="description" content="Simple, transparent pricing. Start for free with 5 meetings/month. Upgrade to Pro for unlimited contracts and advanced AI analysis." />
            </Helmet>
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
                            <Link to="/pricing" style={{ fontSize: '14px', color: '#FF6B4A', fontWeight: '600' }}>Pricing</Link>
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

            {/* Hero */}
            <section style={{ paddingTop: '160px', paddingBottom: '40px', textAlign: 'center' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.03em' }}>
                        Simple, transparent pricing
                    </h1>
                    <p style={{ fontSize: '20px', color: '#A1A1A6', marginBottom: '32px' }}>
                        Start free. Upgrade when you need more. No surprises.
                    </p>

                    {/* Toggle */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '4px', background: '#111114', borderRadius: '10px' }}>
                        <button
                            onClick={() => setIsAnnual(false)}
                            style={{
                                padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: !isAnnual ? '#FF6B4A' : 'transparent',
                                color: !isAnnual ? '#030303' : '#A1A1A6',
                                fontWeight: '600', fontSize: '14px'
                            }}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            style={{
                                padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: isAnnual ? '#FF6B4A' : 'transparent',
                                color: isAnnual ? '#030303' : '#A1A1A6',
                                fontWeight: '600', fontSize: '14px'
                            }}
                        >
                            Annual <span style={{ fontSize: '12px', opacity: 0.8 }}>(-20%)</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section style={{ padding: '40px 24px 100px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {pricingTiers.map(tier => (
                            <div key={tier.name} style={{
                                background: tier.popular ? '#18181C' : '#111114',
                                borderRadius: '20px',
                                padding: '36px',
                                border: tier.popular ? '2px solid #FF6B4A' : '1px solid rgba(255,255,255,0.05)',
                                position: 'relative'
                            }}>
                                {tier.popular && (
                                    <span style={{
                                        position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                        background: '#FF6B4A', padding: '4px 14px', borderRadius: '100px',
                                        fontSize: '11px', fontWeight: '700', color: '#030303', letterSpacing: '0.03em'
                                    }}>MOST POPULAR</span>
                                )}

                                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>{tier.name}</h3>
                                <p style={{ fontSize: '14px', color: '#6B6B70', marginBottom: '24px' }}>{tier.description}</p>

                                <div style={{ marginBottom: '28px' }}>
                                    <span style={{ fontSize: '48px', fontWeight: '800' }}>
                                        ${isAnnual ? tier.price.annual : tier.price.monthly}
                                    </span>
                                    <span style={{ color: '#6B6B70', fontSize: '15px' }}>/mo</span>
                                    {isAnnual && (
                                        <p style={{ fontSize: '13px', color: '#4AE3B5', marginTop: '4px' }}>
                                            Billed annually (${(isAnnual ? tier.price.annual : tier.price.monthly) * 12}/year)
                                        </p>
                                    )}
                                </div>

                                <ul style={{ listStyle: 'none', marginBottom: '28px' }}>
                                    {tier.features.map(f => (
                                        <li key={f} style={{ padding: '8px 0', fontSize: '14px', color: '#A1A1A6', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <Check size={16} color="#4AE3B5" style={{ marginTop: '2px', flexShrink: 0 }} /> {f}
                                        </li>
                                    ))}
                                </ul>

                                <Link to={tier.cta === 'Contact sales' ? '/contact' : '/login'} style={{
                                    display: 'block', textAlign: 'center', padding: '14px',
                                    background: tier.popular ? '#FF6B4A' : 'rgba(255,255,255,0.05)',
                                    borderRadius: '10px', fontWeight: '600', fontSize: '15px',
                                    color: tier.popular ? '#030303' : '#F5F5F7'
                                }}>
                                    {tier.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section style={{ padding: '80px 24px', background: '#0f0f12' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>
                        Frequently asked questions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {faqs.map((faq, i) => (
                            <div key={i} style={{
                                background: '#111114',
                                borderRadius: '12px',
                                padding: '24px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <HelpCircle size={20} color="#FF6B4A" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{faq.question}</h3>
                                        <p style={{ fontSize: '15px', color: '#A1A1A6', lineHeight: 1.6 }}>{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '100px 24px', textAlign: 'center' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
                        Still have questions?
                    </h2>
                    <p style={{ fontSize: '18px', color: '#A1A1A6', marginBottom: '32px' }}>
                        Our team is happy to help you find the right plan.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <Link to="/contact" style={{
                            padding: '14px 28px', background: '#FF6B4A', borderRadius: '10px',
                            fontWeight: '600', fontSize: '15px', color: '#030303',
                            display: 'inline-flex', alignItems: 'center', gap: '8px'
                        }}>
                            Contact sales <ArrowRight size={16} />
                        </Link>
                        <Link to="/login" style={{
                            padding: '14px 28px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
                            fontWeight: '600', fontSize: '15px', color: '#F5F5F7', border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            Start free trial
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
