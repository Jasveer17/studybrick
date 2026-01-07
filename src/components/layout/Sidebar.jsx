import React, { useState, useEffect } from 'react';
import { LogOut, BookMarked, X, FileText, UploadCloud, Database, Users, UserCircle, Trophy, Download, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
    const [showMobileOverlay, setShowMobileOverlay] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isDark } = useTheme();

    useEffect(() => {
        if (isMobile) {
            if (isOpen) setShowMobileOverlay(true);
            else setTimeout(() => setShowMobileOverlay(false), 150);
        }
    }, [isOpen, isMobile]);

    // PWA Install Prompt Handler
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallButton(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstallButton(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallButton(false);
        }
        setDeferredPrompt(null);
    };

    const menuItems = user?.role === 'admin' ? [
        { icon: UploadCloud, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Database, label: 'Question Bank', path: '/admin/questions' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
    ] : [
        { icon: FileText, label: 'Exam Engine', path: '/dashboard/exam-engine' },
        { icon: BookMarked, label: 'Study Bricks', path: '/dashboard/study-bricks' },
        { icon: Trophy, label: 'Leaderboard', path: '/dashboard/leaderboard' },
        { icon: UserCircle, label: 'My Profile', path: '/dashboard/profile' },
    ];

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    const mobileClasses = isMobile
        ? `${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`
        : 'translate-x-0';

    return (
        <>
            {/* Mobile Backdrop */}
            {showMobileOverlay && (
                <div
                    className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                />
            )}

            <div className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-50 transition-transform duration-150 ease-out ${mobileClasses}`}>
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950" />

                {/* Decorative Glow */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-500/10 to-transparent" />

                {/* Content */}
                <div className="relative flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-1.5 shadow-lg shadow-indigo-500/40">
                                <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
                            </div>
                            <div>
                                <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
                                    StudyBrick
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                </span>
                            </div>
                        </div>
                        {isMobile && (
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors duration-150"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={isMobile ? onClose : undefined}
                                    className="relative block"
                                >
                                    <div
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-150 ${isActive
                                            ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30'
                                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                        <span className="font-medium">{item.label}</span>

                                        {/* Active Indicator Dot */}
                                        {isActive && (
                                            <div className="absolute right-3 w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* PWA Install Button - Mobile Only */}
                    {showInstallButton && isMobile && (
                        <div className="px-3 pb-2">
                            <button
                                onClick={handleInstallClick}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-shadow duration-150"
                            >
                                <Download className="w-5 h-5" />
                                Install App
                            </button>
                        </div>
                    )}

                    {/* User Profile Section */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors duration-150">
                            <Link
                                to="/dashboard/profile"
                                onClick={isMobile ? onClose : undefined}
                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                            >
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                                    <p className="text-xs text-slate-400 truncate capitalize">
                                        {user?.role === 'institute' ? 'Institute' : user?.role || 'Guest'}
                                    </p>
                                </div>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors duration-150"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

