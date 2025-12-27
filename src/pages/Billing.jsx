import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { useSound } from '../context/SoundContext';
import { ShoppingCart, Delete, CreditCard, Trash2, Printer } from 'lucide-react';
import logo from '../assets/logo.png';

const Billing = () => {
    const {
        inventory,
        addTransaction,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty: updateQuantity, // Alias to match local usage
        clearCart
    } = useAppContext();
    const { playSound } = useSound();

    // Local state for UI only
    const [barcodeInput, setBarcodeInput] = useState('');
    const [customerName, setCustomerName] = useState('');

    const inputRef = useRef(null);

    // Auto-focus barcode input
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [cart]);

    const handleScan = (e) => {
        e.preventDefault();
        if (!barcodeInput) return;

        const item = inventory.find(i => i.barcode === barcodeInput || i.name.toLowerCase() === barcodeInput.toLowerCase());

        if (item) {
            if (item.stock <= 0) {
                playSound('error');
                alert(`Calculated stock for ${item.name} is 0!`);
                setBarcodeInput('');
                return;
            }

            const existingInCart = cart.find(c => c.id === item.id);
            if (existingInCart && existingInCart.quantity >= item.stock) {
                playSound('error');
                alert(`Cannot add more. Stock limit for ${item.name} reached!`);
                setBarcodeInput('');
                return;
            }

            playSound('scan');
            addToCart(item);
        } else {
            playSound('error');
            // alert('Item not found!'); 
        }
        setBarcodeInput('');
    };

    // calculateTotals remains same
    // handleCheckout needs update to use clearCart

    const calculateTotals = () => {
        const totalMRP = cart.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
        const totalDiscount = cart.reduce((acc, item) => {
            const discountAmount = item.mrp * (item.discount / 100);
            return acc + (discountAmount * item.quantity);
        }, 0);

        const totalTax = cart.reduce((acc, item) => {
            const price = item.mrp - (item.mrp * item.discount / 100);
            const tax = price * ((item.gst || 0) / 100);
            return acc + (tax * item.quantity);
        }, 0);

        const grandTotal = (totalMRP - totalDiscount) + totalTax;
        return { totalMRP, totalDiscount, totalTax, grandTotal };
    };

    const { totalMRP, totalDiscount, totalTax, grandTotal } = calculateTotals();

    const handleCheckout = () => {
        if (cart.length === 0) return;

        if (window.confirm(`Confirm Transaction for ₹${grandTotal.toFixed(2)}?`)) {
            const transactionId = Date.now();
            addTransaction({
                id: transactionId,
                items: cart,
                total: grandTotal,
                customerName: customerName || 'Walk-in',
                totalDiscount,
                totalMRP,
                totalTax
            });
            playSound('success');

            // But wait! React state updates might not flush before print()?
            // window.print() blocks.
            // So:
            // 1. Play sound.
            // 2. window.print() (User sees the filled cart in Print View).
            // 3. Then clear cart.

            setTimeout(() => {
                window.print();
                // Clear cart AFTER print dialog closes (code resumes here)
                clearCart();
                setCustomerName('');
                alert('Transaction Successful!');
            }, 500);
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '1rem', display: 'flex', gap: '2rem', height: 'calc(100vh - 100px)' }}>
            {/* Left: Scanner & Cart */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Billing & POS</h1>

                {/* Scanner */}
                <form onSubmit={handleScan} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Scan Barcode or Type Product Name..."
                        className="input-field"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        style={{ fontSize: '1.2rem' }}
                        autoFocus
                    />
                    <button type="submit" className="btn-primary">Add Item</button>
                </form>

                {/* Cart Table */}
                <div className="glass-panel" style={{ flex: 1, overflow: 'auto', padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Item</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                                <th style={{ padding: '1rem' }}>Qty</th>
                                <th style={{ padding: '1rem' }}>Total</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => {
                                const price = item.mrp - (item.mrp * item.discount / 100);
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.barcode}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹{item.mrp}</div>
                                            <div style={{ color: 'var(--success)' }}>₹{price.toFixed(2)}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newQty = parseInt(e.target.value);
                                                    if (newQty < 1) return;
                                                    const stockItem = inventory.find(i => i.id === item.id);
                                                    if (stockItem && newQty > stockItem.stock) {
                                                        playSound('error');
                                                        return;
                                                    }
                                                    updateQuantity(item.id, newQty);
                                                }}
                                                className="input-field"
                                                style={{ width: '60px', padding: '4px 8px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>₹{(price * item.quantity).toFixed(2)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button onClick={() => { playSound('delete'); removeFromCart(item.id); }} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {cart.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>Cart is Empty. Scan an item to begin.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Totals & Checkout */}
            <div className="glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
                <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>Subtotal (MRP)</span>
                        <span>₹{totalMRP.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                        <span>Total Discount</span>
                        <span>- ₹{totalDiscount.toFixed(2)}</span>
                    </div>
                    <div style={{ margin: '1rem 0', borderTop: '2px dashed rgba(255,255,255,0.1)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        <span>Grand Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Customer Name (Optional)"
                    className="input-field"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn-primary"
                        style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
                        onClick={() => window.print()}
                    >
                        <Printer size={20} /> Print
                    </button>
                    <button
                        className="btn-primary"
                        disabled={cart.length === 0}
                        onClick={handleCheckout}
                        style={{ opacity: cart.length === 0 ? 0.5 : 1, display: 'flex', justifyContent: 'center', gap: '8px' }}
                    >
                        <CreditCard size={20} /> Checkout
                    </button>
                </div>
            </div>




            {/* Printable Invoice (Portal to Body) */}
            {createPortal(
                <div id="printable-invoice" style={{ display: 'none' }}>
                    {/* Watermark */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        opacity: '0.05',
                        zIndex: '0',
                        pointerEvents: 'none',
                    }}>
                        <img src={logo} alt="" style={{ width: '100%', height: 'auto', filter: 'grayscale(100%)' }} />
                    </div>

                    <div style={{ position: 'relative', zIndex: '1', padding: '10px' }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
                            <img src={logo} alt="Logo" style={{ height: '50px', width: 'auto', marginBottom: '5px' }} />
                            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>Ardh Sainik Canteen</h1>
                            <h2 style={{ fontSize: '14px', margin: '2px 0 0 0', fontWeight: '600' }}>JAJAULI</h2>
                            <p style={{ margin: '2px 0', fontSize: '10px' }}>Jajauli, City. Madhuban, Dist. Mau, Uttar Pradesh, (221603)</p>
                            <p style={{ margin: '2px 0', fontSize: '10px' }}>GSTIN: <b>09ABCDE1234F1Z5</b></p>
                            <p style={{ margin: '2px 0', fontSize: '10px' }}>Ph: +91 9452705061</p>
                        </div>

                        {/* Customer Info */}
                        <div style={{ marginBottom: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Bill To: <b>{customerName || 'Walk-in'}</b></span>
                                <span>Date: {new Date().toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Inv No: #{Date.now().toString().slice(-6)}</span>
                                <span>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 30px 40px', borderBottom: '1px solid black', fontWeight: 'bold', fontSize: '10px', paddingBottom: '2px', marginBottom: '5px' }}>
                                <div>Qty</div>
                                <div>Item</div>
                                <div style={{ textAlign: 'right' }}>Tax</div>
                                <div style={{ textAlign: 'right' }}>Total</div>
                            </div>

                            {cart.map((item) => {
                                const basePrice = item.mrp - (item.mrp * item.discount / 100);
                                const tax = basePrice * ((item.gst || 0) / 100);
                                const total = (basePrice + tax) * item.quantity;
                                return (
                                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 30px 40px', fontSize: '10px', marginBottom: '4px' }}>
                                        <div>{item.quantity}</div>
                                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: '5px' }}>{item.name}</div>
                                        <div style={{ textAlign: 'right' }}>{item.gst || 0}%</div>
                                        <div style={{ textAlign: 'right' }}>{total.toFixed(0)}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Totals */}
                        <div style={{ borderTop: '1px solid black', paddingTop: '5px', fontSize: '11px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Total Qty:</span>
                                <span>{cart.reduce((a, c) => a + c.quantity, 0)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Net Amt:</span>
                                <span>{(grandTotal - totalTax).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Total GST:</span>
                                <span>{totalTax.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '5px', borderTop: '1px dashed black', paddingTop: '5px' }}>
                                <span>Grand Total:</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px' }}>
                            <p style={{ margin: '2px 0' }}>Thank you for shopping!</p>
                            <p style={{ margin: '0', fontWeight: 'bold' }}>Ardh Sainik Canteen</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div >
    );
};

export default Billing;
