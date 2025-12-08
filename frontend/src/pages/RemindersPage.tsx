import { useState, useEffect } from 'react';
import {
    Bell,
    Plus,
    Trash2,
    Clock,
    Calendar,
    AlertCircle,
    CheckCircle,
    X,
    Loader2,
    RefreshCw
} from 'lucide-react';

interface Reminder {
    _id: string;
    task: string;
    message: string;
    remind_at: string;
    reminder_type: 'EMAIL' | 'PUSH' | 'BOTH';
    status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
    is_recurring: boolean;
    recurrence_pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
    created_at: string;
}

const API_URL = 'http://localhost:5000/api';

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [task, setTask] = useState('');
    const [message, setMessage] = useState('');
    const [remindAt, setRemindAt] = useState('');
    const [reminderType, setReminderType] = useState<'EMAIL' | 'PUSH' | 'BOTH'>('EMAIL');
    const [isRecurring, setIsRecurring] = useState(false);
    const [pattern, setPattern] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/reminders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReminders(data.data || data.reminders || []);
            }
        } catch (err) {
            console.error('Failed to fetch reminders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!task.trim() || !message.trim() || !remindAt) {
            setError('Please fill in all required fields');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/reminders/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    task: task.trim(),
                    message: message.trim(),
                    remind_at: new Date(remindAt).toISOString(),
                    reminder_type: reminderType,
                    is_recurring: isRecurring,
                    recurrence_pattern: isRecurring ? pattern : null
                })
            });

            if (res.ok) {
                setShowModal(false);
                resetForm();
                fetchReminders();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create reminder');
            }
        } catch (err) {
            setError('Failed to create reminder');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this reminder?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/reminders/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReminders(reminders.filter(r => r._id !== id));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const handleCancel = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/reminders/${id}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchReminders();
        } catch (err) {
            console.error('Failed to cancel:', err);
        }
    };

    const resetForm = () => {
        setTask('');
        setMessage('');
        setRemindAt('');
        setReminderType('EMAIL');
        setIsRecurring(false);
        setPattern('WEEKLY');
        setError('');
    };

    const statusColors: Record<string, { bg: string; text: string }> = {
        PENDING: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
        SENT: { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80' },
        FAILED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
        CANCELLED: { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af' }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#d97706' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 40px' }} className="animate-fadeIn">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>Reminders</h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: '4px' }}>
                        Set reminders for tasks and deadlines
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary" style={{ width: 'auto' }}>
                    <Plus size={18} style={{ marginRight: '8px' }} /> New Reminder
                </button>
            </div>

            {/* Reminders List */}
            {reminders.length === 0 ? (
                <div className="dashboard-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <Bell size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'rgba(255,255,255,0.6)', margin: 0 }}>No reminders</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>Create a reminder to get started</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reminders.map(reminder => (
                        <div key={reminder._id} className="dashboard-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: '500', color: 'white', margin: 0 }}>{reminder.task}</h3>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: statusColors[reminder.status].bg,
                                            color: statusColors[reminder.status].text
                                        }}>
                                            {reminder.status}
                                        </span>
                                        {reminder.is_recurring && (
                                            <span style={{ fontSize: '11px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <RefreshCw size={12} /> {reminder.recurrence_pattern}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 8px' }}>{reminder.message}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> {formatDate(reminder.remind_at)}
                                        </span>
                                        <span>{reminder.reminder_type}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {reminder.status === 'PENDING' && (
                                        <button onClick={() => handleCancel(reminder._id)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '4px' }} title="Cancel">
                                            <X size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(reminder._id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }} title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="dashboard-card" style={{ padding: '24px', width: '450px', maxWidth: '90vw' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 20px' }}>
                            <Bell size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#fbbf24' }} />
                            New Reminder
                        </h3>

                        {error && (
                            <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                                <AlertCircle size={14} style={{ color: '#f87171', marginRight: '8px' }} />
                                <span style={{ fontSize: '13px', color: '#f87171' }}>{error}</span>
                            </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Task *</label>
                            <input type="text" value={task} onChange={(e) => setTask(e.target.value)} className="glass-input" placeholder="e.g., Follow up on proposal" />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Message *</label>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="glass-input" placeholder="Reminder message..." style={{ minHeight: '80px', resize: 'vertical' }} />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Remind At *</label>
                            <input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} className="glass-input" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Type</label>
                                <select value={reminderType} onChange={(e) => setReminderType(e.target.value as any)} className="glass-input">
                                    <option value="EMAIL">Email</option>
                                    <option value="PUSH">Push</option>
                                    <option value="BOTH">Both</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Recurring</label>
                                <select value={isRecurring ? pattern : 'none'} onChange={(e) => {
                                    if (e.target.value === 'none') {
                                        setIsRecurring(false);
                                    } else {
                                        setIsRecurring(true);
                                        setPattern(e.target.value as any);
                                    }
                                }} className="glass-input">
                                    <option value="none">One-time</option>
                                    <option value="DAILY">Daily</option>
                                    <option value="WEEKLY">Weekly</option>
                                    <option value="MONTHLY">Monthly</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary" style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button onClick={handleCreate} className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} style={{ marginRight: '6px' }} /> Create</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
