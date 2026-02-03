import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { User, Bell, Shield, Moon, Sun, Monitor, LogOut, Check } from 'lucide-react';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>({});
    const [activeTab, setActiveTab] = useState('appearance');

    // Web mocked state for settings
    const [notifications, setNotifications] = useState({
        email_digest: true,
        meeting_alerts: true,
        push_enabled: false
    });

    const [privacy, setPrivacy] = useState({
        data_usage_consent: false
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
    }, []);

    const sidebarItems = [
        { id: 'account', label: 'My Account', icon: User },
        { id: 'appearance', label: 'Appearance', icon: Monitor },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    ];

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }} className="animate-fadeIn">
            <h1 className="text-display-md" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Settings
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '40px' }}>
                Manage your account preferences and application settings
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '40px', alignItems: 'start' }}>
                {/* Settings Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={activeTab === item.id ? 'btn btn-secondary' : 'btn btn-ghost'}
                            style={{
                                justifyContent: 'flex-start',
                                background: activeTab === item.id ? 'var(--color-bg-elevated)' : 'transparent',
                                color: activeTab === item.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                            }}
                        >
                            <item.icon size={18} style={{ marginRight: '12px' }} />
                            {item.label}
                        </button>
                    ))}

                    <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '8px 0' }}></div>

                    <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--color-error)' }} onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }}>
                        <LogOut size={18} style={{ marginRight: '12px' }} />
                        Sign Out
                    </button>
                </div>

                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {activeTab === 'appearance' && (
                        <section className="dashboard-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <Sun size={20} style={{ color: '#3b82f6' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>Appearance</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                                        Customize your workspace theme
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-base)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                    <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                    </span>
                                </div>

                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                                    <input
                                        type="checkbox"
                                        checked={theme === 'light'}
                                        onChange={toggleTheme}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                        backgroundColor: theme === 'light' ? 'var(--color-primary)' : 'var(--color-bg-surface)',
                                        transition: '.4s', borderRadius: '34px',
                                        border: '1px solid var(--color-border-default)'
                                    }}>
                                        <span style={{
                                            position: 'absolute', content: '""', height: '18px', width: '18px',
                                            left: theme === 'light' ? '24px' : '4px', bottom: '3px',
                                            backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                        }} />
                                    </span>
                                </label>
                            </div>
                        </section>
                    )}

                    {activeTab === 'account' && (
                        <section className="dashboard-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'rgba(255, 107, 74, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <User size={20} style={{ color: 'var(--color-primary)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>My Account</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                                        Update your personal information
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Full Name</label>
                                    <input type="text" defaultValue={user.name || 'User'} className="glass-input" disabled />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Email Address</label>
                                    <input type="email" defaultValue={user.email || 'user@example.com'} className="glass-input" disabled />
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'notifications' && (
                        <section className="dashboard-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <Bell size={20} style={{ color: '#fbbf24' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>Notification Preferences</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                                        Choose how you want to be notified
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-base)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: 0 }}>Email Digest</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>Daily summary of your meetings</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.email_digest}
                                        onChange={(e) => setNotifications({ ...notifications, email_digest: e.target.checked })}
                                        style={{ width: '20px', height: '20px', accentColor: '#d97706' }}
                                    />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-base)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: 0 }}>Meeting Alerts</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>Get notified when meetings are processed</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.meeting_alerts}
                                        onChange={(e) => setNotifications({ ...notifications, meeting_alerts: e.target.checked })}
                                        style={{ width: '20px', height: '20px', accentColor: '#d97706' }}
                                    />
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-base)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: 0 }}>Push Notifications</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>Browser push notifications</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.push_enabled}
                                        onChange={(e) => setNotifications({ ...notifications, push_enabled: e.target.checked })}
                                        style={{ width: '20px', height: '20px', accentColor: '#d97706' }}
                                    />
                                </label>
                            </div>
                        </section>
                    )}

                    {activeTab === 'privacy' && (
                        <section className="dashboard-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginRight: '16px'
                                }}>
                                    <Shield size={20} style={{ color: '#10b981' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>Privacy & Security</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                                        Control your data usage
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px', background: 'var(--color-bg-base)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div style={{ paddingRight: '16px' }}>
                                        <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: '0 0 4px 0', fontWeight: '500' }}>Use data for AI training</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: '1.4' }}>
                                            Allow us to use your anonymized meeting data to improve our AI models. This helps us provide better summaries and accuracy for everyone.
                                        </p>
                                    </div>
                                    <div style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px', flexShrink: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={privacy.data_usage_consent}
                                            onChange={(e) => setPrivacy({ ...privacy, data_usage_consent: e.target.checked })}
                                            style={{
                                                opacity: 0,
                                                width: 0,
                                                height: 0
                                            }}
                                        />
                                        <span style={{
                                            position: 'absolute',
                                            cursor: 'pointer',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: privacy.data_usage_consent ? '#d97706' : 'var(--color-bg-surface)',
                                            transition: '.4s',
                                            borderRadius: '34px',
                                            border: '1px solid var(--color-border-default)'
                                        }}>
                                            <span style={{
                                                position: 'absolute',
                                                content: '""',
                                                height: '16px',
                                                width: '16px',
                                                left: privacy.data_usage_consent ? '20px' : '4px',
                                                bottom: '3px',
                                                backgroundColor: 'white',
                                                transition: '.4s',
                                                borderRadius: '50%'
                                            }}></span>
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
