import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    CreditCard,
    Check,
    Zap,
    Crown,
    Loader2,
    ExternalLink,
    AlertCircle,
    Star
} from 'lucide-react';

interface SubscriptionInfo {
    tier: 'FREE' | 'BASIC' | 'ULTRA';
    status: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    usage: {
        meetings: { used: number; limit: number };
        contracts: { used: number; limit: number };
        storage_mb: { used: number; limit: number };
    };
}

const API_URL = 'http://localhost:5000/api';

const plans = [
    {
        id: 'FREE',
        name: 'Free',
        price: 0,
        icon: Zap,
        color: '#60a5fa',
        features: [
            '5 meetings per month',
            '2 contracts per month',
            'Basic AI analysis',
            'Email support',
            '100MB storage'
        ],
        limits: { meetings: 5, contracts: 2, storage: 100 }
    },
    {
        id: 'BASIC',
        name: 'Basic',
        price: 10,
        icon: Star,
        color: '#fbbf24',
        features: [
            '20 meetings per month',
            '10 contracts per month',
            'Standard AI analysis',
            'Priority support',
            '2GB storage'
        ],
        limits: { meetings: 20, contracts: 10, storage: 2048 }
    },
    {
        id: 'PREMIUM',
        name: 'Premium',
        price: 15,
        icon: Crown,
        color: '#f472b6',
        popular: true,
        features: [
            '50 meetings per month',
            'Unlimited contracts',
            'Advanced AI analysis',
            'Priority support',
            '10GB storage'
        ],
        limits: { meetings: 50, contracts: -1, storage: 10240 }
    },
    {
        id: 'ULTRA',
        name: 'Ultra',
        price: 25,
        icon: Crown,
        color: '#a78bfa',
        features: [
            'Unlimited meetings',
            'Unlimited contracts',
            'Custom AI training',
            '24/7 dedicated support',
            'Unlimited storage'
        ],
        limits: { meetings: -1, contracts: -1, storage: -1 }
    }
];

