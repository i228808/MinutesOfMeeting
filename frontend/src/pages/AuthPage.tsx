import { useState } from "react";
import { Link } from "react-router-dom";
import { LoginForm } from "@/components/ui/login-form";
import { RegisterForm } from "@/components/ui/register-form";
import { OTPForm } from "@/components/ui/otp-form";
import { ArrowLeft, Sparkles } from "lucide-react";

import { API_URL } from '../config';
const BRAND = 'Minute Maker';

export default function AuthPage() {
    const [view, setView] = useState<'login' | 'register' | 'otp'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [otpEmail, setOtpEmail] = useState("");

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (name: string, email: string, password: string) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Registration failed');

            if (data.need_verification) {
                setOtpEmail(data.email);
                setView('otp');
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otp: string) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail, otp }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Verification failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to resend code');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resend code');
        }
    };

    return (
        <main style={{
            position: 'relative',
            width: '100vw',
            minHeight: '100vh',
            background: '#0A0A0C',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Glow */}
            <div style={{
                position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                width: '1000px', height: '1000px',
                background: 'radial-gradient(circle, rgba(255,107,74,0.08) 0%, rgba(10,10,12,0) 70%)',
                pointerEvents: 'none', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', left: '20%',
                width: '800px', height: '800px',
                background: 'radial-gradient(circle, rgba(74,227,181,0.05) 0%, rgba(10,10,12,0) 70%)',
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* Back to Home */}
            <Link
                to="/"
                style={{
                    position: 'absolute',
                    top: '24px',
                    left: '24px',
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    color: '#6B6B70',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                }}
            >
                <ArrowLeft size={16} />
                Back to home
            </Link>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>
                {/* Brand Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '24px', textDecoration: 'none' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #FF6B4A, #FF9A7A)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(255, 107, 74, 0.2)'
                        }}>
                            <Sparkles size={20} color="#030303" strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#F5F5F7', letterSpacing: '-0.02em' }}>{BRAND}</span>
                    </Link>
                    <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#F5F5F7', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                        {view === 'login' ? 'Welcome back' : view === 'register' ? 'Start your free trial' : 'Check your email'}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#A1A1A6' }}>
                        {view === 'login' ? 'Enter your details to sign in.' : view === 'register' ? 'Join thousands of teams automating meetings.' : `We sent a code to ${otpEmail}`}
                    </p>
                </div>

                {/* Forms */}
                <div style={{
                    background: '#111114',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: '0 4px 40px rgba(0,0,0,0.2)'
                }}>
                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px 16px', marginBottom: '24px',
                            background: 'rgba(255, 92, 92, 0.1)',
                            border: '1px solid rgba(255, 92, 92, 0.2)',
                            borderRadius: '12px',
                            color: '#FF5C5C', fontSize: '14px', textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {view === 'login' && (
                        <LoginForm
                            onSubmit={handleLogin}
                            onSwitchToRegister={() => { setView('register'); setError(""); }}
                            loading={loading}
                        />
                    )}

                    {view === 'register' && (
                        <RegisterForm
                            onSubmit={handleRegister}
                            onSwitchToLogin={() => { setView('login'); setError(""); }}
                            loading={loading}
                        />
                    )}

                    {view === 'otp' && (
                        <OTPForm
                            email={otpEmail}
                            onVerify={handleVerifyOTP}
                            onResend={handleResendOTP}
                            loading={loading}
                            error={error}
                        />
                    )}
                </div>

                <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#6B6B70' }}>
                    © 2025 {BRAND}. All rights reserved.
                </p>
            </div>
        </main>
    );
}
