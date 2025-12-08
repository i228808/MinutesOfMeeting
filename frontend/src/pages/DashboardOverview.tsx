import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Upload,
    FileText,
    Clock,
    FileSignature,
    TrendingUp,
    ArrowUpRight,
    Calendar,
    Sparkles,
    Bell,
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
    BASIC: { uploads: 20, audio: 120, contracts: 10 },
    PREMIUM: { uploads: 50, audio: 300, contracts: Infinity },
    ULTRA: { uploads: Infinity, audio: Infinity, contracts: Infinity }
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
        <div style={{ padding: '32px 40px', maxWidth: '1400px' }} className="animate-fadeIn">
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'there'}
                    </h1>
                    <span className={`badge badge-tier-${tier.toLowerCase()}`}>
                        {tier} Plan
                    </span>
                </div>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    Here's what's happening with your meetings today.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {/* Uploads */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(217, 119, 6, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Upload size={20} style={{ color: '#fbbf24' }} />
                        </div>
                        <TrendingUp size={16} style={{ color: '#4ade80' }} />
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Meetings Uploaded</p>
                    <p style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>
                        {usage?.monthly_uploads || 0}
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>
                            {limits.uploads !== Infinity ? ` / ${limits.uploads}` : ''}
                        </span>
                    </p>
                    {limits.uploads !== Infinity && (
                        <div className="progress-bar" style={{ marginTop: '12px' }}>
                            <div className="progress-fill" style={{ width: `${getUsagePercentage(usage?.monthly_uploads || 0, limits.uploads)}%` }} />
                        </div>
                    )}
                </div>

                {/* Audio Minutes */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Clock size={20} style={{ color: '#60a5fa' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Audio Minutes</p>
                    <p style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>
                        {Math.round(usage?.monthly_audio_minutes || 0)}
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>
                            {limits.audio !== Infinity ? ` / ${limits.audio} min` : ' min'}
                        </span>
                    </p>
                    {limits.audio !== Infinity && (
                        <div className="progress-bar" style={{ marginTop: '12px' }}>
                            <div className="progress-fill" style={{ width: `${getUsagePercentage(usage?.monthly_audio_minutes || 0, limits.audio)}%` }} />
                        </div>
                    )}
                </div>

                {/* Contracts */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(168, 85, 247, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FileSignature size={20} style={{ color: '#c084fc' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Contracts Created</p>
                    <p style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>
                        {usage?.monthly_contracts || 0}
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>
                            {limits.contracts !== Infinity ? ` / ${limits.contracts}` : ''}
                        </span>
                    </p>
                    {limits.contracts !== Infinity && (
                        <div className="progress-bar" style={{ marginTop: '12px' }}>
                            <div className="progress-fill" style={{ width: `${getUsagePercentage(usage?.monthly_contracts || 0, limits.contracts)}%` }} />
                        </div>
                    )}
                </div>

                {/* Upcoming Deadlines */}
                <Link to="/dashboard/calendar" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(34, 197, 94, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Calendar size={20} style={{ color: '#4ade80' }} />
                        </div>
                        <ArrowUpRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Upcoming Deadlines</p>
                    <p style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>
                        {upcomingDeadlines.length}
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}> this week</span>
                    </p>
                </Link>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Recent Meetings */}
                <div className="dashboard-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                            Recent Meetings
                        </h2>
                        <Link to="/dashboard/meetings" style={{ fontSize: '13px', color: '#fbbf24', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            View all <ArrowUpRight size={14} style={{ marginLeft: '4px' }} />
                        </Link>
                    </div>

                    {recentMeetings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <FileText size={40} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
                            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, marginBottom: '8px' }}>No meetings yet</p>
                            <Link to="/dashboard/upload" style={{ fontSize: '14px', color: '#fbbf24', textDecoration: 'none' }}>
                                Upload your first meeting →
                            </Link>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentMeetings.map((meeting) => (
                                    <tr key={meeting._id}>
                                        <td>
                                            <Link to={`/dashboard/meetings/${meeting._id}`} style={{ color: 'white', textDecoration: 'none' }}>
                                                {meeting.title}
                                            </Link>
                                        </td>
                                        <td style={{ color: 'rgba(255,255,255,0.5)' }}>{formatDate(meeting.created_at)}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(meeting.status)}`}>
                                                {meeting.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Upcoming Deadlines List */}
                    <div className="dashboard-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0, display: 'flex', alignItems: 'center' }}>
                                <Calendar size={16} style={{ marginRight: '8px', color: '#4ade80' }} />
                                Upcoming Events
                            </h3>
                            <Link to="/dashboard/calendar" style={{ fontSize: '12px', color: '#fbbf24', textDecoration: 'none' }}>
                                View all
                            </Link>
                        </div>
                        {upcomingDeadlines.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>No upcoming events</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {upcomingDeadlines.slice(0, 4).map(event => (
                                    <div key={event._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                        <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: event.color || '#f59e0b' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '13px', color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
                                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{formatDeadlineDate(event.start_time)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reminders */}
                    <div className="dashboard-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0, display: 'flex', alignItems: 'center' }}>
                                <Bell size={16} style={{ marginRight: '8px', color: '#fbbf24' }} />
                                Pending Reminders
                            </h3>
                            <Link to="/dashboard/reminders" style={{ fontSize: '12px', color: '#fbbf24', textDecoration: 'none' }}>
                                View all
                            </Link>
                        </div>
                        {reminders.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>No pending reminders</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {reminders.map(reminder => (
                                    <div key={reminder._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                        <AlertCircle size={14} style={{ color: '#fbbf24', marginTop: '2px', flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '13px', color: 'white', margin: 0 }}>{reminder.task}</p>
                                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{formatDeadlineDate(reminder.remind_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upgrade Banner (for FREE users) */}
                    {tier === 'FREE' && (
                        <div style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(180, 83, 9, 0.1) 100%)',
                            border: '1px solid rgba(217, 119, 6, 0.3)',
                            borderRadius: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <Sparkles size={20} style={{ color: '#fbbf24', marginRight: '8px' }} />
                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0 }}>Upgrade to Pro</h3>
                            </div>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
                                Get 50 uploads/month, 120 audio minutes, and priority processing.
                            </p>
                            <Link to="/dashboard/subscription" className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '10px 16px' }}>
                                View Plans
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

