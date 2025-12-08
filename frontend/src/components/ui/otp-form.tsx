import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface OTPFormProps {
    email: string;
    description?: string;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    loading?: boolean;
    error?: string;
}

export function OTPForm({ email, description, onVerify, onResend, loading, error }: OTPFormProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move to next input
        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto submit if complete
        if (index === 5 && value !== "" && newOtp.every(d => d !== "")) {
            onVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && index > 0 && otp[index] === "") {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const digits = pastedData.split("");
        const newOtp = [...otp];
        digits.forEach((digit, index) => {
            if (index < 6) newOtp[index] = digit;
        });
        setOtp(newOtp);

        if (digits.length === 6) {
            onVerify(digits.join(""));
        } else {
            const nextIndex = Math.min(digits.length, 5);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '400px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    Verify Your Email
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.5' }}>
                    {description || `We sent a code to ${email}`}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        style={{
                            width: '45px',
                            height: '55px',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            outline: 'none'
                        }}
                        className="otp-input"
                    />
                ))}
            </div>

            {error && (
                <div style={{
                    marginBottom: '16px',
                    padding: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    color: '#f87171',
                    fontSize: '13px',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            <button
                onClick={() => onVerify(otp.join(""))}
                disabled={loading || otp.some(d => d === "")}
                className="btn-primary"
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '8px'
                }}
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Code"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                    Didn't receive the code?{' '}
                    <button
                        onClick={async () => {
                            setResendLoading(true);
                            await onResend();
                            setResendLoading(false);
                            setResendTimer(30);
                        }}
                        disabled={resendTimer > 0 || resendLoading}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: resendTimer > 0 ? 'rgba(255,255,255,0.3)' : '#fbbf24',
                            cursor: resendTimer > 0 ? 'default' : 'pointer',
                            fontWeight: '500',
                            padding: 0
                        }}
                    >
                        {resendLoading ? 'Sending...' : resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend Code'}
                    </button>
                </p>
            </div>
        </div>
    );
}
