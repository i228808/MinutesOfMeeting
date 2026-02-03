import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    MoreVertical,
    ExternalLink,
    Trash2,
    Sheet,
    Clock,
    Calendar, // Keeping import if needed or remove if unused, will keep for safety
    CheckCircle // Keeping for safety
} from 'lucide-react';
import GlassModal from '../components/GlassModal';

interface Meeting {
    _id: string;
    title: string;
    status: string;
    created_at: string;
    summary?: string;
    audio_duration_minutes?: number;
    actors?: Array<{ name: string; role: string }>;
}

import { API_URL } from '../config';

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/meetings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setMeetings(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this meeting?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/meetings/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setMeetings(meetings.filter(m => m._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete meeting:', error);
        }
        setActiveMenu(null);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'badge-success';
            case 'PROCESSING': return 'badge-warning';
            case 'FAILED': return 'badge-error';
            case 'PENDING': return 'badge-info';
            default: return 'badge-info';
        }
    };

    const filteredMeetings = meetings.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

        let matchesDate = true;
        if (dateFilter !== 'ALL') {
            const meetingDate = new Date(m.created_at);
            const now = new Date();
            if (dateFilter === 'TODAY') {
                matchesDate = meetingDate.toDateString() === now.toDateString();
            } else if (dateFilter === 'WEEK') {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                matchesDate = meetingDate >= weekAgo;
            } else if (dateFilter === 'MONTH') {
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                matchesDate = meetingDate >= monthAgo;
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

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
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="text-display-md" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Meetings</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                        Manage and analyze your recorded sessions
                    </p>
                </div>
                <Link to="/dashboard/upload" className="btn btn-primary btn-lg">
                    <Plus size={20} />
                    New Meeting
                </Link>
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input"
                        style={{ paddingLeft: '48px', height: '48px', fontSize: '15px' }}
                    />
                </div>
                <button
                    className={`btn ${showFilters || statusFilter !== 'ALL' || dateFilter !== 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ height: '48px', padding: '0 24px' }}
                    onClick={() => setShowFilters(true)}
                >
                    <Filter size={18} />
                    Filters
                    {(statusFilter !== 'ALL' || dateFilter !== 'ALL') && (
                        <span style={{
                            marginLeft: '8px',
                            background: 'rgba(255,255,255,0.2)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}>
                            !
                        </span>
                    )}
                </button>
            </div>

            {/* Meetings List */}
            <div className="rich-table-container">
                {filteredMeetings.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '24px',
                            background: 'rgba(255,255,255,0.03)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
                        }}>
                            <FileText size={32} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                            {searchQuery ? 'No meetings found' : 'No meetings yet'}
                        </h3>
                        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                            {searchQuery ? 'Try adjusting your search terms' : 'Upload your first meeting recording to get started'}
                        </p>
                        {!searchQuery && (
                            <Link to="/dashboard/upload" className="btn btn-primary">
                                <Plus size={18} />
                                Upload First Meeting
                            </Link>
                        )}
                    </div>
                ) : (
                    <table className="rich-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Title</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style={{ width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMeetings.map((meeting) => (
                                <tr key={meeting._id}>
                                    <td>
                                        <Link
                                            to={`/dashboard/meetings/${meeting._id}`}
                                            style={{ display: 'block', textDecoration: 'none' }}
                                        >
                                            <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                                                {meeting.title}
                                            </span>
                                            {meeting.summary && (
                                                <span style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                                    {meeting.summary.length > 80 ? meeting.summary.substring(0, 80) + '...' : meeting.summary}
                                                </span>
                                            )}
                                        </Link>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                                            <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                                            {meeting.audio_duration_minutes ? `${Math.round(meeting.audio_duration_minutes)} min` : '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(meeting.status)}`}>
                                            {meeting.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                        {formatDate(meeting.created_at)}
                                    </td>
                                    <td>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === meeting._id ? null : meeting._id)}
                                                className="btn-icon btn-ghost"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenu === meeting._id && (
                                                <div className="glass-dropdown" style={{
                                                    position: 'absolute',
                                                    right: '100%',
                                                    top: '0',
                                                    marginRight: '8px',
                                                    width: '180px',
                                                    zIndex: 50
                                                }}>
                                                    <Link
                                                        to={`/dashboard/meetings/${meeting._id}`}
                                                        className="glass-dropdown-item"
                                                    >
                                                        <ExternalLink size={14} style={{ marginRight: '10px' }} />
                                                        View Details
                                                    </Link>
                                                    <button className="glass-dropdown-item" onClick={() => {/* Export */ }}>
                                                        <Sheet size={14} style={{ marginRight: '10px' }} />
                                                        Export
                                                    </button>
                                                    <div style={{ height: '1px', background: 'var(--color-border-subtle)', margin: '4px 0' }} />
                                                    <button
                                                        onClick={() => handleDelete(meeting._id)}
                                                        className="glass-dropdown-item danger"
                                                    >
                                                        <Trash2 size={14} style={{ marginRight: '10px' }} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <GlassModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                title="Filter Meetings"
                footer={
                    <>
                        <button
                            className="btn btn-ghost"
                            onClick={() => {
                                setStatusFilter('ALL');
                                setDateFilter('ALL');
                                setShowFilters(false);
                            }}
                        >
                            Reset
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowFilters(false)}
                        >
                            Apply Filters
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                            Status
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {['ALL', 'COMPLETED', 'PROCESSING', 'PENDING', 'FAILED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '8px 16px', fontSize: '13px' }}
                                >
                                    {status === 'ALL' ? 'All Statuses' : status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                            Date Range
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button
                                onClick={() => setDateFilter('ALL')}
                                className={`btn ${dateFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                Anytime
                            </button>
                            <button
                                onClick={() => setDateFilter('TODAY')}
                                className={`btn ${dateFilter === 'TODAY' ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                Last 24 Hours
                            </button>
                            <button
                                onClick={() => setDateFilter('WEEK')}
                                className={`btn ${dateFilter === 'WEEK' ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                Last 7 Days
                            </button>
                            <button
                                onClick={() => setDateFilter('MONTH')}
                                className={`btn ${dateFilter === 'MONTH' ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                Last 30 Days
                            </button>
                        </div>
                    </div>
                </div>
            </GlassModal>
        </div>
    );
}
