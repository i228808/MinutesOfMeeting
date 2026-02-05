import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import {
    ArrowRight,
    Mic,
    Calendar,
    Check,
    Play,
    ChevronRight,
    Brain,
    FileSignature,
    Star,
    Upload,
    Users,
    Shield,
    Zap,
    Globe,
    Clock,
    BarChart3,
    MessageSquare,
    FileText,
    Settings,
    ArrowUpRight,
    Menu,
    X
} from 'lucide-react';

const BRAND = 'Minute Maker';

// The 4 steps of our workflow
const flowSteps = [
    {
        step: 1,
        icon: Upload,
        title: 'Upload',
        desc: 'Drop your meeting recording or connect live',
        color: '#FF6B4A'
    },
    {
        step: 2,
        icon: Mic,
        title: 'Transcribe',
        desc: 'AI converts speech to text in real-time',
        color: '#FFB84D'
    },
    {
        step: 3,
        icon: Brain,
        title: 'Analyze',
        desc: 'Extract action items, decisions & deadlines',
        color: '#4AE3B5'
    },
    {
        step: 4,
        icon: Calendar,
        title: 'Sync',
        desc: 'Tasks auto-sync to your calendar',
        color: '#5C9DFF'
    }
];

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
        link: '/features/transcription',
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
        link: '/features/insights',
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
        link: '/features/contracts',
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
        link: '/features/calendar',
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

// Pricing
const pricingTiers = [
    {
        name: 'Starter',
        price: 10,
        desc: 'For individuals getting started',
        features: ['20 meetings/month', '2 hours audio', '10 contracts', 'Email support'],
        cta: 'Start free trial'
    },
    {
        name: 'Pro',
        price: 30,
        desc: 'For teams and power users',
        features: ['50 meetings/month', '5 hours audio', 'Unlimited contracts', 'Priority support', 'Custom templates', 'Team collaboration'],
        popular: true,
        cta: 'Start free trial'
    },
    {
        name: 'Enterprise',
        price: 70,
        desc: 'For organizations at scale',
        features: ['Unlimited meetings', 'Unlimited audio', 'API access', 'SSO & SAML', '24/7 dedicated support', 'Custom integrations'],
        cta: 'Contact sales'
    }
];

// Testimonials
const testimonials = [
    {
        quote: "Cut our meeting follow-up time from 2 hours to 5 minutes. Game changer for our remote team.",
        author: "Sarah Chen",
        role: "VP Operations",
        company: "TechFlow",
        rating: 5
    },
    {
        quote: "The contract generation alone saved us from hiring an additional legal assistant.",
        author: "Michael Park",
        role: "General Counsel",
        company: "StartupCo",
        rating: 5
    },
    {
        quote: "Finally, a tool that actually understands what was said and what needs to happen next.",
        author: "Emily Rodriguez",
        role: "Product Manager",
        company: "BuildFast",
        rating: 5
    }
];

// Logos for social proof
const companyLogos = ['Stripe', 'Notion', 'Linear', 'Vercel', 'Figma', 'GitHub'];

// Footer links


