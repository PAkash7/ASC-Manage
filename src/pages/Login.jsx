import React, { useState } from 'react';
import { useSound } from '../context/SoundContext';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { playSound } = useSound();
    const { login } = useAppContext();
    const navigate = useNavigate();
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(username, password)) {
            playSound('login');
            navigate('/dashboard');
        } else {
            playSound('error');
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
        }}>
            <form
                onSubmit={handleSubmit}
                className={`glass-panel animate-fade-in ${error ? 'shake' : ''}`}
                style={{
                    padding: '3rem',
                    width: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        background: 'linear-gradient(to right, #a855f7, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to continue</p>
                </div>

                <div style={{ position: 'relative' }}>
                    <User size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Username"
                        className="input-field"
                        style={{ paddingLeft: '40px' }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="password"
                        placeholder="Password"
                        className="input-field"
                        style={{ paddingLeft: '40px' }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        fontSize: '1rem'
                    }}
                >
                    Login
                </button>
            </form>

            <style>{`
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
        </div>
    );
};

export default Login;
