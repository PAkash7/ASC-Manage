import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within a AppProvider');
    }
    return context;
};

// Mock Initial Data
const INITIAL_INVENTORY = [
    { id: 1, name: 'Premium Wireless Headset', barcode: 'WH-001', mrp: 2999, discount: 10, cost: 1500, stock: 45 },
    { id: 2, name: 'Mechanical Keyboard RGB', barcode: 'MK-RGB', mrp: 4500, discount: 15, cost: 2800, stock: 20 },
    { id: 3, name: 'Gaming Mouse', barcode: 'GM-PRO', mrp: 1200, discount: 5, cost: 600, stock: 80 },
];

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { name: 'Admin', role: 'admin' }
    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('inventory');
        return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    });
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : [];
    });
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const login = (username, password) => {
        // Mock Login
        if (username && password) {
            setUser({ name: username, role: 'admin' });
            return true;
        }
        return false;
    };

    const logout = () => setUser(null);

    const addInventoryItem = (item) => {
        setInventory(prev => [...prev, { ...item, id: Date.now() }]);
    };

    const updateInventoryItem = (id, updates) => {
        setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const deleteInventoryItem = (id) => {
        setInventory(prev => prev.filter(item => item.id !== id));
    };

    const addTransaction = (transaction) => {
        // Each item in transaction gets a 'returnedQty: 0' field initially
        const itemsWithReturnState = transaction.items.map(item => ({ ...item, returnedQty: 0 }));

        setTransactions(prev => [...prev, {
            ...transaction,
            items: itemsWithReturnState,
            id: Date.now(),
            date: new Date().toISOString()
        }]);

        // Update stock
        const soldItems = transaction.items;
        setInventory(prev => prev.map(item => {
            const sold = soldItems.find(s => s.barcode === item.barcode);
            if (sold) {
                return { ...item, stock: item.stock - sold.quantity };
            }
            return item;
        }));
    };

    const processReturn = (transactionId, itemId, returnQty) => {
        // 1. Find transaction and item
        const transactionIndex = transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex === -1) return false;

        const transaction = transactions[transactionIndex];
        const itemIndex = transaction.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return false;

        const item = transaction.items[itemIndex];

        // Validate return qty
        if (returnQty <= 0 || (item.returnedQty + returnQty) > item.quantity) {
            return false; // Invalid return amount
        }

        // 2. Update Transaction State
        const updatedItems = [...transaction.items];
        updatedItems[itemIndex] = {
            ...item,
            returnedQty: item.returnedQty + returnQty
        };

        const updatedTransaction = { ...transaction, items: updatedItems };

        // Check if ALL items are fully returned
        const allReturned = updatedTransaction.items.every(
            i => (i.returnedQty || 0) >= i.quantity
        );

        setTransactions(prev => {
            if (allReturned) {
                return prev.filter(t => t.id !== transactionId);
            } else {
                const newTx = [...prev];
                newTx[transactionIndex] = updatedTransaction;
                return newTx;
            }
        });

        // 3. Restore Stock in Inventory
        setInventory(prev => prev.map(invItem => {
            if (invItem.barcode === item.barcode) {
                return { ...invItem, stock: invItem.stock + returnQty };
            }
            return invItem;
        }));

        return true;
    };

    const deleteTransaction = (transactionId) => {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateCartQty = (id, newQty) => {
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    };

    const clearCart = () => setCart([]);

    const value = {
        user,
        inventory,
        transactions,
        login,
        logout,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addTransaction,
        processReturn,
        deleteTransaction,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart
    };
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
