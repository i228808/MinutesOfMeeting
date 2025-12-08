import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    MoreVertical,
    ExternalLink,
    Trash2,
    Calendar,
    Sheet
} from 'lucide-react';

interface Meeting {
    _id: string;
    title: string;
    status: string;
    created_at: string;
    summary?: string;
    audio_duration_minutes?: number;
    actors?: Array<{ name: string; role: string }>;
}

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/meetings', {
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
            const res = await fetch(`http://localhost:5000/api/meetings/${id}`, {
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

    const filteredMeetings = meetings.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>Meetings</h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: '4px' }}>
                        {meetings.length} meetings total
                    </p>
                </div>
                <Link to="/dashboard/upload" className="btn-primary" style={{ width: 'auto', textDecoration: 'none', padding: '12px 20px' }}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    New Meeting
                </Link>
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                    <input
                        type="text"
                        placeholder="Search meetings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input"
                        style={{ paddingLeft: '44px' }}
                    />
                </div>
                <button className="btn-secondary" style={{ width: 'auto', padding: '0 16px' }}>
                    <Filter size={16} style={{ marginRight: '8px' }} />
                    Filters
                </button>
            </div>

            {/* Meetings List */}
            {filteredMeetings.length === 0 ? (
                <div className="dashboard-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                    <FileText size={48} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px' }}>
                        {searchQuery ? 'No meetings found' : 'No meetings yet'}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
                        {searchQuery ? 'Try adjusting your search' : 'Upload your first meeting recording to get started'}
                    </p>
                    {!searchQuery && (
                        <Link to="/dashboard/upload" className="btn-primary" style={{ width: 'auto', display: 'inline-flex', textDecoration: 'none', padding: '12px 24px' }}>
                            <Plus size={18} style={{ marginRight: '8px' }} />
                            Upload Meeting
                        </Link>
                    )}
                </div>
            ) : (
                <div className="dashboard-card" style={{ overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMeetings.map((meeting) => (
                                <tr key={meeting._id}>
                                    <td>
                                        <Link
                                            to={`/dashboard/meetings/${meeting._id}`}
                                            style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}
                                        >
                                            {meeting.title}
                                        </Link>
                                        {meeting.summary && (
                                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {meeting.summary}
                                            </p>
                                        )}
                                    </td>
                                    <td style={{ color: 'rgba(255,255,255,0.6)' }}>
                                        {meeting.audio_duration_minutes ? `${Math.round(meeting.audio_duration_minutes)} min` : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(meeting.status)}`}>
                                            {meeting.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {formatDate(meeting.created_at)}
                                    </td>
                                    <td>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === meeting._id ? null : meeting._id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'rgba(255,255,255,0.4)',
                                                    cursor: 'pointer',
                                                    padding: '8px',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {activeMenu === meeting._id && (
                                                <div style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: '100%',
                                                    background: 'rgba(20, 20, 25, 0.98)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    minWidth: '160px',
                                                    zIndex: 50,
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                                }}>
                                                    <Link
                                                        to={`/dashboard/meetings/${meeting._id}`}
                                                        style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderRadius: '6px', fontSize: '13px' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <ExternalLink size={14} style={{ marginRight: '10px' }} />
                                                        View Details
                                                    </Link>
                                                    <button
                                                        onClick={() => {/* Export to sheets */ }}
                                                        style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 12px', color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Sheet size={14} style={{ marginRight: '10px' }} />
                                                        Export to Sheets
                                                    </button>
                                                    <button
                                                        onClick={() => {/* Create calendar events */ }}
                                                        style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 12px', color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Calendar size={14} style={{ marginRight: '10px' }} />
                                                        Create Events
                                                    </button>
                                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
                                                    <button
                                                        onClick={() => handleDelete(meeting._id)}
                                                        style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 12px', color: '#f87171', background: 'none', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
                </div>
            )}
        </div>
    );
}
