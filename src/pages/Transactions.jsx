import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSound } from '../context/SoundContext';
import { Search, ChevronDown, ChevronUp, RotateCcw, AlertCircle, Trash2 } from 'lucide-react';

const Transactions = () => {
    const { transactions, processReturn, deleteTransaction } = useAppContext();
    const { playSound } = useSound();

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // Return Modal State
    const [returnModal, setReturnModal] = useState({ open: false, transactionId: null, item: null });
    const [returnQty, setReturnQty] = useState(1);

    const filteredTransactions = transactions.filter(t =>
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.date.includes(searchTerm) ||
        t.id.toString().includes(searchTerm)
    ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

    const toggleExpand = (id) => {
        if (expandedId === id) setExpandedId(null);
        else {
            playSound('click');
            setExpandedId(id);
        }
    };

    const initiateReturn = (transactionId, item) => {
        playSound('click');
        setReturnModal({ open: true, transactionId, item });
        setReturnQty(1);
    };

    const confirmReturn = (e) => {
        e.preventDefault();
        const success = processReturn(returnModal.transactionId, returnModal.item.id, parseInt(returnQty));
        if (success) {
            playSound('success');
            setReturnModal({ open: false, transactionId: null, item: null });
        } else {
            playSound('error');
            alert('Invalid Return Quantity');
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '1rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Transaction History</h1>

            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search size={20} color="var(--text-muted)" />
                <input
                    type="text"
                    placeholder="Search by ID, Date or Customer Name..."
                    className="input-field"
                    style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Transaction ID</th>
                            <th style={{ padding: '1rem' }}>Customer</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Items</th>
                            <th style={{ padding: '1rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(t => (
                            <React.Fragment key={t.id}>
                                <tr
                                    onClick={() => toggleExpand(t.id)}
                                    style={{
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        background: expandedId === t.id ? 'rgba(255,255,255,0.02)' : 'transparent'
                                    }}
                                >
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleString()}</td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{t.id}</td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{t.customerName}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>₹{t.total.toFixed(2)}</td>
                                    <td style={{ padding: '1rem' }}>{t.items.length} items</td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '10px' }}>
                                        <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4em 0.8em', background: 'rgba(255,255,255,0.1)' }}>
                                            {expandedId === t.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        <button
                                            className="btn-primary"
                                            style={{ fontSize: '0.8rem', padding: '0.4em 0.8em', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Delete this transaction permanently?')) {
                                                    deleteTransaction(t.id);
                                                    playSound('delete');
                                                }
                                            }}
                                            title="Delete Transaction"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                                {expandedId === t.id && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '0 2rem 2rem 2rem', background: 'rgba(0,0,0,0.1)' }}>
                                            <div style={{ marginTop: '1rem' }}>
                                                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <AlertCircle size={16} color="var(--accent)" /> Transaction Details
                                                </h4>
                                                <table style={{ width: '100%', fontSize: '0.9rem' }}>
                                                    <thead>
                                                        <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                            <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Item</th>
                                                            <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Qty Sold</th>
                                                            <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Returned</th>
                                                            <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Price/Unit</th>
                                                            <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {t.items.map(item => (
                                                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <td style={{ padding: '0.8rem 0' }}>{item.name}</td>
                                                                <td style={{ padding: '0.8rem 0' }}>{item.quantity}</td>
                                                                <td style={{ padding: '0.8rem 0', color: item.returnedQty > 0 ? 'var(--warning)' : 'inherit' }}>
                                                                    {item.returnedQty || 0}
                                                                </td>
                                                                <td style={{ padding: '0.8rem 0' }}>₹{(item.mrp - (item.mrp * item.discount / 100)).toFixed(2)}</td>
                                                                <td style={{ padding: '0.8rem 0' }}>
                                                                    {item.returnedQty < item.quantity ? (
                                                                        <button
                                                                            className="btn-primary"
                                                                            style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', boxShadow: 'none' }}
                                                                            onClick={(e) => { e.stopPropagation(); initiateReturn(t.id, item); }}
                                                                        >
                                                                            Return
                                                                        </button>
                                                                    ) : (
                                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Fully Returned</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Return Modal */}
            {returnModal.open && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <form
                        onSubmit={confirmReturn}
                        className="glass-panel animate-fade-in"
                        style={{ width: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                        <h2 style={{ fontSize: '1.5rem' }}>Return Item</h2>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Product</p>
                            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{returnModal.item.name}</p>
                        </div>

                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Quantity to Return (Max: {returnModal.item.quantity - (returnModal.item.returnedQty || 0)})
                            </p>
                            <input
                                type="number"
                                min="1"
                                max={returnModal.item.quantity - (returnModal.item.returnedQty || 0)}
                                className="input-field"
                                value={returnQty}
                                onChange={(e) => setReturnQty(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setReturnModal({ open: false, transactionId: null, item: null })} className="btn-primary" style={{ background: 'transparent', flex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <RotateCcw size={18} /> Confirm Return
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Transactions;
