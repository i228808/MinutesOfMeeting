import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Upload,
    FileText,
    Clock,
    FileSignature,
    ArrowUpRight,
    Calendar,
    Sparkles,
    AlertCircle
} from 'lucide-react';

interface UsageStats {
    monthly_uploads: number;
    monthly_audio_minutes: number;
    monthly_contracts: number;
}

interface Meeting {
    _id: string;
    title: string;
    status: string;
    created_at: string;
    summary?: string;
}

interface CalendarEvent {
    _id: string;
    title: string;
    start_time: string;
    end_time: string;
    type: string;
    color?: string;
}

interface Reminder {
    _id: string;
    task: string;
    message: string;
    remind_at: string;
    status: string;
}

const TIER_LIMITS = {
    FREE: { uploads: 5, audio: 10, contracts: 3 },
    STARTER: { uploads: 20, audio: 120, contracts: 10 },
    PRO: { uploads: 50, audio: 300, contracts: Infinity },
    UNLIMITED: { uploads: Infinity, audio: Infinity, contracts: Infinity }
};

const API_URL = 'http://localhost:5000/api';

export default function DashboardOverview() {
    const [user, setUser] = useState<any>(null);
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState<CalendarEvent[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch user data with usage
            const userRes = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (userRes.ok) {
                const data = await userRes.json();
                setUser(data.user);
                setUsage(data.usage);
            }

            // Fetch recent meetings
            const meetingsRes = await fetch(`${API_URL}/meetings?limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (meetingsRes.ok) {
                const meetingsData = await meetingsRes.json();
                setRecentMeetings(meetingsData.data || []);
            }

            // Fetch upcoming calendar events (deadlines) - use dedicated endpoint
            const calendarRes = await fetch(`${API_URL}/calendar/upcoming?days=30`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (calendarRes.ok) {
                const calendarData = await calendarRes.json();
                const events = (calendarData.events || []).slice(0, 5);
                setUpcomingDeadlines(events);
            }

            // Fetch pending reminders
            const remindersRes = await fetch(`${API_URL}/reminders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (remindersRes.ok) {
                const remindersData = await remindersRes.json();
                const pending = (remindersData.data || remindersData.reminders || [])
                    .filter((r: Reminder) => r.status === 'PENDING')
                    .slice(0, 3);
                setReminders(pending);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const tier = user?.subscription_tier || 'FREE';
    const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];

    const getUsagePercentage = (used: number, limit: number) => {
        if (limit === Infinity) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDeadlineDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `In ${diffDays} days`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'badge-success';
            case 'PROCESSING':
                return 'badge-warning';
            case 'FAILED':
                return 'badge-error';
            default:
                return 'badge-info';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#d97706', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }} className="animate-fadeIn">
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="text-display-md" style={{ fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'there'}
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
                        Here's your meeting intelligence overview.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Link to="/dashboard/calendar" className="btn btn-secondary">
                        <Calendar size={18} />
                        View Calendar
                    </Link>
                    <Link to="/dashboard/upload" className="btn btn-primary">
                        <Upload size={18} />
                        Upload Meeting
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid-cols-4" style={{ marginBottom: '40px' }}>
                {/* Uploads */}
                <div className="stat-card delay-100 animate-fadeInUp">
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: 'rgba(255, 107, 74, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Upload size={24} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <span className={`badge ${usage?.monthly_uploads ? 'badge-success' : 'badge-free'}`}>
                            {limits.uploads !== Infinity ? `${Math.round((usage?.monthly_uploads || 0) / limits.uploads * 100)}% Used` : 'Unlimited'}
                        </span>
                    </div>
                    <p className="text-label" style={{ marginBottom: '8px' }}>Monthly Uploads</p>
                    <div className="flex-between">
                        <p className="text-display-md" style={{ fontSize: '32px' }}>{usage?.monthly_uploads || 0}</p>
                        <p className="text-small">/ {limits.uploads === Infinity ? '∞' : limits.uploads}</p>
                    </div>
                    {limits.uploads !== Infinity && (
                        <div className="progress-bar" style={{ marginTop: '16px' }}>
                            <div className="progress-fill" style={{ width: `${getUsagePercentage(usage?.monthly_uploads || 0, limits.uploads)}%` }} />
                        </div>
                    )}
                </div>

                {/* Audio Minutes */}
                <div className="stat-card delay-200 animate-fadeInUp">
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: 'rgba(92, 157, 255, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Clock size={24} style={{ color: 'var(--color-info)' }} />
                        </div>
                    </div>
                    <p className="text-label" style={{ marginBottom: '8px' }}>Audio Minutes</p>
                    <div className="flex-between">
                        <p className="text-display-md" style={{ fontSize: '32px' }}>{Math.round(usage?.monthly_audio_minutes || 0)}</p>
                        <p className="text-small">/ {limits.audio === Infinity ? '∞' : limits.audio}</p>
                    </div>
                    {limits.audio !== Infinity && (
                        <div className="progress-bar" style={{ marginTop: '16px' }}>
                            <div className="progress-fill" style={{ width: `${getUsagePercentage(usage?.monthly_audio_minutes || 0, limits.audio)}%`, background: 'var(--color-info)' }} />
                        </div>
                    )}
                </div>

                {/* Contracts */}
                <div className="stat-card delay-300 animate-fadeInUp">
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: 'rgba(168, 85, 247, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FileSignature size={24} style={{ color: '#c084fc' }} />
                        </div>
                    </div>
                    <p className="text-label" style={{ marginBottom: '8px' }}>Contracts Generated</p>
                    <div className="flex-between">
                        <p className="text-display-md" style={{ fontSize: '32px' }}>{usage?.monthly_contracts || 0}</p>
                        <p className="text-small">/ {limits.contracts === Infinity ? '∞' : limits.contracts}</p>
                    </div>
                </div>

                {/* Upcoming Events */}
                <Link to="/dashboard/calendar" className="stat-card delay-300 animate-fadeInUp" style={{ textDecoration: 'none', cursor: 'pointer', border: '1px solid var(--color-border-hover)' }}>
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: 'rgba(74, 227, 181, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Calendar size={24} style={{ color: 'var(--color-secondary)' }} />
                        </div>
                        <ArrowUpRight size={20} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <p className="text-label" style={{ marginBottom: '8px' }}>Upcoming Events</p>
                    <div className="flex-between">
                        <p className="text-display-md" style={{ fontSize: '32px' }}>{upcomingDeadlines.length}</p>
                        <p className="text-small">This Month</p>
                    </div>
                </Link>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '32px' }}>
                {/* Recent Meetings */}
                <div className="animate-fadeInUp delay-200">
                    <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Meetings</h2>
                        <Link to="/dashboard/meetings" className="btn-ghost btn-sm">
                            View All <ArrowUpRight size={14} style={{ marginLeft: '4px' }} />
                        </Link>
                    </div>

                    <div className="rich-table-container">
                        {recentMeetings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <FileText size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.2, marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No meetings yet</h3>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Upload your first meeting recording to get started.</p>
                                <Link to="/dashboard/upload" className="btn btn-primary">
                                    <Upload size={16} />
                                    Upload Meeting
                                </Link>
                            </div>
                        ) : (
                            <table className="rich-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentMeetings.map((meeting) => (
                                        <tr key={meeting._id}>
                                            <td style={{ fontWeight: '600', color: 'white' }}>
                                                {meeting.title}
                                                {meeting.summary && (
                                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: '400' }}>
                                                        {meeting.summary.substring(0, 60)}...
                                                    </div>
                                                )}
                                            </td>
                                            <td>{formatDate(meeting.created_at)}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(meeting.status)}`}>
                                                    {meeting.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <Link to={`/dashboard/meetings/${meeting._id}`} className="btn-icon btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <ArrowUpRight size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="animate-fadeInUp delay-300" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Upgrade Banner */}
                    {tier === 'FREE' && (
                        <div style={{
                            padding: '24px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(255, 107, 74, 0.15) 0%, rgba(20, 20, 25, 0) 100%)',
                            border: '1px solid rgba(255, 107, 74, 0.2)',
                            boxShadow: '0 8px 32px rgba(255, 107, 74, 0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--color-primary)', color: 'black' }}>
                                    <Sparkles size={20} />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Unlock Pro</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
                                Get unlimited uploads, advanced AI analysis, and generated legal contracts.
                            </p>
                            <Link to="/dashboard/subscription" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                Upgrade Plan
                            </Link>
                        </div>
                    )}

                    {/* Pending Reminders */}
                    <div className="dashboard-card" style={{ padding: '24px' }}>
                        <div className="flex-between" style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Reminders</h3>
                            <Link to="/dashboard/reminders" className="text-small">View All</Link>
                        </div>

                        {reminders.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px', background: 'var(--color-bg-surface)', borderRadius: '12px' }}>
                                No pending tasks
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {reminders.map(reminder => (
                                    <div key={reminder._id} style={{
                                        padding: '12px 16px',
                                        background: 'var(--color-bg-surface)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--color-border-subtle)',
                                        display: 'flex',
                                        gap: '12px'
                                    }}>
                                        <AlertCircle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>{reminder.task}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{formatDeadlineDate(reminder.remind_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


