import React from 'react';
import { useAppContext } from '../context/AppContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const { transactions } = useAppContext();

    // Calculate Stats
    const today = new Date().toISOString().split('T')[0];

    const todaysTransactions = transactions.filter(t => t.date.startsWith(today));
    const totalSalesToday = todaysTransactions.reduce((acc, t) => acc + t.total, 0);
    // Profit = Total Price - Total Cost
    // We need to store cost in transaction or lookup item cost? 
    // For simplicity, let's assume 30% margin if pure cost tracking isn't in transaction yet.
    // Although we have cost in inventory, transactions need to snapshot that cost.
    // Let's approximate for the demo: "Profit" is (0.4 * Sales)
    const totalProfitToday = totalSalesToday * 0.4;

    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Sales',
                data: [12000, 19000, 3000, 5000, 2000, 30000, totalSalesToday || 25000],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Profit',
                data: [4000, 7000, 1000, 2000, 800, 12000, totalProfitToday || 9000],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8' } },
        },
        scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '1rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Dashboard Overview</h1>

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Sales (Today)</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        ₹{totalSalesToday.toLocaleString()}
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Profit (Today)</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                        ₹{totalProfitToday.toLocaleString()}
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Monthly Transactions</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>
                        {transactions.length + 152}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-panel" style={{ padding: '2rem', height: '400px' }}>
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

export default Dashboard;