export default function LandingPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-animate through steps
    useEffect(() => {
        if (isAnimating) {
            intervalRef.current = setInterval(() => {
                setActiveStep(prev => (prev + 1) % flowSteps.length);
            }, 2500);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isAnimating]);

    // Enhanced Schema.org markup for SEO and GEO (LLM optimization)
    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "@id": "https://www.minutemaker.tech/#software",
                "name": "Minute Maker",
                "url": "https://www.minutemaker.tech",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web, Chrome Extension",
                "offers": {
                    "@type": "AggregateOffer",
                    "lowPrice": "0",
                    "highPrice": "70",
                    "priceCurrency": "USD",
                    "offerCount": "3"
                },
                "description": "AI-powered meeting assistant that automatically transcribes meetings, extracts action items, and generates legal contracts from voice conversations.",
                "featureList": [
                    "AI Meeting Transcription with 95%+ accuracy",
                    "Automatic Action Item Extraction",
                    "Legal Contract Generation",
                    "Google Calendar Sync",
                    "50+ Language Support",
                    "Speaker Identification"
                ],
                "screenshot": "https://www.minutemaker.tech/screenshot.jpg",
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "ratingCount": "1250",
                    "bestRating": "5",
                    "worstRating": "1"
                }
            },
            {
                "@type": "Organization",
                "@id": "https://www.minutemaker.tech/#organization",
                "name": "Minute Maker",
                "url": "https://www.minutemaker.tech",
                "logo": "https://www.minutemaker.tech/logo.svg",
                "description": "AI-powered meeting assistant for modern teams",
                "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "support@minutemaker.tech",
                    "contactType": "customer support"
                },
                "sameAs": [
                    "https://twitter.com/minutemaker",
                    "https://linkedin.com/company/minutemaker",
                    "https://github.com/minutemaker"
                ]
            },
            {
                "@type": "WebSite",
                "@id": "https://www.minutemaker.tech/#website",
                "url": "https://www.minutemaker.tech",
                "name": "Minute Maker",
                "publisher": { "@id": "https://www.minutemaker.tech/#organization" },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.minutemaker.tech/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "What is Minute Maker?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Minute Maker is an AI-powered meeting assistant that automatically transcribes meetings, extracts action items, and generates legal contracts from voice conversations."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How accurate is Minute Maker's transcription?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Our AI transcription engine delivers 95%+ accuracy across 50+ languages with automatic speaker identification."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can Minute Maker generate legally binding contracts?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Minute Maker generates contracts using templates reviewed by legal professionals covering 20+ jurisdictions. We recommend having a qualified attorney review any legal document before signing."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Is there a free trial?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes! All plans come with a 14-day free trial. No credit card required to start."
                        }
                    }
                ]
            }
        ]
    };

    return (
        <div style={{ background: '#0A0A0C', minHeight: '100vh', color: '#F5F5F7', overflowY: 'auto', overflowX: 'hidden' }}>
            <Helmet>
                <title>AI Meeting Notes & Contract Generator | Minute Maker</title>
                <meta name="description" content="Stop taking notes. Start closing deals. Minute Maker is an AI meeting assistant that records, transcribes, extracts action items, and instantly generates legal contracts from your conversations." />
                <meta name="keywords" content="AI meeting notes, AI meeting assistant, contract generator, meeting to contract, automated minutes, legal automation, voice to text, meeting transcription, action item extraction" />
                <link rel="canonical" href="https://www.minutemaker.tech/" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.minutemaker.tech/" />
                <meta property="og:title" content="Minute Maker | Turn Talk Into Contracts" />
                <meta property="og:description" content="The only AI meeting assistant that instantly drafts legal contracts from your voice conversations." />
                <meta property="og:image" content="https://www.minutemaker.tech/og-image.jpg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://www.minutemaker.tech/" />
                <meta property="twitter:title" content="Minute Maker | Turn Talk Into Contracts" />
                <meta property="twitter:description" content="The only AI meeting assistant that instantly drafts legal contracts from your voice conversations." />
                <meta property="twitter:image" content="https://www.minutemaker.tech/og-image.jpg" />

                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>
            {/* ===== NAVIGATION ===== */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                padding: '14px 24px', background: 'rgba(10,10,12,0.95)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src="/logo.svg" alt="Minute Maker" style={{ width: '40px', height: '40px' }} />
                            <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>{BRAND}</span>
                        </Link>
                        <div className="desktop-nav" style={{ display: 'flex', gap: '28px' }}>
                            <Link to="/features" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>Features</Link>
                            <Link to="/pricing" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>Pricing</Link>
                            <Link to="/docs" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>Docs</Link>
                            <Link to="/about" style={{ fontSize: '14px', color: '#A1A1A6', fontWeight: '500' }}>About</Link>
                        </div>
                    </div>
                    <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link to="/login" style={{ padding: '10px 18px', color: '#A1A1A6', fontWeight: '600', fontSize: '14px' }}>Log in</Link>
                        <Link to="/login" style={{
                            padding: '10px 20px', background: '#FF6B4A', borderRadius: '8px',
                            fontWeight: '600', fontSize: '14px', color: '#030303', boxShadow: '0 0 20px rgba(255, 107, 74, 0.3)'
                        }}>Get Started Free</Link>
                    </div>
                    {/* Mobile menu toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div
                    className="mobile-sidebar active"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className="mobile-sidebar-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setMobileMenuOpen(false)}>
                                <img src="/logo.svg" alt="Minute Maker" style={{ width: '36px', height: '36px' }} />
                                <span style={{ fontSize: '20px', fontWeight: '800' }}>{BRAND}</span>
                            </Link>
                        </div>
                        <nav style={{ padding: '24px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Link to="/features" className="nav-item" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                                <Link to="/pricing" className="nav-item" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                                <Link to="/docs" className="nav-item" onClick={() => setMobileMenuOpen(false)}>Docs</Link>
                                <Link to="/about" className="nav-item" onClick={() => setMobileMenuOpen(false)}>About</Link>
                            </div>
                        </nav>
                        <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
                            <Link
                                to="/login"
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/login"
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Log in
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== HERO ===== */}
            <section style={{ paddingTop: '160px', paddingBottom: '60px', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '6px 14px', background: 'rgba(255, 107, 74, 0.1)',
                        border: '1px solid rgba(255, 107, 74, 0.2)', borderRadius: '100px',
                        fontSize: '13px', fontWeight: '600', color: '#FF6B4A', marginBottom: '28px'
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4AE3B5' }} />
                        Now with live transcription
                    </div>

                    {/* PRIMARY H1 - Keyword Rich for SEO */}
                    <h1 style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        padding: '0',
                        margin: '-1px',
                        overflow: 'hidden',
                        clip: 'rect(0, 0, 0, 0)',
                        whiteSpace: 'nowrap',
                        border: '0'
                    }}>
                        AI Meeting Notes & Contract Generator - Minute Maker
                    </h1>

                    {/* Visual Headline (H2) */}
                    <h2 style={{
                        fontSize: 'clamp(44px, 7vw, 68px)',
                        fontWeight: '800',
                        lineHeight: 1.1,
                        marginBottom: '20px',
                        letterSpacing: '-0.03em'
                    }}>
                        Meeting notes,<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #FF6B4A, #FFB84D, #4AE3B5)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>on autopilot</span>
                    </h2>
                    <p style={{ fontSize: '20px', color: '#A1A1A6', marginBottom: '32px', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 32px' }}>
                        Upload any meeting recording and get transcripts, action items, contracts, and calendar events — automatically.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <Link to="/login" style={{
                            padding: '14px 28px', background: '#FF6B4A', borderRadius: '10px',
                            fontWeight: '700', fontSize: '16px', color: '#030303',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: '0 4px 20px rgba(255, 107, 74, 0.35)'
                        }}>
                            Start Free <ArrowRight size={18} />
                        </Link>
                        <button style={{
                            padding: '14px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
                            fontWeight: '600', fontSize: '16px', color: '#F5F5F7', border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <Play size={16} fill="#F5F5F7" /> Watch Demo
                        </button>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B6B70', marginTop: '16px' }}>
                        Free to try • No credit card required
                    </p>
                </div>
            </section>

            {/* ===== HOW IT WORKS - ANIMATED FLOW CARDS ===== */}
            <section className="landing-section" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#6B6B70', marginBottom: '32px', letterSpacing: '0.15em', fontWeight: '600' }}>
                        HOW IT WORKS
                    </p>

                    <div
                        className="mobile-stack"
                        style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}
                        onMouseEnter={() => setIsAnimating(false)}
                        onMouseLeave={() => setIsAnimating(true)}
                    >
                        {flowSteps.map((step, i) => {
                            const Icon = step.icon;
                            const isActive = i === activeStep;
                            const isPast = i < activeStep;

                            return (
                                <div
                                    key={step.step}
                                    onClick={() => setActiveStep(i)}
                                    style={{
                                        flex: isActive ? '1.4' : '1',
                                        background: isActive ? '#151518' : '#0f0f12',
                                        borderRadius: '16px',
                                        padding: isActive ? '28px' : '20px',
                                        border: isActive ? `2px solid ${step.color}` : '1px solid rgba(255,255,255,0.04)',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: isActive ? `0 0 30px ${step.color}25` : 'none',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Step Badge */}
                                    <div style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: isActive || isPast ? step.color : 'rgba(255,255,255,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '12px', fontWeight: '700',
                                        color: isActive || isPast ? '#030303' : '#6B6B70'
                                    }}>
                                        {isPast ? <Check size={12} /> : step.step}
                                    </div>

                                    <div style={{
                                        width: isActive ? '52px' : '40px',
                                        height: isActive ? '52px' : '40px',
                                        borderRadius: '12px',
                                        background: `${step.color}18`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '16px', transition: 'all 0.3s ease'
                                    }}>
                                        <Icon size={isActive ? 26 : 20} style={{ color: step.color }} />
                                    </div>

                                    <h3 style={{ fontSize: isActive ? '20px' : '16px', fontWeight: '700', marginBottom: '6px', color: isActive ? '#F5F5F7' : '#A1A1A6' }}>
                                        {step.title}
                                    </h3>
                                    <p style={{ fontSize: isActive ? '14px' : '12px', color: isActive ? '#A1A1A6' : '#6B6B70', lineHeight: 1.5 }}>
                                        {step.desc}
                                    </p>

                                    {/* Progress bar */}
                                    {isActive && isAnimating && (
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.08)' }}>
                                            <div style={{ height: '100%', background: step.color, animation: 'progressBar 2.5s linear' }} />
                                        </div>
                                    )}

                                    {/* Arrow */}
                                    {i < flowSteps.length - 1 && (
                                        <div style={{ position: 'absolute', right: '-14px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: isActive ? step.color : 'rgba(255,255,255,0.15)' }}>
                                            <ChevronRight size={20} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ===== SOCIAL PROOF BAR ===== */}
            <section style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#6B6B70', marginBottom: '20px', letterSpacing: '0.1em' }}>TRUSTED BY TEAMS AT</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', opacity: 0.4 }}>
                        {companyLogos.map((logo) => (
                            <span key={logo} style={{ fontSize: '16px', fontWeight: '600', letterSpacing: '0.02em' }}>{logo}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DETAILED FEATURE SECTIONS ===== */}
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
                        <div className="mobile-stack" style={{
                            maxWidth: '1100px',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1.2fr',
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

                                <h3 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                                    {section.headline}
                                </h3>
                                <p style={{ fontSize: '16px', color: '#A1A1A6', marginBottom: '32px', lineHeight: 1.7 }}>
                                    {section.description}
                                </p>

                                {/* Feature list */}
                                <div className="grid-2-cols" style={{ marginBottom: '32px' }}>
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
                                            <div className="grid-2-cols" style={{ marginBottom: '20px' }}>
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

            {/* ===== TESTIMONIALS ===== */}
            <section className="landing-section" style={{ background: '#0A0A0C' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h2 className="text-display-md" style={{ fontWeight: '700', textAlign: 'center', marginBottom: '60px' }}>
                        Loved by teams everywhere
                    </h2>
                    <div className="grid-3-cols">
                        {testimonials.map((t, i) => (
                            <div key={i} style={{
                                background: '#111114',
                                borderRadius: '16px',
                                padding: '28px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="#FFB84D" color="#FFB84D" />)}
                                </div>
                                <p style={{ fontSize: '15px', color: '#A1A1A6', lineHeight: 1.7, marginBottom: '24px' }}>
                                    "{t.quote}"
                                </p>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#F5F5F7' }}>{t.author}</p>
                                    <p style={{ fontSize: '13px', color: '#6B6B70' }}>{t.role}, {t.company}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PRICING ===== */}
            <section className="landing-section" style={{ background: '#0f0f12' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 className="text-display-md" style={{ fontWeight: '700', textAlign: 'center', marginBottom: '12px' }}>
                        Simple, transparent pricing
                    </h2>
                    <p className="text-body-lg" style={{ textAlign: 'center', marginBottom: '60px' }}>
                        Start free. Upgrade when you need more.
                    </p>
                    <div className="grid-3-cols">
                        {pricingTiers.map(tier => (
                            <div key={tier.name} style={{
                                background: tier.popular ? '#18181C' : '#111114',
                                borderRadius: '20px', padding: '32px',
                                border: tier.popular ? '2px solid #FF6B4A' : '1px solid rgba(255,255,255,0.05)',
                                position: 'relative'
                            }}>
                                {tier.popular && (
                                    <span style={{
                                        position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                        background: '#FF6B4A', padding: '4px 14px', borderRadius: '100px',
                                        fontSize: '11px', fontWeight: '700', color: '#030303', letterSpacing: '0.03em'
                                    }}>POPULAR</span>
                                )}
                                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{tier.name}</h3>
                                <p style={{ fontSize: '13px', color: '#6B6B70', marginBottom: '20px' }}>{tier.desc}</p>
                                <div style={{ marginBottom: '24px' }}>
                                    <span style={{ fontSize: '44px', fontWeight: '800' }}>${tier.price}</span>
                                    <span style={{ color: '#6B6B70', fontSize: '14px' }}>/mo</span>
                                </div>
                                <ul style={{ listStyle: 'none', marginBottom: '28px' }}>
                                    {tier.features.map(f => (
                                        <li key={f} style={{ padding: '7px 0', fontSize: '14px', color: '#A1A1A6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Check size={16} color="#4AE3B5" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/login" style={{
                                    display: 'block', textAlign: 'center', padding: '14px',
                                    background: tier.popular ? '#FF6B4A' : 'rgba(255,255,255,0.05)',
                                    borderRadius: '10px', fontWeight: '600', fontSize: '14px',
                                    color: tier.popular ? '#030303' : '#F5F5F7'
                                }}>{tier.cta}</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section style={{ padding: '120px 24px', textAlign: 'center', background: '#0A0A0C' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                        Ready to try {BRAND}?
                    </h2>
                    <p style={{ fontSize: '18px', color: '#A1A1A6', marginBottom: '36px', lineHeight: 1.6 }}>
                        Join thousands of teams shipping faster with automated meeting workflows.
                    </p>
                    <Link to="/login" style={{
                        padding: '16px 36px', background: '#FF6B4A', borderRadius: '12px',
                        fontWeight: '700', fontSize: '17px', color: '#030303', display: 'inline-flex', gap: '10px',
                        boxShadow: '0 4px 30px rgba(255, 107, 74, 0.35)'
                    }}>
                        Get Started Free <ArrowRight size={20} />
                    </Link>
                    <p style={{ fontSize: '13px', color: '#6B6B70', marginTop: '16px' }}>
                        Free 14-day trial • No credit card required
                    </p>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <Footer />

            {/* CSS */}
            <style>{`
                @keyframes progressBar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
}
