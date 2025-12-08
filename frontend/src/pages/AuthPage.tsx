import { useState } from "react";
import { SmokeyBackground, LoginForm } from "@/components/ui/login-form";
import { RegisterForm } from "@/components/ui/register-form";
import { OTPForm } from "@/components/ui/otp-form";

const API_URL = 'http://localhost:5000/api';

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
        <main style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0a0a0f', overflow: 'hidden' }}>
            {/* Animated WebGL Background */}
            <SmokeyBackground color="#B45309" />

            {/* Content Container */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '16px'
            }}>
                {/* Logo/Brand */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                        <span style={{ color: '#fbbf24' }}>Meeting</span>Minutes
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                        AI-Powered Meeting Automation
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        maxWidth: '400px',
                        width: '100%',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#f87171',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form Container */}
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

            {/* Footer */}
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                © 2024 MeetingMinutes AI
            </div>
        </main>
    );
}
