import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Plus,
    Loader2,
    Search,
    Trash2,
    Clock,
    CheckCircle,
    Edit3,
    Filter
} from 'lucide-react';
import GlassModal from '../components/GlassModal';

interface Contract {
    _id: string;
    title: string;
    contract_type: string;
    status: string;
    created_at: string;
}

const API_URL = 'http://localhost:5000/api';

const statusColors: Record<string, string> = {
    DRAFTED: '#3b82f6',
    EDITED: '#f59e0b',
    REVIEW: '#8b5cf6',
    APPROVED: '#10b981',
    FINALIZED: '#22c55e',
    SIGNED: '#059669'
};

const typeLabels: Record<string, string> = {
    NDA: 'Non-Disclosure Agreement',
    SERVICE_AGREEMENT: 'Service Agreement',
    EMPLOYMENT: 'Employment Contract',
    PARTNERSHIP: 'Partnership Agreement',
    GENERAL: 'General Contract',
    CUSTOM: 'Custom Contract'
};

export default function ContractsPage() {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/contracts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setContracts(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this contract?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/contracts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setContracts(contracts.filter(c => c._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const filtered = contracts.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
        const matchesType = typeFilter === 'ALL' || c.contract_type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

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
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>Contracts</h1>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: 0, marginTop: '4px' }}>
                        AI-generated legal documents from your meetings
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search contracts..."
                        className="glass-input"
                        style={{ paddingLeft: '42px' }}
                    />
                </div>
                <button
                    className={`btn ${showFilters || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ height: '42px', padding: '0 24px' }} // mismatched height with search input (glass-input usually 42-48px depending on CSS)
                    // glass-input has default height? In MeetingsPage I forced 48px. Let's force 42px here to match typical inputs or check CSS.
                    // Actually let's assume standard button height.
                    onClick={() => setShowFilters(true)}
                >
                    <Filter size={18} />
                    Filters
                    {(statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
                        <span style={{
                            marginLeft: '8px',
                            background: 'rgba(255,255,255,0.2)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}>!</span>
                    )}
                </button>
            </div>

            {/* Contracts Grid */}
            {filtered.length === 0 ? (
                <div className="dashboard-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <FileText size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
                        {search || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'No contracts found' : 'No contracts yet'}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                        {search || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? 'Try adjusting filters' : 'Upload a meeting with business negotiations to generate contracts'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {filtered.map(contract => (
                        <div
                            key={contract._id}
                            onClick={() => navigate(`/dashboard/contracts/${contract._id}`)}
                            className="dashboard-card"
                            style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={20} style={{ color: '#fbbf24' }} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>{contract.title}</h3>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                                            {typeLabels[contract.contract_type] || contract.contract_type}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(contract._id, e)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{
                                    fontSize: '11px',
                                    color: statusColors[contract.status],
                                    background: `${statusColors[contract.status]}20`,
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {contract.status === 'FINALIZED' || contract.status === 'SIGNED' ? (
                                        <CheckCircle size={12} />
                                    ) : (
                                        <Edit3 size={12} />
                                    )}
                                    {contract.status}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} />
                                    {new Date(contract.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <GlassModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                title="Filter Contracts"
                footer={
                    <>
                        <button
                            className="btn btn-ghost"
                            onClick={() => {
                                setStatusFilter('ALL');
                                setTypeFilter('ALL');
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
                            {['ALL', ...Object.keys(statusColors)].map(status => (
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
                            Contract Type
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {['ALL', ...Object.keys(typeLabels)].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`btn ${typeFilter === type ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '13px' }}
                                >
                                    {type === 'ALL' ? 'All Types' : typeLabels[type]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </GlassModal>
        </div>
    );
}
