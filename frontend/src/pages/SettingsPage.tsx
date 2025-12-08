import { useState, useEffect } from 'react';
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Save,
    Loader2,
    CheckCircle,
    Moon,
    Sun
} from 'lucide-react';

interface UserProfile {
    name: string;
    email: string;
    data_usage_consent?: boolean;
}

interface NotificationSettings {
    email_reminders: boolean;
    email_deadlines: boolean;
    push_enabled: boolean;
}

const API_URL = 'http://localhost:5000/api';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'appearance'>('profile');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Profile state
    const [profile, setProfile] = useState<UserProfile>({ name: '', email: '' });

    // Notification settings
    const [notifications, setNotifications] = useState<NotificationSettings>({
        email_reminders: true,
        email_deadlines: true,
        push_enabled: false
    });

    // Appearance
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        fetchProfile();
        loadLocalSettings();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    name: data.user?.name || '',
                    email: data.user?.email || '',
                    data_usage_consent: data.user?.data_usage_consent || false
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    };

    const loadLocalSettings = () => {
        const savedNotifications = localStorage.getItem('notification_settings');
        if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications));
        }
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
        if (savedTheme) setTheme(savedTheme);
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            // Update profile with consent
            await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: profile.name,
                    data_usage_consent: profile.data_usage_consent
                })
            });

            // Save notifications to localStorage (would be API in production)
            localStorage.setItem('notification_settings', JSON.stringify(notifications));
            localStorage.setItem('theme', theme);

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save settings', error);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Palette }
    ] as const;

    return (
        <div style={{ padding: '32px 40px' }} className="animate-fadeIn">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>Settings</h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: '4px' }}>
                        Manage your account and preferences
                    </p>
                </div>
                <button onClick={handleSave} className="btn-primary" style={{ width: 'auto' }} disabled={saving}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <><CheckCircle size={16} style={{ marginRight: '6px' }} /> Saved</> : <><Save size={16} style={{ marginRight: '8px' }} /> Save Changes</>}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '32px' }}>
                {/* Tabs */}
                <div className="dashboard-card" style={{ padding: '16px', height: 'fit-content' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                background: activeTab === tab.id ? 'rgba(217,119,6,0.15)' : 'transparent',
                                color: activeTab === tab.id ? '#fbbf24' : 'rgba(255,255,255,0.6)',
                                fontSize: '14px',
                                cursor: 'pointer',
                                marginBottom: '4px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <tab.icon size={18} style={{ marginRight: '10px' }} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="dashboard-card" style={{ padding: '24px' }}>
                    {activeTab === 'profile' && (
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 20px', display: 'flex', alignItems: 'center' }}>
                                <User size={18} style={{ marginRight: '10px', color: '#fbbf24' }} /> Profile Information
                            </h3>
                            <div style={{ maxWidth: '400px' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="glass-input"
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="glass-input"
                                        style={{ opacity: 0.6 }}
                                    />
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Email cannot be changed</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 20px', display: 'flex', alignItems: 'center' }}>
                                <Bell size={18} style={{ marginRight: '10px', color: '#fbbf24' }} /> Notification Preferences
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: 'white', margin: 0 }}>Email Reminders</p>
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Receive reminder emails</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.email_reminders}
                                        onChange={(e) => setNotifications({ ...notifications, email_reminders: e.target.checked })}
                                        style={{ width: '20px', height: '20px', accentColor: '#d97706' }}
                                    />
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: 'white', margin: 0 }}>Deadline Alerts</p>
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Get notified about upcoming deadlines</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.email_deadlines}
                                        onChange={(e) => setNotifications({ ...notifications, email_deadlines: e.target.checked })}
                                        style={{ width: '20px', height: '20px', accentColor: '#d97706' }}
                                    />
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', color: 'white', margin: 0 }}>Push Notifications</p>
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Browser push notifications</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.push_enabled}
                                        onChange={(e) => setNotifications({ ...notifications, push_enabled: e.target.checked })}
                                        style={{ width: '20px', height: '20px', accentColor: '#d97706' }}
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 20px', display: 'flex', alignItems: 'center' }}>
                                <Shield size={18} style={{ marginRight: '10px', color: '#fbbf24' }} /> Privacy Settings
                            </h3>
                            <div style={{ maxWidth: '500px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <div style={{ paddingRight: '16px' }}>
                                        <p style={{ fontSize: '14px', color: 'white', margin: '0 0 4px 0', fontWeight: '500' }}>Use data for AI training</p>
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '1.4' }}>
                                            Allow us to use your anonymized meeting data to improve our AI models. This helps us provide better summaries and accuracy for everyone.
                                        </p>
                                    </div>
                                    <div style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px', flexShrink: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={profile.data_usage_consent || false}
                                            onChange={(e) => setProfile({ ...profile, data_usage_consent: e.target.checked })}
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
                                            backgroundColor: profile.data_usage_consent ? '#d97706' : 'rgba(255,255,255,0.1)',
                                            transition: '.4s',
                                            borderRadius: '34px'
                                        }}>
                                            <span style={{
                                                position: 'absolute',
                                                content: '""',
                                                height: '16px',
                                                width: '16px',
                                                left: profile.data_usage_consent ? '20px' : '4px',
                                                bottom: '4px',
                                                backgroundColor: 'white',
                                                transition: '.4s',
                                                borderRadius: '50%'
                                            }}></span>
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 20px', display: 'flex', alignItems: 'center' }}>
                                <Palette size={18} style={{ marginRight: '10px', color: '#fbbf24' }} /> Appearance
                            </h3>
                            <div style={{ maxWidth: '400px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>Theme</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '16px',
                                            border: theme === 'dark' ? '2px solid #d97706' : '2px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            background: 'rgba(0,0,0,0.3)',
                                            color: 'white',
                                            fontSize: '14px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Moon size={20} style={{ marginRight: '8px' }} /> Dark
                                    </button>
                                    <button
                                        onClick={() => setTheme('light')}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '16px',
                                            border: theme === 'light' ? '2px solid #d97706' : '2px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            fontSize: '14px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Sun size={20} style={{ marginRight: '8px' }} /> Light
                                    </button>
                                </div>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>
                                    Note: Light theme coming soon
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
