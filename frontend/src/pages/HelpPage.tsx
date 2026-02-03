import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, FileQuestion, Mail, ChevronRight, Search } from 'lucide-react';

const BRAND = 'Brevity';

const helpCategories = [
    { title: 'Getting Started', count: 12, icon: '🚀' },
    { title: 'Account & Billing', count: 8, icon: '💳' },
    { title: 'Transcription', count: 15, icon: '🎙️' },
    { title: 'AI Insights', count: 10, icon: '🧠' },
    { title: 'Integrations', count: 6, icon: '🔗' },
    { title: 'Troubleshooting', count: 9, icon: '🔧' }
];

const popularArticles = [
    { title: 'How to upload your first meeting', category: 'Getting Started' },
    { title: 'Understanding your transcription credits', category: 'Account & Billing' },
    { title: 'Connecting Google Calendar', category: 'Integrations' },
    { title: 'Improving transcription accuracy', category: 'Transcription' }
];

export default function HelpPage() {
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

            <section style={{ paddingTop: '160px', paddingBottom: '40px', textAlign: 'center', background: '#0f0f12' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Help Center</h1>
                    <p style={{ fontSize: '20px', color: '#A1A1A6', marginBottom: '32px' }}>Find answers to your questions.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0A0A0C', borderRadius: '12px', padding: '14px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Search size={20} color="#6B6B70" />
                        <input type="text" placeholder="Search for help..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#F5F5F7' }} />
                    </div>
                </div>
            </section>

            <section style={{ padding: '60px 24px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Browse by Category</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {helpCategories.map((cat) => (
                            <Link key={cat.title} to={`/help/${cat.title.toLowerCase().replace(/ /g, '-')}`} style={{ padding: '24px', background: '#111114', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}>{cat.icon}</span>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{cat.title}</h3>
                                <p style={{ fontSize: '13px', color: '#6B6B70' }}>{cat.count} articles</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '60px 24px', background: '#0f0f12' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Popular Articles</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {popularArticles.map((article) => (
                            <Link key={article.title} to="/help" style={{ padding: '16px 20px', background: '#111114', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FileQuestion size={18} color="#FF6B4A" />
                                    <div>
                                        <p style={{ fontSize: '15px', fontWeight: '500' }}>{article.title}</p>
                                        <p style={{ fontSize: '12px', color: '#6B6B70' }}>{article.category}</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="#6B6B70" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '80px 24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Still need help?</h2>
                <p style={{ fontSize: '16px', color: '#A1A1A6', marginBottom: '32px' }}>Our support team is available 24/7.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <a href="mailto:support@getbrevity.com" style={{ padding: '14px 24px', background: '#FF6B4A', borderRadius: '10px', fontWeight: '600', fontSize: '15px', color: '#030303', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={18} /> Email Support
                    </a>
                    <button style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontWeight: '600', fontSize: '15px', color: '#F5F5F7', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={18} /> Live Chat
                    </button>
                </div>
            </section>

            <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2025 {BRAND}. All rights reserved.</p>
            </footer>
        </div>
    );
}
