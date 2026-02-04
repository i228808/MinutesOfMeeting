import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    Sparkles,
    Mic,
    Brain,
    FileSignature,
    Calendar,
    ArrowRight,
    ArrowUpRight,
    Check,
    Globe,
    Users,
    Clock,
    Zap,
    BarChart3,
    Shield,
    FileText,
    Settings,
    MessageSquare
} from 'lucide-react';
import Footer from '../components/Footer';

const BRAND = 'Minute Maker';

// Detailed feature sections with UI descriptions
const featureSections = [
    {
        id: 'transcription',
        icon: Mic,
        title: 'Real-Time Transcription',
        headline: 'Every word captured, perfectly.',
        description: 'Our AI transcription engine delivers 95%+ accuracy across 50+ languages. Speaker identification, live captions, and the ability to edit on the fly make it the most powerful meeting transcription on the market.',
        features: [
            { icon: Globe, text: '50+ languages supported' },
            { icon: Users, text: 'Automatic speaker identification' },
            { icon: Clock, text: 'Real-time processing' },
            { icon: Zap, text: 'Sub-second latency' }
        ],
        cta: 'Learn more about transcription',
        link: '/features', // Self-link for now, or could be a sub-page
        // UI mockup content
        mockup: {
            type: 'transcript',
            content: [
                { speaker: 'Sarah', color: '#FF6B4A', text: 'Let\'s finalize the Q2 roadmap. Mike, can you own the API revamp?' },
                { speaker: 'Mike', color: '#4AE3B5', text: 'Sure, I\'ll have the first draft by March 15th.' },
                { speaker: 'Lisa', color: '#FFB84D', text: 'I\'ll prepare the design specs. Should be ready by Monday.' }
            ]
        }
    },
    {
        id: 'insights',
        icon: Brain,
        title: 'AI-Powered Insights',
        headline: 'Your AI meeting assistant.',
        description: 'Never miss an action item again. Our AI automatically extracts key decisions, action items with owners, and critical deadlines from every conversation. Smart summaries give you the essence in seconds.',
        features: [
            { icon: BarChart3, text: 'Smart meeting summaries' },
            { icon: Check, text: 'Action items with owners' },
            { icon: MessageSquare, text: 'Key decisions highlighted' },
            { icon: Clock, text: 'Deadline extraction' }
        ],
        cta: 'Explore AI insights',
        link: '/features',
        mockup: {
            type: 'insights',
            content: {
                summary: 'Team aligned on Q2 roadmap priorities. API revamp assigned to Mike, design specs to Lisa.',
                actions: [
                    { owner: 'Mike', task: 'Complete API revamp draft', due: 'Mar 15', status: 'pending' },
                    { owner: 'Lisa', task: 'Deliver design specs', due: 'Monday', status: 'pending' }
                ],
                decisions: ['Q2 roadmap approved', 'API-first approach confirmed']
            }
        }
    },
    {
        id: 'contracts',
        icon: FileSignature,
        title: 'Contract Generation',
        headline: 'From discussion to document.',
        description: 'Transform meeting agreements into legally-sound contracts instantly. Our templates cover 20+ jurisdictions with automatic clause suggestions and compliance checks built in.',
        features: [
            { icon: Globe, text: '20+ jurisdiction templates' },
            { icon: Shield, text: 'Compliance checks included' },
            { icon: FileText, text: 'Smart clause suggestions' },
            { icon: Zap, text: 'One-click PDF export' }
        ],
        cta: 'See contract templates',
        link: '/features',
        mockup: {
            type: 'contract',
            content: {
                title: 'Service Agreement Draft',
                generated: 'Auto-generated from meeting',
                jurisdiction: 'US - California',
                clauses: [
                    '1.1 Provider agrees to deliver API integration services...',
                    '2.3 Payment terms: Net 30 from delivery date...',
                    '3.1 Confidentiality obligations apply to all parties...'
                ],
                compliance: ['GDPR compliant', 'SOC2 ready', 'CCPA aligned']
            }
        }
    },
    {
        id: 'calendar',
        icon: Calendar,
        title: 'Calendar Integration',
        headline: 'Deadlines that schedule themselves.',
        description: 'Every deadline and follow-up from your meetings automatically appears in Google Calendar. Smart reminders ensure nothing falls through the cracks. Team calendar sync keeps everyone aligned.',
        features: [
            { icon: Calendar, text: 'Google Calendar sync' },
            { icon: Users, text: 'Team calendar support' },
            { icon: Clock, text: 'Smart reminders' },
            { icon: Settings, text: 'Conflict detection' }
        ],
        cta: 'Set up calendar sync',
        link: '/features',
        mockup: {
            type: 'calendar',
            content: [
                { date: 'Mon, Mar 10', event: 'Design specs review', color: '#FFB84D', owner: 'Lisa' },
                { date: 'Wed, Mar 12', event: 'API milestone check-in', color: '#FF6B4A', owner: 'Team' },
                { date: 'Sat, Mar 15', event: 'API revamp deadline', color: '#4AE3B5', owner: 'Mike' }
            ]
        }
    }
];

