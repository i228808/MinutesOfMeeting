import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    FileSignature,
    Calendar,
    Bell,
    Settings,
    LogOut,
    Upload,
    Mic,
    ChevronRight,
    CreditCard
} from 'lucide-react';

interface DashboardLayoutProps {
    children: ReactNode;
}

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/meetings', label: 'Meetings', icon: FileText },
    { path: '/dashboard/contracts', label: 'Contracts', icon: FileSignature },
    { path: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
    { path: '/dashboard/reminders', label: 'Reminders', icon: Bell },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();

    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'User', email: 'user@example.com' };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <div className="grain-overlay" style={{ display: 'flex', width: '100vw', height: '100vh', background: '#0c0c0f' }}>
            {/* Sidebar */}
            <aside className="sidebar" style={{ width: '260px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                {/* Logo */}
                <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.svg" alt="Logo" style={{ width: '32px', height: '32px' }} />
                    <div style={{ lineHeight: 1 }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                            <span style={{ color: '#fbbf24' }}>Meeting</span>Minutes
                        </h1>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', letterSpacing: '0.5px' }}>
                            AI-POWERED AUTOMATION
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Link
                        to="/dashboard/upload"
                        className="btn-primary"
                        style={{ marginBottom: '8px', textDecoration: 'none', fontSize: '13px', padding: '10px 16px' }}
                    >
                        <Upload size={16} style={{ marginRight: '8px' }} />
                        Upload Meeting
                    </Link>

                    {/* Live Recorder Button - Only for paid tiers */}
                    {['BASIC', 'PREMIUM', 'ULTRA'].includes(user.subscription_tier || 'FREE') && (
                        <button
                            onClick={() => alert("To use Live Recording:\n1. Open Chrome Extensions\n2. Load Unpacked -> select 'extension' folder\n3. Click 'Start Recording' in the popup!")}
                            style={{
                                width: '100%',
                                fontSize: '13px',
                                padding: '10px 16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald/Green for Action
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Mic size={16} style={{ marginRight: '8px' }} />
                            Install Live Recorder
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                style={{ position: 'relative', textDecoration: 'none' }}
                            >
                                <Icon size={18} style={{ marginRight: '12px' }} />
                                {item.label}
                                {isActive && (
                                    <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Link
                        to="/dashboard/settings"
                        className="nav-item"
                        style={{ marginBottom: '8px', textDecoration: 'none' }}
                    >
                        <Settings size={18} style={{ marginRight: '12px' }} />
                        Settings
                    </Link>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        marginTop: '8px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'white',
                            marginRight: '12px'
                        }}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: '500', color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                            </p>
                            <Link to="/dashboard/subscription" style={{ fontSize: '11px', color: '#fbbf24', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CreditCard size={10} /> {user.subscription_tier || 'FREE'} Plan
                            </Link>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex'
                            }}
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                overflow: 'auto',
                background: 'linear-gradient(135deg, #0c0c0f 0%, #0f0f14 100%)'
            }}>
                {children}
            </main>
        </div>
    );
}
