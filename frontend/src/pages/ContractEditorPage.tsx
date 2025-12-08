import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { useReactToPrint } from 'react-to-print';
import {
    ArrowLeft,
    Save,
    FileText,
    Printer,
    History,
    CheckCircle,
    Loader2,
    Clock,
    Edit3
} from 'lucide-react';

interface Contract {
    _id: string;
    title: string;
    contract_type: string;
    status: string;
    draft_text: string;
    final_text?: string;
    parties: { name: string; role: string }[];
    created_at: string;
    updated_at: string;
}

interface Revision {
    version: number;
    content: string;
    changed_by: string;
    changed_at: string;
    notes: string;
}

const API_URL = 'http://localhost:5000/api';

export default function ContractEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const printRef = useRef<HTMLDivElement>(null);

    const [contract, setContract] = useState<Contract | null>(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchContract();
    }, [id]);

    const fetchContract = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/contracts/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setContract(data.contract);
                setContent(data.contract.draft_text || '');
            }
        } catch (error) {
            console.error('Failed to fetch contract:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRevisions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/contracts/${id}/revisions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setRevisions(data.revisions || []);
                setShowHistory(true);
            }
        } catch (error) {
            console.error('Failed to fetch revisions:', error);
        }
    };

    const handleSave = async () => {
        if (!hasChanges) return;
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/contracts/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ draft_text: content })
            });

            if (res.ok) {
                setHasChanges(false);
                const data = await res.json();
                setContract(prev => prev ? { ...prev, draft_text: content, status: data.contract.status } : null);
            }
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleFinalize = async () => {
        if (!confirm('Are you sure you want to finalize this contract? It cannot be edited after finalization.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/contracts/${id}/finalize`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchContract();
            }
        } catch (error) {
            console.error('Failed to finalize:', error);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: contract?.title || 'Contract'
    });

    const handleContentChange = (value: string | undefined) => {
        setContent(value || '');
        setHasChanges(true);
    };

    const statusColors: Record<string, string> = {
        DRAFTED: '#3b82f6',
        EDITED: '#f59e0b',
        REVIEW: '#8b5cf6',
        APPROVED: '#10b981',
        FINALIZED: '#22c55e',
        SIGNED: '#059669'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#d97706' }} />
            </div>
        );
    }

    if (!contract) {
        return (
            <div style={{ padding: '32px 40px' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Contract not found</p>
            </div>
        );
    }

    const isFinalized = contract.status === 'FINALIZED' || contract.status === 'SIGNED';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/dashboard/contracts')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>{contract.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '12px', color: statusColors[contract.status], background: `${statusColors[contract.status]}20`, padding: '2px 8px', borderRadius: '4px' }}>
                                {contract.status}
                            </span>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{contract.contract_type}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={fetchRevisions} className="btn-secondary" style={{ width: 'auto', padding: '8px 12px' }}>
                        <History size={16} />
                    </button>
                    <button onClick={() => handlePrint()} className="btn-secondary" style={{ width: 'auto', padding: '8px 12px' }}>
                        <Printer size={16} />
                    </button>
                    {!isFinalized && (
                        <>
                            <button onClick={handleSave} disabled={!hasChanges || saving} className="btn-secondary" style={{ width: 'auto', padding: '8px 16px', opacity: hasChanges ? 1 : 0.5 }}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                <span style={{ marginLeft: '6px' }}>{saving ? 'Saving...' : 'Save'}</span>
                            </button>
                            <button onClick={handleFinalize} className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
                                <CheckCircle size={16} style={{ marginRight: '6px' }} /> Finalize
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Editor */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflow: 'auto' }} data-color-mode="dark">
                    {isFinalized ? (
                        <div ref={printRef} style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                            <MDEditor.Markdown source={content} style={{ background: 'transparent' }} />
                        </div>
                    ) : (
                        <MDEditor
                            value={content}
                            onChange={handleContentChange}
                            height="100%"
                            preview="live"
                            style={{ background: 'transparent' }}
                        />
                    )}
                </div>

                {/* History Sidebar */}
                {showHistory && (
                    <div style={{ width: '300px', borderLeft: '1px solid rgba(255,255,255,0.1)', overflow: 'auto', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: 0 }}>Version History</h3>
                            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>×</button>
                        </div>
                        {revisions.map((rev, i) => (
                            <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#fbbf24' }}>v{rev.version}</span>
                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{rev.changed_by}</span>
                                </div>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{rev.notes}</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
                                    <Clock size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                    {new Date(rev.changed_at).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Hidden print content - formatted nicely */}
            <div style={{ display: 'none' }}>
                <div ref={printRef} style={{ padding: '40px', fontFamily: 'Georgia, serif', color: '#000', background: '#fff' }}>
                    <MDEditor.Markdown source={content} />
                </div>
            </div>
        </div>
    );
}
