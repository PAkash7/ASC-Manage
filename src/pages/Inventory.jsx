import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSound } from '../context/SoundContext';
import { Plus, Trash2, Edit, Search, Save, X } from 'lucide-react';

const Inventory = () => {
    const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useAppContext();
    const { playSound } = useSound();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        mrp: '',
        discount: '',
        cost: '',
        stock: '',
        gst: ''
    });

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculatePrice = (mrp, discount) => {
        if (!mrp) return 0;
        const d = discount || 0;
        return mrp - (mrp * d / 100);
    };

    const handleOpenModal = (item = null) => {
        playSound('click');
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({ name: '', barcode: '', mrp: '', discount: '', cost: '', stock: '', gst: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const itemData = {
            ...formData,
            mrp: Number(formData.mrp),
            discount: Number(formData.discount),
            gst: Number(formData.gst || 0),
            cost: Number(formData.cost),
            stock: Number(formData.stock)
        };

        if (editingItem) {
            updateInventoryItem(editingItem.id, itemData);
        } else {
            addInventoryItem(itemData);
        }

        playSound('success');
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            playSound('delete');
            deleteInventoryItem(id);
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Inventory Management</h1>
                <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> Add New Item
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search size={20} color="var(--text-muted)" />
                <input
                    type="text"
                    placeholder="Search by Product Name or Barcode..."
                    className="input-field"
                    style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Product Name</th>
                            <th style={{ padding: '1rem' }}>Barcode</th>
                            <th style={{ padding: '1rem' }}>MRP</th>
                            <th style={{ padding: '1rem' }}>GST %</th>
                            <th style={{ padding: '1rem' }}>Final Price</th>
                            <th style={{ padding: '1rem' }}>Stock</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.map(item => (
                            <tr key={item.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{item.name}</td>
                                <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{item.barcode}</td>
                                <td style={{ padding: '1rem' }}>₹{item.mrp}</td>
                                <td style={{ padding: '1rem' }}>{item.gst || 0}%</td>
                                <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: 600 }}>
                                    ₹{(() => {
                                        const price = calculatePrice(item.mrp, item.discount);
                                        const tax = price * ((item.gst || 0) / 100);
                                        return (price + tax).toFixed(2);
                                    })()}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: item.stock < 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                        color: item.stock < 10 ? 'var(--error)' : 'var(--success)'
                                    }}>
                                        {item.stock}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredInventory.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No items found.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <form
                        onSubmit={handleSubmit}
                        className="glass-panel animate-fade-in"
                        style={{ width: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>{editingItem ? 'Edit Item' : 'Add Inventory'}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <input required placeholder="Product Name" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <input required placeholder="Barcode / Scan Here" className="input-field" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input required type="number" placeholder="MRP" className="input-field" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} />
                            <input type="number" placeholder="Discount %" className="input-field" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input required type="number" placeholder="Cost Price" className="input-field" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                            <input required type="number" placeholder="Stock Quantity" className="input-field" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input type="number" placeholder="GST %" className="input-field" value={formData.gst || ''} onChange={e => setFormData({ ...formData, gst: e.target.value })} />
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Final Selling Price (Inc. Tax):</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                ₹{(() => {
                                    const price = calculatePrice(Number(formData.mrp), Number(formData.discount));
                                    const tax = price * (Number(formData.gst || 0) / 100);
                                    return (price + tax).toFixed(2);
                                })()}
                            </p>
                        </div>

                        <button type="button" onClick={() => playSound('scan')} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary)', boxShadow: 'none' }}>
                            🔊 Test Scan Sound
                        </button>
                        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                            <Save size={18} style={{ marginRight: '8px' }} /> Save Production
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Inventory;
