
import React, { useState, useRef, useEffect } from 'react';
import UserIcon from './icons/UserIcon';
import Spinner from './ui/Spinner';

interface AuthModalProps {
    onClose: () => void;
    onLogin: (username: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);
        usernameInputRef.current?.focus();
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('Please enter a username and password.');
            return;
        }

        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            setIsLoading(false);
            onLogin(username.trim());
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div
                ref={modalRef}
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col text-white transform transition-all duration-300 scale-95 animate-scale-in"
            >
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <UserIcon className="w-6 h-6" />
                        Login to Sync Data
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none font-bold">&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="p-6 space-y-4">
                        <p className="text-sm text-gray-400">
                            This is a simulated login. Enter any username and password to "log in" and sync your data across sessions.
                        </p>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                            <input
                                ref={usernameInputRef}
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password-mock" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                            <input
                                id="password-mock"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                disabled={isLoading}
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </main>
                    <footer className="p-4 border-t border-gray-700">
                        <button
                            type="submit"
                            disabled={isLoading || !username.trim() || !password.trim()}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Spinner /> : 'Log In'}
                        </button>
                    </footer>
                </form>
            </div>
            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AuthModal;
