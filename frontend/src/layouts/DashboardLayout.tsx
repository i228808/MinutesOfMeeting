import { type ReactNode, useState } from 'react';
import BrowserSelectModal from '../components/BrowserSelectModal';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    FileSignature,
    Calendar,
    Bell,
    LogOut,
    Upload,
    Mic,
    CreditCard,
    Sparkles,
    Users
} from 'lucide-react';

interface DashboardLayoutProps {
    children: ReactNode;
}

const BRAND = 'Minute Maker';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/meetings', label: 'Meetings', icon: FileText },
    { path: '/dashboard/contracts', label: 'Contracts', icon: FileSignature },
    { path: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
    { path: '/dashboard/teams', label: 'Teams', icon: Users },
    { path: '/dashboard/reminders', label: 'Reminders', icon: Bell },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'User', email: 'user@example.com' };
    const [showBrowserModal, setShowBrowserModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    // Get tier color
    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'STARTER': return 'var(--color-primary)';
            case 'PRO': return '#FFAA5C';
            case 'UNLIMITED': return '#6BE3D0';
            default: return 'var(--color-text-muted)';
        }
    };

    return (
        <div className="bg-noise" style={{ display: 'flex', width: '100vw', height: '100vh', background: 'var(--color-bg-base)' }}>
            {/* Sidebar */}
            <aside className="sidebar" style={{ width: '280px', display: 'flex', flexDirection: 'column', flexShrink: 0, padding: '24px 0' }}>
                {/* Logo */}
                <div style={{ padding: '0 24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, #FF9A7A 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(255, 107, 74, 0.25)'
                        }}>
                            <Sparkles size={22} color="#030303" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
                                {BRAND}
                            </h1>
                            <p className="text-label" style={{ fontSize: '10px', marginTop: '4px' }}>
                                Meeting Intelligence
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ padding: '0 24px 24px', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '24px' }}>
                    <Link
                        to="/dashboard/upload"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 107, 74, 0.2)' }}
                    >
                        <Upload size={18} />
                        Upload Meeting
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
                    <p className="text-label" style={{ padding: '0 12px 12px', opacity: 0.6 }}>Main Menu</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path ||
                                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: isActive ? 600 : 500
                                    }}
                                >
                                    <Icon size={20} style={{ opacity: isActive ? 1 : 0.7 }} />
                                    {item.label}
                                    {isActive && (
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', marginLeft: 'auto' }} />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Section */}
                <div style={{ padding: '24px', borderTop: '1px solid var(--color-border-subtle)' }}>
                    {['STARTER', 'PRO', 'UNLIMITED'].includes(user.subscription_tier || 'FREE') && (
                        <button
                            onClick={() => setShowBrowserModal(true)}
                            className="btn btn-secondary"
                            style={{
                                width: '100%',
                                marginBottom: '16px',
                                justifyContent: 'center',
                                fontSize: '13px',
                                borderColor: 'var(--color-secondary-muted)',
                                color: 'var(--color-secondary)'
                            }}
                        >
                            <Mic size={16} />
                            Get Live Recorder
                        </button>
                    )}

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        border: '1px solid var(--color-border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                        onClick={() => window.location.href = '/dashboard/settings'}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-default)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-bg-elevated) 100%)',
                            border: '1px solid var(--color-border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: '700',
                            color: 'var(--color-text-secondary)',
                            marginRight: '12px'
                        }}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                            </p>
                            <div style={{
                                fontSize: '11px',
                                color: getTierColor(user.subscription_tier || 'FREE'),
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '2px'
                            }}>
                                <CreditCard size={10} /> {user.subscription_tier || 'FREE'} Plan
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLogout();
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                padding: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'color 0.2s'
                            }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                overflow: 'hidden',
                position: 'relative',
                background: 'var(--color-bg-base)'
            }}>
                <div style={{
                    height: '100%',
                    overflowY: 'auto',
                    background: 'radial-gradient(circle at 50% 0%, rgba(255, 107, 74, 0.03) 0%, transparent 50%)'
                }}>
                    {children}
                </div>
            </main>

            {/* Browser Selection Modal */}
            <BrowserSelectModal isOpen={showBrowserModal} onClose={() => setShowBrowserModal(false)} />
        </div>
    );
}