export default function FeaturesPage() {
    return (
        <div style={{ background: '#0A0A0C', minHeight: '100vh', color: '#F5F5F7', overflowY: 'auto', overflowX: 'hidden' }}>
            <Helmet>
                <title>Features | Minute Maker - Transcription, AI Insights & Contracts</title>
                <meta name="description" content="Explore Minute Maker's features: 95% accurate transcription, AI action item extraction, automated contract drafting, and Google Calendar sync." />
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
                            <Link to="/features" style={{ fontSize: '14px', color: '#FF6B4A', fontWeight: '600' }}>Features</Link>
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

            {/* Hero */}
            <section style={{ paddingTop: '160px', paddingBottom: '60px', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
                    <h1 style={{ fontSize: '52px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.03em' }}>
                        Everything you need to <span style={{ color: '#FF6B4A' }}>automate meetings</span>
                    </h1>
                    <p style={{ fontSize: '20px', color: '#A1A1A6', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 32px' }}>
                        From transcription to contracts, {BRAND} handles the busy work so you can focus on what matters.
                    </p>
                    <Link to="/login" style={{
                        padding: '14px 28px', background: '#FF6B4A', borderRadius: '10px',
                        fontWeight: '700', fontSize: '16px', color: '#030303',
                        display: 'inline-flex', alignItems: 'center', gap: '8px'
                    }}>
                        Start free trial <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Detailed Feature Sections */}
            {featureSections.map((section, sectionIndex) => {
                const SectionIcon = section.icon;
                const isReversed = sectionIndex % 2 === 1;

                return (
                    <section
                        key={section.id}
                        id={section.id}
                        style={{
                            padding: '100px 24px',
                            background: sectionIndex % 2 === 0 ? '#0A0A0C' : '#0f0f12'
                        }}
                    >
                        <div style={{
                            maxWidth: '1100px',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.2fr)',
                            gap: '80px',
                            alignItems: 'center',
                            direction: isReversed ? 'rtl' : 'ltr'
                        }}>
                            {/* Text Content */}
                            <div style={{ direction: 'ltr' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: 'rgba(255, 107, 74, 0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <SectionIcon size={18} style={{ color: '#FF6B4A' }} />
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#FF6B4A', letterSpacing: '0.05em' }}>
                                        {section.title.toUpperCase()}
                                    </span>
                                </div>

                                <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                                    {section.headline}
                                </h2>
                                <p style={{ fontSize: '16px', color: '#A1A1A6', marginBottom: '32px', lineHeight: 1.7 }}>
                                    {section.description}
                                </p>

                                {/* Feature list */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                    {section.features.map((feature, i) => {
                                        const FeatureIcon = feature.icon;
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <FeatureIcon size={16} style={{ color: '#4AE3B5' }} />
                                                <span style={{ fontSize: '14px', color: '#A1A1A6' }}>{feature.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Link to={section.link} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    fontSize: '15px', fontWeight: '600', color: '#FF6B4A'
                                }}>
                                    {section.cta} <ArrowUpRight size={16} />
                                </Link>
                            </div>

                            {/* UI Mockup */}
                            <div style={{ direction: 'ltr' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                }}>
                                    {/* Window chrome */}
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F56' }} />
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E' }} />
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27C93F' }} />
                                    </div>

                                    {/* Mockup content based on type */}
                                    {section.mockup.type === 'transcript' && (
                                        <div style={{ fontFamily: 'system-ui', fontSize: '14px', lineHeight: 2 }}>
                                            {(section.mockup.content as { speaker: string; color: string; text: string }[]).map((line, i) => (
                                                <p key={i} style={{ marginBottom: '12px' }}>
                                                    <span style={{ color: line.color, fontWeight: '600' }}>{line.speaker}:</span>
                                                    <span style={{ color: '#A1A1A6' }}> {line.text}</span>
                                                </p>
                                            ))}
                                            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(74, 227, 181, 0.1)', borderRadius: '10px', borderLeft: '3px solid #4AE3B5' }}>
                                                <p style={{ color: '#4AE3B5', fontSize: '11px', fontWeight: '700', marginBottom: '6px', letterSpacing: '0.05em' }}>ACTION DETECTED</p>
                                                <p style={{ color: '#F5F5F7', fontSize: '13px' }}>Mike → API revamp draft → Due: Mar 15</p>
                                            </div>
                                        </div>
                                    )}

                                    {section.mockup.type === 'insights' && (
                                        <div>
                                            <div style={{ marginBottom: '20px' }}>
                                                <p style={{ fontSize: '11px', color: '#6B6B70', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '8px' }}>MEETING SUMMARY</p>
                                                <p style={{ fontSize: '14px', color: '#F5F5F7', lineHeight: 1.6 }}>{(section.mockup.content as { summary: string }).summary}</p>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                                <div style={{ padding: '14px', background: 'rgba(255,107,74,0.1)', borderRadius: '10px' }}>
                                                    <p style={{ fontSize: '28px', fontWeight: '800', color: '#FF6B4A' }}>{(section.mockup.content as { actions: unknown[] }).actions.length}</p>
                                                    <p style={{ fontSize: '12px', color: '#6B6B70' }}>Action items</p>
                                                </div>
                                                <div style={{ padding: '14px', background: 'rgba(74,227,181,0.1)', borderRadius: '10px' }}>
                                                    <p style={{ fontSize: '28px', fontWeight: '800', color: '#4AE3B5' }}>{(section.mockup.content as { decisions: unknown[] }).decisions.length}</p>
                                                    <p style={{ fontSize: '12px', color: '#6B6B70' }}>Decisions</p>
                                                </div>
                                            </div>
                                            <div>
                                                {(section.mockup.content as { actions: { owner: string; task: string; due: string }[] }).actions.map((action, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFB84D' }} />
                                                            <span style={{ fontSize: '13px', color: '#F5F5F7' }}>{action.task}</span>
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#6B6B70' }}>Due: {action.due}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {section.mockup.type === 'contract' && (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                                <FileSignature size={20} style={{ color: '#FF6B4A' }} />
                                                <div>
                                                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#F5F5F7' }}>{(section.mockup.content as { title: string }).title}</p>
                                                    <p style={{ fontSize: '12px', color: '#6B6B70' }}>{(section.mockup.content as { generated: string }).generated} • {(section.mockup.content as { jurisdiction: string }).jurisdiction}</p>
                                                </div>
                                            </div>
                                            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', marginBottom: '16px' }}>
                                                {(section.mockup.content as { clauses: string[] }).clauses.map((clause, i) => (
                                                    <p key={i} style={{ fontSize: '13px', color: '#A1A1A6', marginBottom: '10px', lineHeight: 1.6 }}>{clause}</p>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {(section.mockup.content as { compliance: string[] }).compliance.map((item, i) => (
                                                    <span key={i} style={{ padding: '4px 10px', background: 'rgba(74,227,181,0.15)', borderRadius: '4px', fontSize: '11px', color: '#4AE3B5', fontWeight: '600' }}>
                                                        ✓ {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {section.mockup.type === 'calendar' && (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                                <Calendar size={18} style={{ color: '#FF6B4A' }} />
                                                <p style={{ fontSize: '15px', fontWeight: '600', color: '#F5F5F7' }}>March 2025</p>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {(section.mockup.content as { date: string; event: string; color: string; owner: string }[]).map((item, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                                        <div style={{ width: '4px', height: '36px', background: item.color, borderRadius: '2px' }} />
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontSize: '11px', color: '#6B6B70' }}>{item.date}</p>
                                                            <p style={{ fontSize: '14px', color: '#F5F5F7', fontWeight: '500' }}>{item.event}</p>
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: '#6B6B70' }}>{item.owner}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* CTA */}
            <section style={{ padding: '100px 24px', background: '#0f0f12', textAlign: 'center' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
                        Ready to automate your meetings?
                    </h2>
                    <p style={{ fontSize: '18px', color: '#A1A1A6', marginBottom: '32px' }}>
                        Start your free trial today. No credit card required.
                    </p>
                    <Link to="/login" style={{
                        padding: '16px 32px', background: '#FF6B4A', borderRadius: '12px',
                        fontWeight: '700', fontSize: '17px', color: '#030303',
                        display: 'inline-flex', alignItems: 'center', gap: '8px'
                    }}>
                        Get started free <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
