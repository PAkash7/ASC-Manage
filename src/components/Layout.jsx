import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, FileClock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useSound } from '../context/SoundContext';

const Layout = ({ children }) => {
    const { logout, user } = useAppContext();
    const { playSound } = useSound();
    const navigate = useNavigate();

    const handleLogout = () => {
        playSound('click');
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/inventory', icon: Package, label: 'Inventory' },
        { path: '/billing', icon: ShoppingCart, label: 'Billing' },
        { path: '/transactions', icon: FileClock, label: 'History' },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
            {/* Sidebar */}
            <aside className="glass-panel" style={{
                width: '260px',
                margin: '16px 0 16px 16px',
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem 1rem'
            }}>
                <div style={{ marginBottom: '3rem', paddingLeft: '1rem' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ASC Store
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manager</p>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => playSound('click')}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: isActive ? 'white' : 'var(--text-muted)',
                                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2), transparent)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                transition: 'all 0.2s',
                            })}
                        >
                            <item.icon size={20} />
                            <span style={{ fontWeight: 500 }}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        marginTop: 'auto',
                        width: '100%'
                    }}
                >
                    <LogOut size={20} />
                    <span style={{ fontWeight: 600 }}>Logout</span>
                </button>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Developed by <b style={{ color: 'var(--text-primary)' }}>Akash Pandey</b>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    overflowY: 'auto',
                    borderRadius: '16px',
                    padding: '1rem'
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
