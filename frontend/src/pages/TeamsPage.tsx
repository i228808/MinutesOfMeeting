import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, UserPlus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

interface Team {
    _id: string;
    name: string;
    members: string[];
    invite_code: string;
    projects: string[];
}

const TeamsPage = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    const [newTeamName, setNewTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teams`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch teams');
            setTeams(data.teams || []);
        } catch (error: any) {
            console.error('Failed to fetch teams', error);
            toast.error(error.message || 'Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teams`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newTeamName })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create team');
            toast.success('Team created successfully');
            setShowCreateModal(false);
            setNewTeamName('');
            fetchTeams();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create team');
        }
    };

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/teams/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ invite_code: joinCode })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to join team');
            toast.success('Joined team successfully');
            setShowJoinModal(false);
            setJoinCode('');
            fetchTeams();
        } catch (error: any) {
            toast.error(error.message || 'Failed to join team');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>My Teams</h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: '4px' }}>Collaborate with your team members on projects and meetings</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowJoinModal(true)} className="btn btn-secondary">
                        <UserPlus size={18} style={{ marginRight: '8px' }} /> Join Team
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                        <Plus size={18} style={{ marginRight: '8px' }} /> Create Team
                    </button>
                </div>
            </div>

            {teams.length === 0 ? (
                <div className="dashboard-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Users size={32} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px' }}>No teams yet</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Create a team to start collaborating or join an existing one using an invite code.
                    </p>
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">Get Started</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {teams.map((team) => (
                        <Link
                            key={team._id}
                            to={`/dashboard/teams/${team._id}`}
                            className="dashboard-card"
                            style={{ padding: '24px', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(255,107,74,0.2) 0%, rgba(168,85,247,0.2) 100%)', borderRadius: '12px' }}>
                                    <Users style={{ color: 'var(--color-primary)' }} size={24} />
                                </div>
                                <span style={{ padding: '4px 12px', fontSize: '12px', fontWeight: '500', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: 'rgba(255,255,255,0.7)' }}>
                                    {team.members.length} Members
                                </span>
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px', color: 'white' }}>{team.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex' }}>
                                    {[...Array(Math.min(3, team.members.length))].map((_, i) => (
                                        <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid var(--color-bg-base)', marginLeft: i > 0 ? '-8px' : '0' }} />
                                    ))}
                                    {team.members.length > 3 && (
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px solid var(--color-bg-base)', marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                                            +{team.members.length - 3}
                                        </div>
                                    )}
                                </div>
                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View <ArrowRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div className="dashboard-card" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: '0 0 24px' }}>Create New Team</h2>
                        <form onSubmit={handleCreateTeam}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Team Name</label>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="e.g. Engineering, Marketing"
                                    className="glass-input"
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Team</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Modal */}
            {showJoinModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div className="dashboard-card" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: '0 0 24px' }}>Join a Team</h2>
                        <form onSubmit={handleJoinTeam}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Invite Code</label>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Enter 9-character code"
                                    className="glass-input"
                                    style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
                                    maxLength={9}
                                    required
                                />
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>Ask your team admin for the invite code.</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Join Team</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;
