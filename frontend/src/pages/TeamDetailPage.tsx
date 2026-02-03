import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Copy, Check, Calendar, Plus, Clock, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '../config';

interface Member {
    _id: string;
    name: string;
    email: string;
}

interface TeamMeeting {
    _id: string;
    title: string;
    status: string;
    created_at: string;
    audio_duration_minutes: number;
}

interface TeamDetail {
    _id: string;
    name: string;
    invite_code: string;
    members: Member[];
    owner_id: { _id: string; name: string; email: string };
}

const TeamDetailPage = () => {
    const { id } = useParams();
    const [team, setTeam] = useState<TeamDetail | null>(null);
    const [meetings, setMeetings] = useState<TeamMeeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchTeamDetails();
    }, [id]);

    const fetchTeamDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teams/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch team');
            setTeam(data.team);
            setMeetings(data.meetings || []);
        } catch (error: any) {
            console.error('Failed to fetch team details', error);
            toast.error(error.message || 'Failed to load team details');
        } finally {
            setLoading(false);
        }
    };

    const copyInviteCode = () => {
        if (team?.invite_code) {
            navigator.clipboard.writeText(team.invite_code);
            setCopied(true);
            toast.success('Invite code copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
            </div>
        );
    }

    if (!team) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Team Not Found</h2>
                <Link to="/dashboard/teams" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Return to Teams</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Link to="/dashboard/teams" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px' }}>Teams</Link>
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
                        <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>{team.name}</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                        <Users size={16} />
                        <span>{team.members.length} Members</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 12px 4px 4px' }}>
                    <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '2px', color: 'var(--color-primary)' }}>
                        {team.invite_code}
                    </div>
                    <button
                        onClick={copyInviteCode}
                        style={{ background: 'none', border: 'none', color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}
                        title="Copy Invite Code"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                {/* Main Content: Meetings */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} style={{ color: 'var(--color-primary)' }} /> Team Meetings
                        </h2>
                        <Link to="/dashboard/upload" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                            <Plus size={16} style={{ marginRight: '6px' }} /> New Meeting
                        </Link>
                    </div>

                    {meetings.length === 0 ? (
                        <div className="dashboard-card" style={{ padding: '32px', textAlign: 'center', borderStyle: 'dashed' }}>
                            <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>No meetings recorded for this team yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {meetings.map((meeting) => (
                                <Link
                                    key={meeting._id}
                                    to={`/dashboard/meetings/${meeting._id}`}
                                    className="dashboard-card"
                                    style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                        <div style={{
                                            padding: '12px',
                                            borderRadius: '10px',
                                            background: meeting.status === 'COMPLETED' ? 'rgba(74,222,128,0.1)' : meeting.status === 'PROCESSING' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                                            color: meeting.status === 'COMPLETED' ? '#4ade80' : meeting.status === 'PROCESSING' ? '#3b82f6' : 'rgba(255,255,255,0.4)'
                                        }}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '14px', fontWeight: '500', color: 'white', margin: '0 0 6px' }}>{meeting.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} /> {new Date(meeting.created_at).toLocaleDateString()}
                                                </span>
                                                {meeting.audio_duration_minutes > 0 && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={12} /> {Math.round(meeting.audio_duration_minutes)}m
                                                    </span>
                                                )}
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '10px',
                                                    background: meeting.status === 'COMPLETED' ? 'rgba(74,222,128,0.1)' : 'rgba(59,130,246,0.1)',
                                                    color: meeting.status === 'COMPLETED' ? '#4ade80' : '#3b82f6'
                                                }}>
                                                    {meeting.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: Members */}
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} style={{ color: 'var(--color-primary)' }} /> Members
                    </h2>
                    <div className="dashboard-card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {team.members.map((member) => (
                                <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '13px', fontWeight: '500', color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</p>
                                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</p>
                                    </div>
                                    {member._id === team.owner_id._id && (
                                        <span style={{ fontSize: '10px', padding: '4px 8px', background: 'rgba(255,107,74,0.15)', color: 'var(--color-primary)', borderRadius: '4px' }}>Owner</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamDetailPage;
