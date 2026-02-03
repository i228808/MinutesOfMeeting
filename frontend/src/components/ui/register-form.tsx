"use client";
import { useState } from "react";
import { Lock, Mail, ArrowRight, UserPlus, Loader2 } from 'lucide-react';
import { API_URL } from '../../config';

interface RegisterFormProps {
    onSubmit?: (name: string, email: string, password: string) => void;
    onSwitchToLogin?: () => void;
    loading?: boolean;
}

export function RegisterForm({ onSubmit, onSwitchToLogin, loading = false }: RegisterFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (!loading) {
            onSubmit?.(name, email, password);
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <div style={{ width: '100%' }}>
            <form onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                    <div style={{ padding: '12px', marginBottom: '16px', fontSize: '14px', color: '#FF5C5C', background: 'rgba(255, 92, 92, 0.1)', border: '1px solid rgba(255, 92, 92, 0.2)', borderRadius: '12px' }}>
                        {error}
                    </div>
                )}

                {/* Name Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: '#A1A1A6', marginBottom: '8px', letterSpacing: '0.02em' }}>
                        FULL NAME
                    </label>
                    <div style={{ position: 'relative' }}>
                        <UserPlus size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B6B70' }} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                background: '#0A0A0C',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#F5F5F7',
                                fontSize: '15px',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#4AE3B5';
                                e.currentTarget.style.boxShadow = '0 0 0 1px #4AE3B5';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            placeholder="John Doe"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Email Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: '#A1A1A6', marginBottom: '8px', letterSpacing: '0.02em' }}>
                        EMAIL ADDRESS
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B6B70' }} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                background: '#0A0A0C',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#F5F5F7',
                                fontSize: '15px',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#4AE3B5';
                                e.currentTarget.style.boxShadow = '0 0 0 1px #4AE3B5';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: '#A1A1A6', marginBottom: '8px', letterSpacing: '0.02em' }}>
                        PASSWORD
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B6B70' }} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                background: '#0A0A0C',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#F5F5F7',
                                fontSize: '15px',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#4AE3B5';
                                e.currentTarget.style.boxShadow = '0 0 0 1px #4AE3B5';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Confirm Password Input */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: '#A1A1A6', marginBottom: '8px', letterSpacing: '0.02em' }}>
                        CONFIRM PASSWORD
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B6B70' }} />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                background: '#0A0A0C',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#F5F5F7',
                                fontSize: '15px',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#4AE3B5';
                                e.currentTarget.style.boxShadow = '0 0 0 1px #4AE3B5';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: '#4AE3B5',
                        borderRadius: '12px',
                        color: '#030303',
                        fontSize: '15px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '24px',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(74, 227, 181, 0.25)'
                    }}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            Creating account...
                        </>
                    ) : (
                        <>
                            Create Account
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ margin: '0 16px', fontSize: '12px', color: '#6B6B70', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                {/* Google Signup Button */}
                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#18181C',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#F5F5F7',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1F1F24';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#18181C';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                >
                    <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z"></path>
                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z"></path>
                        <path fill="#4CAF50" d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z"></path>
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z"></path>
                    </svg>
                    Sign up with Google
                </button>
            </form>

            {/* Switch to Login */}
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B6B70', marginTop: '32px' }}>
                Already have an account?{" "}
                <button
                    onClick={onSwitchToLogin}
                    style={{ background: 'none', border: 'none', color: '#4AE3B5', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    disabled={loading}
                >
                    Sign In
                </button>
            </p>
        </div>
    );
}
