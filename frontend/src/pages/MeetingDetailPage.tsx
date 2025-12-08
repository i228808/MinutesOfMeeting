import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Sheet,
    FileSignature,
    Clock,
    Users,
    ListChecks,
    MessageSquare,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

interface Actor {
    name: string;
    email?: string;
    identified_from?: string;
}

interface Role {
    actor: string;
    role: string;
    department?: string;
}

interface Responsibility {
    actor: string;
    task: string;
    priority: string;
    status: string;
}

interface Deadline {
    task: string;
    actor: string;
    deadline: string;
    calendar_event_id?: string;
}

interface Decision {
    decision: string;
    made_by: string;
    context?: string;
}

interface Meeting {
    _id: string;
    title: string;
    status: string;
    created_at: string;
    raw_transcript: string;
    audio_file_path?: string;
    audio_duration_minutes?: number;
    summary?: string;
    processed_actors?: Actor[];
    processed_roles?: Role[];
    processed_responsibilities?: Responsibility[];
    processed_deadlines?: Deadline[];
    key_decisions?: Decision[];
    sheets_exported?: boolean;
    sheets_id?: string;
    error_message?: string;
}

const API_URL = 'http://localhost:5000/api';

export default function MeetingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState('');
    const [showContractModal, setShowContractModal] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('Pakistan');

    useEffect(() => {
        fetchMeeting();
    }, [id]);

    const fetchMeeting = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/meetings/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setMeeting(data.meeting);
            } else {
                navigate('/dashboard/meetings');
            }
        } catch (error) {
            console.error('Failed to fetch meeting:', error);
            navigate('/dashboard/meetings');
        } finally {
            setLoading(false);
        }
    };

    const handleExportToSheets = async () => {
        setActionLoading('sheets');
        setActionError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/meetings/${id}/export-sheets`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();

            if (res.ok) {
                window.open(data.spreadsheet?.url, '_blank');
                fetchMeeting(); // Refresh to update export status
            } else {
                setActionError(data.error || 'Export failed');
            }
        } catch (error) {
            setActionError('Failed to export to Sheets');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreateEvents = async () => {
        setActionLoading('calendar');
        setActionError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/meetings/${id}/create-events`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Created ${data.events_created} calendar events!`);
                fetchMeeting();
            } else {
                setActionError(data.error || 'Failed to create events');
            }
        } catch (error) {
            setActionError('Failed to create calendar events');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDraftContract = async () => {
        if (!meeting) return;
        setActionLoading('contract');
        setActionError('');
        setShowContractModal(false);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/contracts/generate-from-analysis`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transcript: meeting.raw_transcript,
                    region: selectedRegion,
                    contract_type: 'SERVICE_AGREEMENT',
                    title: `Contract - ${meeting.title}`,
                    meeting_id: meeting._id,
                    contract_elements: {
                        parties_identified: meeting.processed_actors?.map(a => a.name) || []
                    }
                })
            });

            const data = await res.json();

            if (res.ok && data.contract?.id) {
                navigate(`/dashboard/contracts/${data.contract.id}`);
            } else {
                setActionError(data.error || 'Failed to generate contract');
            }
        } catch (error) {
            setActionError('Failed to generate contract');
        } finally {
            setActionLoading(null);
        }
    };

    const regions = [
        'Pakistan', 'United States', 'United Kingdom', 'European Union', 'India',
        'Canada', 'Australia', 'UAE', 'Singapore', 'Germany', 'France',
        'China', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'South Africa',
        'Nigeria', 'Saudi Arabia'
    ];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDeadlineDate = (dateStr: string) => {
        if (!dateStr) return 'Not specified';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // Return as-is if not a valid date
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH':
            case 'CRITICAL':
                return 'badge-error';
            case 'MEDIUM':
                return 'badge-warning';
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

    if (!meeting) return null;

    const isCompleted = meeting.status === 'COMPLETED';
    const hasDeadlines = meeting.processed_deadlines && meeting.processed_deadlines.length > 0;

    return (
        <div style={{ padding: '32px 40px', maxWidth: '1200px' }} className="animate-fadeIn">
            {/* Back Button */}
            <Link to="/dashboard/meetings" style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', marginBottom: '16px' }}>
                <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                Back to Meetings
            </Link>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>{meeting.title}</h1>
                        <span className={`badge ${meeting.status === 'COMPLETED' ? 'badge-success' : meeting.status === 'FAILED' ? 'badge-error' : 'badge-warning'}`}>
                            {meeting.status}
                        </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, display: 'flex', alignItems: 'center' }}>
                        <Clock size={14} style={{ marginRight: '6px' }} />
                        {formatDate(meeting.created_at)}
                        {meeting.audio_duration_minutes ? (
                            <span style={{ marginLeft: '16px' }}>
                                • {Math.round(meeting.audio_duration_minutes)} min audio
                            </span>
                        ) : null}
                    </p>
                </div>

                {isCompleted && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleExportToSheets}
                            className="btn-secondary"
                            style={{ width: 'auto' }}
                            disabled={actionLoading === 'sheets'}
                        >
                            {actionLoading === 'sheets' ? <Loader2 size={16} className="animate-spin" /> : <Sheet size={16} />}
                            <span style={{ marginLeft: '8px' }}>
                                {meeting.sheets_exported ? 'Open Sheets' : 'Export to Sheets'}
                            </span>
                        </button>
                        {hasDeadlines && (
                            <button
                                onClick={handleCreateEvents}
                                className="btn-secondary"
                                style={{ width: 'auto' }}
                                disabled={actionLoading === 'calendar'}
                            >
                                {actionLoading === 'calendar' ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                                <span style={{ marginLeft: '8px' }}>Create Events</span>
                            </button>
                        )}
                        <button
                            onClick={() => setShowContractModal(true)}
                            className="btn-primary"
                            style={{ width: 'auto' }}
                            disabled={actionLoading === 'contract'}
                        >
                            {actionLoading === 'contract' ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={16} />}
                            <span style={{ marginLeft: '8px' }}>Draft Contract</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Region Selection Modal */}
            {showContractModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="dashboard-card" style={{ padding: '24px', width: '400px', maxWidth: '90vw' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 16px' }}>
                            <FileSignature size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#fbbf24' }} />
                            Generate Contract
                        </h3>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>
                            Select your jurisdiction for region-specific legal clauses
                        </p>
                        <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
                            Region / Jurisdiction
                        </label>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="glass-input"
                            style={{ marginBottom: '20px' }}
                        >
                            {regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowContractModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button onClick={handleDraftContract} className="btn-primary" style={{ flex: 1 }}>
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {(actionError || meeting.error_message) && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    marginBottom: '24px'
                }}>
                    <AlertCircle size={18} style={{ color: '#f87171', marginRight: '10px', flexShrink: 0 }} />
                    <span style={{ color: '#f87171', fontSize: '14px' }}>{actionError || meeting.error_message}</span>
                </div>
            )}

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Summary */}
                    {meeting.summary && (
                        <div className="dashboard-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 16px', display: 'flex', alignItems: 'center' }}>
                                <MessageSquare size={18} style={{ marginRight: '10px', color: '#fbbf24' }} />
                                Summary
                            </h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.7 }}>
                                {meeting.summary}
                            </p>
                        </div>
                    )}

                    {/* Key Decisions */}
                    {meeting.key_decisions && meeting.key_decisions.length > 0 && (
                        <div className="dashboard-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 16px', display: 'flex', alignItems: 'center' }}>
                                <CheckCircle2 size={18} style={{ marginRight: '10px', color: '#4ade80' }} />
                                Key Decisions ({meeting.key_decisions.length})
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {meeting.key_decisions.map((item, i) => (
                                    <div key={i} style={{
                                        padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '8px',
                                        borderLeft: '3px solid #4ade80'
                                    }}>
                                        <p style={{ fontSize: '14px', color: 'white', margin: '0 0 4px', fontWeight: '500' }}>
                                            {item.decision}
                                        </p>
                                        {item.made_by && (
                                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                                                Made by: {item.made_by}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Items / Responsibilities */}
                    {meeting.processed_responsibilities && meeting.processed_responsibilities.length > 0 && (
                        <div className="dashboard-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 16px', display: 'flex', alignItems: 'center' }}>
                                <ListChecks size={18} style={{ marginRight: '10px', color: '#60a5fa' }} />
                                Action Items ({meeting.processed_responsibilities.length})
                            </h3>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Task</th>
                                        <th>Assigned To</th>
                                        <th>Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meeting.processed_responsibilities.map((item, i) => (
                                        <tr key={i}>
                                            <td style={{ maxWidth: '300px' }}>{item.task}</td>
                                            <td>{item.actor}</td>
                                            <td>
                                                <span className={`badge ${getPriorityBadge(item.priority)}`}>
                                                    {item.priority}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Deadlines */}
                    {hasDeadlines && (
                        <div className="dashboard-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 16px', display: 'flex', alignItems: 'center' }}>
                                <Calendar size={18} style={{ marginRight: '10px', color: '#f87171' }} />
                                Deadlines ({meeting.processed_deadlines?.length})
                            </h3>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Task</th>
                                        <th>Assignee</th>
                                        <th>Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meeting.processed_deadlines?.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.task}</td>
                                            <td>{item.actor}</td>
                                            <td>
                                                <span style={{ color: '#fbbf24' }}>
                                                    {formatDeadlineDate(item.deadline)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Transcript */}
                    <div className="dashboard-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 16px' }}>
                            Transcript
                        </h3>
                        <div style={{
                            maxHeight: '400px',
                            overflow: 'auto',
                            padding: '16px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.6)',
                            lineHeight: 1.8,
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace'
                        }}>
                            {meeting.raw_transcript || 'No transcript available'}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Participants */}
                    {meeting.processed_actors && meeting.processed_actors.length > 0 && (
                        <div className="dashboard-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 16px', display: 'flex', alignItems: 'center' }}>
                                <Users size={18} style={{ marginRight: '10px', color: '#60a5fa' }} />
                                Participants ({meeting.processed_actors.length})
                            </h3>
                            {meeting.processed_actors.map((actor, i) => {
                                const role = meeting.processed_roles?.find(r => r.actor === actor.name);
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '8px',
                                            background: `hsl(${(i * 50) % 360}, 45%, 45%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: 'white',
                                            marginRight: '12px',
                                            flexShrink: 0
                                        }}>
                                            {actor.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {actor.name}
                                            </p>
                                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                                                {role?.role || actor.identified_from || 'Participant'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="dashboard-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Meeting Stats
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Participants</span>
                            <span style={{ fontSize: '13px', color: 'white', fontWeight: '500' }}>{meeting.processed_actors?.length || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Action Items</span>
                            <span style={{ fontSize: '13px', color: 'white', fontWeight: '500' }}>{meeting.processed_responsibilities?.length || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Deadlines</span>
                            <span style={{ fontSize: '13px', color: 'white', fontWeight: '500' }}>{meeting.processed_deadlines?.length || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Key Decisions</span>
                            <span style={{ fontSize: '13px', color: 'white', fontWeight: '500' }}>{meeting.key_decisions?.length || 0}</span>
                        </div>
                    </div>

                    {/* Export Status */}
                    {meeting.sheets_exported && (
                        <div className="dashboard-card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', color: '#4ade80', fontSize: '13px' }}>
                                <CheckCircle2 size={16} style={{ marginRight: '8px' }} />
                                Exported to Google Sheets
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
