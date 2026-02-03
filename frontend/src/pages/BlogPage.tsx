import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

const BRAND = 'Minute Maker';

const posts = [
    { title: 'Introducing AI-Powered Contract Generation', date: 'Jan 28, 2025', category: 'Product', excerpt: 'Transform meeting agreements into contracts instantly with our new AI-powered feature.' },
    { title: 'How We Achieved 95% Transcription Accuracy', date: 'Jan 20, 2025', category: 'Engineering', excerpt: 'A deep dive into our transcription pipeline and the ML techniques behind it.' },
    { title: 'The Future of Meeting Productivity', date: 'Jan 15, 2025', category: 'Insights', excerpt: 'How AI is transforming the way teams collaborate and communicate.' },
    { title: 'SOC 2 Type II Certification Achieved', date: 'Jan 8, 2025', category: 'Company', excerpt: 'We\'re excited to announce our SOC 2 Type II certification.' },
    { title: 'New Calendar Integration Features', date: 'Jan 3, 2025', category: 'Product', excerpt: 'Sync your action items to Google Calendar with smart reminders.' }
];

export default function BlogPage() {
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
                <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Blog</h1>
                <p style={{ fontSize: '20px', color: '#A1A1A6' }}>Updates, insights, and stories from the {BRAND} team.</p>
            </section>

            <section style={{ padding: '40px 24px 100px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {posts.map((post, i) => (
                        <Link key={i} to="#" style={{ display: 'block', padding: '32px', marginBottom: '20px', background: '#111114', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <span style={{ padding: '4px 12px', background: 'rgba(255,107,74,0.15)', borderRadius: '100px', fontSize: '12px', color: '#FF6B4A', fontWeight: '600' }}>{post.category}</span>
                                <span style={{ fontSize: '13px', color: '#6B6B70', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {post.date}</span>
                            </div>
                            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>{post.title}</h2>
                            <p style={{ fontSize: '15px', color: '#A1A1A6', lineHeight: 1.6 }}>{post.excerpt}</p>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '14px', color: '#FF6B4A', fontWeight: '600' }}>Read more <ArrowRight size={14} /></span>
                        </Link>
                    ))}
                </div>
            </section>

            <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2025 {BRAND}. All rights reserved.</p>
            </footer>
        </div>
    );
}
