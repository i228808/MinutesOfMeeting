import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    FileAudio,
    FileText as FileTextIcon,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Trash2,
    Save,
    ArrowLeft,
    Plus
} from 'lucide-react';

type UploadMode = 'audio' | 'text';
type UploadStatus = 'idle' | 'analyzing' | 'review' | 'saving' | 'success' | 'error';

interface Actor { name: string; }
interface Responsibility { actor: string; task: string; priority: string; }
interface Deadline { task: string; actor: string; deadline: string; }
interface Decision { decision: string; made_by: string; }

interface AnalysisData {
    summary: string;
    actors: Actor[];
    responsibilities: Responsibility[];
    deadlines: Deadline[];
    key_decisions: Decision[];
}

const API_URL = 'http://localhost:5000/api';

export default function UploadPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<UploadMode>('text');
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [textTranscript, setTextTranscript] = useState('');
    const [progress, setProgress] = useState('');

    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
    };

    const handleAnalyze = async () => {
        if (!title.trim()) { setError('Please enter a title'); return; }
        if (mode === 'text' && !textTranscript.trim()) { setError('Please enter the transcript text'); return; }
        if (mode === 'audio' && !selectedFile) { setError('Please select an audio file'); return; }

        setError('');
        setStatus('analyzing');
        setProgress(mode === 'audio' ? 'Transcribing audio...' : 'Analyzing with AI...');

        try {
            const token = localStorage.getItem('token');
            let res;

            if (mode === 'audio' && selectedFile) {
                // Send audio file as FormData
                const formData = new FormData();
                formData.append('title', title.trim());
                formData.append('audio', selectedFile);

                res = await fetch(`${API_URL}/meetings/analyze`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            } else {
                // Send text transcript as JSON
                res = await fetch(`${API_URL}/meetings/analyze`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: title.trim(), transcript: textTranscript.trim() })
                });
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Analysis failed');

            setEditingTitle(data.title);
            setTextTranscript(data.transcript); // Store transcribed text for confirmation
            setAnalysis(data.analysis);
            setStatus('review');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
            setStatus('error');
        }
    };

    const handleConfirm = async () => {
        if (!analysis) return;
        setStatus('saving');
        setProgress('Saving meeting...');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/meetings/confirm`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editingTitle,
                    transcript: textTranscript.trim(),
                    summary: analysis.summary,
                    actors: analysis.actors,
                    responsibilities: analysis.responsibilities,
                    deadlines: analysis.deadlines,
                    key_decisions: analysis.key_decisions
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Save failed');

            setStatus('success');
            setTimeout(() => navigate(`/dashboard/meetings/${data.meeting.id}`), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
            setStatus('error');
        }
    };

    // Update handlers
    const updateResponsibility = (index: number, field: keyof Responsibility, value: string) => {
        if (!analysis) return;
        const updated = [...analysis.responsibilities];
        updated[index] = { ...updated[index], [field]: value };
        setAnalysis({ ...analysis, responsibilities: updated });
    };

    const updateDeadline = (index: number, field: keyof Deadline, value: string) => {
        if (!analysis) return;
        const updated = [...analysis.deadlines];
        updated[index] = { ...updated[index], [field]: value };
        setAnalysis({ ...analysis, deadlines: updated });
    };

    const updateDecision = (index: number, field: keyof Decision, value: string) => {
        if (!analysis) return;
        const updated = [...analysis.key_decisions];
        updated[index] = { ...updated[index], [field]: value };
        setAnalysis({ ...analysis, key_decisions: updated });
    };

    const addResponsibility = () => {
        if (!analysis) return;
        setAnalysis({ ...analysis, responsibilities: [...analysis.responsibilities, { actor: '', task: '', priority: 'medium' }] });
    };

    const addDeadline = () => {
        if (!analysis) return;
        setAnalysis({ ...analysis, deadlines: [...analysis.deadlines, { task: '', actor: '', deadline: '' }] });
    };

    const addDecision = () => {
        if (!analysis) return;
        setAnalysis({ ...analysis, key_decisions: [...analysis.key_decisions, { decision: '', made_by: '' }] });
    };

    const removeItem = (type: 'responsibilities' | 'deadlines' | 'key_decisions', index: number) => {
        if (!analysis) return;
        const updated = [...analysis[type]];
        updated.splice(index, 1);
        setAnalysis({ ...analysis, [type]: updated });
    };

    const sampleTranscript = `Meeting: Weekly Team Standup
Date: December 8, 2024
Participants: John (Project Manager), Sarah (Developer), Mike (Designer)

John: Good morning everyone, let's go through our updates. Sarah, can you start?

Sarah: Sure! I finished the authentication module yesterday. I'll be starting on the dashboard API today.

John: Great progress! What's the timeline for the dashboard?

Sarah: I should have the basic endpoints ready by Wednesday. The complex reporting features will take until Friday.

John: Perfect. Mike, how's the design work going?

Mike: I've completed the mockups for the dashboard. I need Sarah to review them so I can finalize the colors.

John: Sarah, can you review Mike's designs today?

Sarah: Yes, I'll do it right after lunch.

John: Great. I also want to remind everyone that we have the client demo next Monday. We need everything ready by Friday EOD.

Mike: Should I prepare the presentation slides?

John: Yes please, we need those by Thursday so we can review them together on Friday morning.

John: Excellent. Any blockers?

Mike: I'm waiting for the brand colors from the client.

John: I'll call them today and get that sorted. Good work everyone!`;

    // Review Step UI
    if (status === 'review' && analysis) {
        const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px', width: '100%' };
        const smallInputStyle = { ...inputStyle, width: '120px', flexShrink: 0 };

        return (
            <div style={{ padding: '32px 40px', maxWidth: '1000px' }} className="animate-fadeIn">
                <button onClick={() => { setStatus('idle'); setAnalysis(null); }} style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' }}>
                    <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to upload
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>Review & Edit Analysis</h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: '4px' }}>Edit the extracted information before saving</p>
                </div>

                {/* Title & Summary */}
                <div className="dashboard-card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Meeting Title</label>
                    <input type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} style={inputStyle} />
                    <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '16px 0 6px' }}>Summary</label>
                    <textarea value={analysis.summary} onChange={(e) => setAnalysis({ ...analysis, summary: e.target.value })} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                </div>

                {/* Participants */}
                <div className="dashboard-card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: '0 0 12px' }}>Participants ({analysis.actors.length})</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {analysis.actors.map((a, i) => <span key={i} className="badge badge-info">{a.name}</span>)}
                    </div>
                </div>

                {/* Action Items */}
                <div className="dashboard-card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0 }}>Action Items ({analysis.responsibilities.length})</h3>
                        <button onClick={addResponsibility} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '6px', color: '#4ade80', fontSize: '12px', cursor: 'pointer' }}>
                            <Plus size={14} style={{ marginRight: '4px' }} /> Add
                        </button>
                    </div>
                    {analysis.responsibilities.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>No action items. Click Add to create one.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {analysis.responsibilities.map((r, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <input value={r.task} onChange={(e) => updateResponsibility(i, 'task', e.target.value)} placeholder="Task" style={{ ...inputStyle, flex: 1 }} />
                                    <input value={r.actor} onChange={(e) => updateResponsibility(i, 'actor', e.target.value)} placeholder="Assignee" style={smallInputStyle} />
                                    <select value={r.priority} onChange={(e) => updateResponsibility(i, 'priority', e.target.value)} style={{ ...smallInputStyle, width: '100px' }}>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                    <button onClick={() => removeItem('responsibilities', i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Deadlines */}
                <div className="dashboard-card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0 }}>Deadlines ({analysis.deadlines.length})</h3>
                            <p style={{ fontSize: '11px', color: '#fbbf24', margin: '4px 0 0' }}>These will be added to your calendar</p>
                        </div>
                        <button onClick={addDeadline} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', color: '#fbbf24', fontSize: '12px', cursor: 'pointer' }}>
                            <Plus size={14} style={{ marginRight: '4px' }} /> Add
                        </button>
                    </div>
                    {analysis.deadlines.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>No deadlines. Click Add to create one.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {analysis.deadlines.map((d, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }}>
                                    <input value={d.task} onChange={(e) => updateDeadline(i, 'task', e.target.value)} placeholder="Task" style={{ ...inputStyle, flex: 1 }} />
                                    <input value={d.actor} onChange={(e) => updateDeadline(i, 'actor', e.target.value)} placeholder="Assignee" style={smallInputStyle} />
                                    <input type="date" value={d.deadline?.split('T')[0] || ''} onChange={(e) => updateDeadline(i, 'deadline', e.target.value)} style={smallInputStyle} />
                                    <button onClick={() => removeItem('deadlines', i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Key Decisions */}
                <div className="dashboard-card" style={{ padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0 }}>Key Decisions ({analysis.key_decisions.length})</h3>
                        <button onClick={addDecision} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#a78bfa', fontSize: '12px', cursor: 'pointer' }}>
                            <Plus size={14} style={{ marginRight: '4px' }} /> Add
                        </button>
                    </div>
                    {analysis.key_decisions.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>No decisions. Click Add to create one.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {analysis.key_decisions.map((d, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <input value={d.decision} onChange={(e) => updateDecision(i, 'decision', e.target.value)} placeholder="Decision" style={{ ...inputStyle, flex: 1 }} />
                                    <input value={d.made_by} onChange={(e) => updateDecision(i, 'made_by', e.target.value)} placeholder="Made by" style={smallInputStyle} />
                                    <button onClick={() => removeItem('key_decisions', i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={handleConfirm} className="btn-primary" style={{ width: '100%' }}>
                    <Save size={18} style={{ marginRight: '8px' }} /> Confirm & Save Meeting
                </button>
            </div>
        );
    }

    // Loading/Success states
    if (status === 'analyzing' || status === 'saving' || status === 'success') {
        return (
            <div style={{ padding: '32px 40px', maxWidth: '800px' }} className="animate-fadeIn">
                <div className="dashboard-card" style={{ padding: '48px', textAlign: 'center' }}>
                    {status === 'success' ? (
                        <>
                            <CheckCircle size={48} style={{ color: '#4ade80', marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px' }}>Meeting saved!</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Redirecting...</p>
                        </>
                    ) : (
                        <>
                            <div className="animate-spin" style={{ width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#d97706', borderRadius: '50%', margin: '0 auto 20px' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: '0 0 8px' }}>{status === 'analyzing' ? 'Analyzing...' : 'Saving...'}</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{progress}</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Upload Form
    return (
        <div style={{ padding: '32px 40px', maxWidth: '800px' }} className="animate-fadeIn">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>Upload Meeting</h1>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: '4px' }}>Paste a transcript to analyze</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button onClick={() => setMode('text')} className={mode === 'text' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, maxWidth: '200px' }}>
                    <FileTextIcon size={18} style={{ marginRight: '8px' }} /> Text Transcript
                </button>
                <button onClick={() => setMode('audio')} className={mode === 'audio' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, maxWidth: '200px' }}>
                    <FileAudio size={18} style={{ marginRight: '8px' }} /> Audio File
                </button>
            </div>

            {error && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '24px' }}>
                    <AlertCircle size={18} style={{ color: '#f87171', marginRight: '10px' }} />
                    <span style={{ color: '#f87171', fontSize: '14px' }}>{error}</span>
                </div>
            )}

            <div className="dashboard-card" style={{ padding: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>Meeting Title *</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="glass-input" placeholder="e.g., Weekly Team Standup" />
                </div>

                {mode === 'text' && (
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>Transcript *</label>
                            <button type="button" onClick={() => { setTextTranscript(sampleTranscript); if (!title) setTitle('Weekly Team Standup'); }}
                                style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '6px', color: '#fbbf24', fontSize: '12px', cursor: 'pointer' }}>
                                <Sparkles size={14} style={{ marginRight: '6px' }} /> Load Sample
                            </button>
                        </div>
                        <textarea value={textTranscript} onChange={(e) => setTextTranscript(e.target.value)} className="glass-input"
                            placeholder="Paste your meeting transcript here..." style={{ minHeight: '200px', resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }} />
                    </div>
                )}

                {mode === 'audio' && (
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>Audio File *</label>
                        {selectedFile ? (
                            <div style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <FileAudio size={24} style={{ color: '#fbbf24', marginRight: '12px' }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', color: 'white', margin: 0 }}>{selectedFile.name}</p>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                                <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                        ) : (
                            <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                                style={{ padding: '40px', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer' }}>
                                <Upload size={32} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }} />
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Drag & drop or click to upload</p>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                    </div>
                )}

                <button onClick={handleAnalyze} className="btn-primary">
                    <Sparkles size={18} style={{ marginRight: '8px' }} /> Analyze Transcript
                </button>
            </div>

            <div className="dashboard-card" style={{ padding: '20px', marginTop: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: '0 0 12px' }}>Workflow</h4>
                <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {['AI analyzes your transcript', 'You review and edit the extracted data', 'Confirm to save + add deadlines to calendar'].map((step, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: i < 2 ? '8px' : 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                            <span style={{ color: '#4ade80', marginRight: '8px', fontWeight: 'bold' }}>{i + 1}.</span> {step}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
