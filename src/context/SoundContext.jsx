import React, { createContext, useContext, useRef, useCallback } from 'react';

const SoundContext = createContext(null);

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};

export const SoundProvider = ({ children }) => {
    const audioContextRef = useRef(null);

    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const playTone = (frequency, type, duration, volume = 0.1) => {
        initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    const playSound = (type) => {
        // Force resume context on user interaction
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(console.error);
        } else if (!audioContextRef.current) {
            initAudio();
        }

        switch (type) {
            case 'login':
                // Melodious success chord
                setTimeout(() => playTone(440, 'sine', 0.6, 0.2), 0); // A4
                setTimeout(() => playTone(554.37, 'sine', 0.6, 0.2), 100); // C#5
                setTimeout(() => playTone(659.25, 'sine', 0.8, 0.2), 200); // E5
                break;

            case 'success':
            case 'add':
                // Smooth "ding"
                playTone(880, 'sine', 0.4, 0.15); // A5
                break;

            case 'delete':
            case 'error':
                // "Buj" / Buzz
                playTone(150, 'sawtooth', 0.3, 0.2);
                break;

            case 'scan':
                // High beep
                playTone(1200, 'square', 0.1, 0.05);
                break;

            case 'click':
                // Subtle click
                playTone(800, 'sine', 0.05, 0.05);
                break;

            default:
                playTone(440, 'sine', 0.2);
        }
    };

    return (
        <SoundContext.Provider value={{ playSound }}>
            {children}
        </SoundContext.Provider>
    );
};
