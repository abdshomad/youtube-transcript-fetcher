
import React, { useState, useRef, useEffect } from 'react';
import UserIcon from './icons/UserIcon';
import Spinner from './ui/Spinner';
import GoogleIcon from './icons/GoogleIcon';

interface AuthModalProps {
    onClose: () => void;
    onLogin: (username: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

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
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleLoginClick = () => {
        setIsLoading(true);
        // Simulate network delay for Google authentication
        setTimeout(() => {
            setIsLoading(false);
            onLogin('Google User'); // Login with a generic username
        }, 1500);
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
                <main className="p-8 text-center">
                    <p className="text-gray-300 mb-6">
                        Sign in with your Google account to save your download history and transcript edits across sessions.
                    </p>
                    <button
                        onClick={handleLoginClick}
                        disabled={isLoading}
                        className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-800 font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-md"
                    >
                        {isLoading ? (
                            <Spinner className="w-6 h-6 text-gray-700" />
                        ) : (
                            <>
                                <GoogleIcon className="w-6 h-6" />
                                Sign in with Google
                            </>
                        )}
                    </button>
                </main>
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