export default function SubscriptionPage() {
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [user, setUser] = useState<any>(null); // Added user state
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [subRes, userRes] = await Promise.all([
                fetch(`${API_URL}/subscriptions/info`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (subRes.ok) {
                const data = await subRes.json();
                setSubscription(data);
            }
            if (userRes.ok) {
                const data = await userRes.json();
                setUser(data.user);
                // Also update localStorage to keep sidebar in sync
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const sessionId = query.get('session_id');
        const success = query.get('success');

        if (success && sessionId) {
            verifyPayment(sessionId);
        } else {
            fetchData();
        }
    }, []);

    const verifyPayment = async (sessionId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/subscriptions/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session_id: sessionId })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    // Success! 
                    // 1. Update User Profile in LocalStorage to reflect new Tier in Sidebar
                    const userRes = await fetch(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        if (userData.user) {
                            localStorage.setItem('user', JSON.stringify(userData.user));
                        }
                    }

                    // 2. Remove query params and reload to update Sidebar
                    window.history.replaceState({}, '', window.location.pathname);
                    window.location.reload();
                } else {
                    setError('Payment verification failed');
                    fetchData();
                }
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('Payment verification failed');
            fetchData();
        }
    };

    const handleChangePlan = async (tier: string) => {
        if (tier === subscription?.tier) return;

        setActionLoading(tier);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/subscriptions/change`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tier })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.message && !data.checkout_url) {
                    toast(data.message);
                }
                
                if (data.checkout_url) {
                    window.location.href = data.checkout_url;
                } else {
                    fetchData();
                }
            } else {
                setError(data.error || 'Failed to change plan');
            }
        } catch (err) {
            setError('Failed to change plan');
        } finally {
            setActionLoading(null);
        }
    };

    const handleManageBilling = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/subscriptions/portal`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    window.open(data.url, '_blank');
                }
            }
        } catch (err) {
            console.error('Failed to open billing portal:', err);
        }
    };

    const getUsagePercent = (used: number, limit: number) => {
        if (limit === -1) return 0; // Unlimited
        return Math.min((used / limit) * 100, 100);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#d97706' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 40px' }} className="animate-fadeIn">
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>Subscription</h1>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: '4px' }}>
                    Manage your plan and billing
                </p>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ color: '#f87171', marginRight: '8px' }} />
                    <span style={{ fontSize: '14px', color: '#f87171' }}>{error}</span>
                </div>
            )}

            {/* Current Usage */}
            {subscription && (
                <div className="dashboard-card" style={{ padding: '24px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>Current Usage</h3>
                            {subscription.cancel_at_period_end && (
                                <p style={{ fontSize: '13px', color: '#f87171', margin: '4px 0 0' }}>
                                    Your plan will be canceled on {new Date(subscription.current_period_end || '').toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <span style={{
                            fontSize: '12px',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            background: (user?.subscription_tier || subscription.tier) === 'BASIC' ? 'rgba(251,191,36,0.2)' : (user?.subscription_tier || subscription.tier) === 'ULTRA' ? 'rgba(167,139,250,0.2)' : (user?.subscription_tier || subscription.tier) === 'PREMIUM' ? 'rgba(244,114,182,0.2)' : 'rgba(96,165,250,0.2)',
                            color: (user?.subscription_tier || subscription.tier) === 'BASIC' ? '#fbbf24' : (user?.subscription_tier || subscription.tier) === 'ULTRA' ? '#a78bfa' : (user?.subscription_tier || subscription.tier) === 'PREMIUM' ? '#f472b6' : '#60a5fa'
                        }}>
                            {user?.subscription_tier || subscription.tier} Plan
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {/* Meetings */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Meetings</span>
                                <span style={{ fontSize: '13px', color: 'white' }}>
                                    {subscription.usage?.meetings?.used || 0} / {subscription.usage?.meetings?.limit === -1 ? '∞' : subscription.usage?.meetings?.limit || 5}
                                </span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    background: '#60a5fa',
                                    borderRadius: '3px',
                                    width: `${getUsagePercent(subscription.usage?.meetings?.used || 0, subscription.usage?.meetings?.limit || 5)}%`
                                }} />
                            </div>
                        </div>

                        {/* Contracts */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Contracts</span>
                                <span style={{ fontSize: '13px', color: 'white' }}>
                                    {subscription.usage?.contracts?.used || 0} / {subscription.usage?.contracts?.limit === -1 ? '∞' : subscription.usage?.contracts?.limit || 2}
                                </span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    background: '#fbbf24',
                                    borderRadius: '3px',
                                    width: `${getUsagePercent(subscription.usage?.contracts?.used || 0, subscription.usage?.contracts?.limit || 2)}%`
                                }} />
                            </div>
                        </div>

                        {/* Storage */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Storage</span>
                                <span style={{ fontSize: '13px', color: 'white' }}>
                                    {Math.round(subscription.usage?.storage_mb?.used || 0)}MB / {subscription.usage?.storage_mb?.limit === -1 ? '∞' : subscription.usage?.storage_mb?.limit || 100}MB
                                </span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    background: '#4ade80',
                                    borderRadius: '3px',
                                    width: `${getUsagePercent(subscription.usage?.storage_mb?.used || 0, subscription.usage?.storage_mb?.limit || 100)}%`
                                }} />
                            </div>
                        </div>
                    </div>

                    {subscription.tier !== 'FREE' && (
                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <button onClick={handleManageBilling} className="btn-secondary" style={{ width: 'auto' }}>
                                <CreditCard size={16} style={{ marginRight: '8px' }} /> Manage Billing
                                <ExternalLink size={14} style={{ marginLeft: '8px', opacity: 0.5 }} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Plans */}
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 20px' }}>Available Plans</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {plans.map(plan => {
                    const Icon = plan.icon;
                    // Use user tier if available, fallback to subscription tier
                    const currentTier = user?.subscription_tier || subscription?.tier;
                    const isCurrent = currentTier === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className="dashboard-card"
                            style={{
                                padding: '24px',
                                border: isCurrent ? `2px solid ${plan.color}` : '2px solid transparent',
                                position: 'relative'
                            }}
                        >
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '20px',
                                    background: plan.color,
                                    color: '#000',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '4px 12px',
                                    borderRadius: '12px'
                                }}>
                                    Popular
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: `${plan.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={20} style={{ color: plan.color }} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>{plan.name}</h4>
                                    <p style={{ fontSize: '24px', fontWeight: '700', color: plan.color, margin: 0 }}>
                                        ${plan.price}<span style={{ fontSize: '14px', fontWeight: '400', color: 'rgba(255,255,255,0.4)' }}>/mo</span>
                                    </p>
                                </div>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                                {plan.features.map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                                        <Check size={16} style={{ color: plan.color, marginRight: '10px', flexShrink: 0 }} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleChangePlan(plan.id)}
                                disabled={isCurrent || actionLoading === plan.id}
                                className={isCurrent ? 'btn-secondary' : 'btn-primary'}
                                style={{
                                    opacity: isCurrent ? 0.5 : 1,
                                    cursor: isCurrent ? 'default' : 'pointer',
                                    background: isCurrent ? 'rgba(255,255,255,0.1)' : undefined,
                                    border: isCurrent ? '1px solid rgba(255,255,255,0.2)' : undefined,
                                    color: isCurrent ? 'rgba(255,255,255,0.5)' : undefined
                                }}
                            >
                                {actionLoading === plan.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : isCurrent ? (
                                    'Current Plan'
                                ) : plan.price === 0 ? (
                                    'Downgrade'
                                ) : (
                                    'Upgrade'
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
