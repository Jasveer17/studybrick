import React, { useState, useEffect } from 'react';
import { LogOut, BookMarked, X, FileText, UploadCloud, Database, Users, UserCircle, Trophy, Download } from 'lucide-react';
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
            else setTimeout(() => setShowMobileOverlay(false), 300);
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

        // Check if already installed
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

    // Define Menu Items based on Role
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
                    className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <div className={`fixed left-0 top-0 h-screen w-64 bg-[#1a2234] text-white flex flex-col z-50 transition-transform duration-300 ${mobileClasses}`}>
                {/* Brand */}
                <div className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center p-1.5">
                            <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">StudyBrick</span>
                    </div>
                    {isMobile && (
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={isMobile ? onClose : undefined}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* PWA Install Button - Mobile Only */}
                {showInstallButton && isMobile && (
                    <div className="px-3 pb-2">
                        <button
                            onClick={handleInstallClick}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 transition-all"
                        >
                            <Download className="w-5 h-5" />
                            Install App
                        </button>
                    </div>
                )}

                {/* User Profile Section */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-2">
                        <Link
                            to="/dashboard/profile"
                            onClick={isMobile ? onClose : undefined}
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
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
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
