import { Link } from 'react-router-dom';
import { Sparkles, Mail, MapPin, Phone, Send, MessageSquare, Clock } from 'lucide-react';
import { useState } from 'react';

const BRAND = 'Brevity';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '', type: 'sales' });

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
                <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Get in touch</h1>
                <p style={{ fontSize: '20px', color: '#A1A1A6', maxWidth: '500px', margin: '0 auto' }}>Have a question or want to learn more? We'd love to hear from you.</p>
            </section>

            <section style={{ padding: '40px 24px 100px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px' }}>
                    {/* Contact Info */}
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>Contact Information</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,107,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Mail size={20} color="#FF6B4A" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', color: '#6B6B70', marginBottom: '4px' }}>Email us</p>
                                    <a href="mailto:hello@getbrevity.com" style={{ fontSize: '16px', fontWeight: '500', color: '#F5F5F7' }}>hello@getbrevity.com</a>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,107,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Phone size={20} color="#FF6B4A" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', color: '#6B6B70', marginBottom: '4px' }}>Call us</p>
                                    <p style={{ fontSize: '16px', fontWeight: '500' }}>+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,107,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MapPin size={20} color="#FF6B4A" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', color: '#6B6B70', marginBottom: '4px' }}>Visit us</p>
                                    <p style={{ fontSize: '16px', fontWeight: '500' }}>123 Innovation Drive<br />San Francisco, CA 94105</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,107,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={20} color="#FF6B4A" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', color: '#6B6B70', marginBottom: '4px' }}>Business hours</p>
                                    <p style={{ fontSize: '16px', fontWeight: '500' }}>Mon - Fri, 9am - 6pm PST</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '24px', background: '#111114', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <MessageSquare size={20} color="#4AE3B5" />
                                <span style={{ fontSize: '16px', fontWeight: '600' }}>Live Chat Available</span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#A1A1A6', lineHeight: 1.6 }}>Our support team typically responds within 5 minutes during business hours.</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div style={{ background: '#111114', borderRadius: '20px', padding: '36px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Send us a message</h2>
                        <p style={{ fontSize: '14px', color: '#6B6B70', marginBottom: '28px' }}>Fill out the form below and we'll get back to you shortly.</p>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                            {['sales', 'support', 'partnership'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFormData({ ...formData, type })}
                                    style={{
                                        padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        background: formData.type === type ? '#FF6B4A' : 'rgba(255,255,255,0.05)',
                                        color: formData.type === type ? '#030303' : '#A1A1A6',
                                        fontWeight: '600', fontSize: '13px', textTransform: 'capitalize'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', color: '#6B6B70', marginBottom: '6px', display: 'block' }}>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        style={{
                                            width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                                            fontSize: '15px', color: '#F5F5F7', outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', color: '#6B6B70', marginBottom: '6px', display: 'block' }}>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@company.com"
                                        style={{
                                            width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                                            fontSize: '15px', color: '#F5F5F7', outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: '#6B6B70', marginBottom: '6px', display: 'block' }}>Company</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="Acme Inc."
                                    style={{
                                        width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                                        fontSize: '15px', color: '#F5F5F7', outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', color: '#6B6B70', marginBottom: '6px', display: 'block' }}>Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Tell us how we can help..."
                                    rows={5}
                                    style={{
                                        width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                                        fontSize: '15px', color: '#F5F5F7', outline: 'none', resize: 'none'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    padding: '14px 24px', background: '#FF6B4A', borderRadius: '10px',
                                    fontWeight: '600', fontSize: '15px', color: '#030303', border: 'none',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <Send size={16} /> Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <footer style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6B6B70' }}>© 2025 {BRAND}. All rights reserved.</p>
            </footer>
        </div>
    );
}
