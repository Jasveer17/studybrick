import React, { useState, useEffect } from 'react';
import { LogOut, BookMarked, X, FileText, UploadCloud, Database, Users, UserCircle, Trophy, Download, Sparkles, ChevronRight } from 'lucide-react';
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
        ? `${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        : 'translate-x-0';

    return (
        <>
            {/* Mobile Backdrop */}
            {showMobileOverlay && (
                <div
                    className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                />
            )}

            <div className={`fixed left-0 top-0 h-screen w-[280px] flex flex-col z-50 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileClasses}`}>
                {/* Background - Theme Aware */}
                <div className={`absolute inset-0 ${isDark
                    ? 'bg-gradient-to-b from-[#0f1419] via-[#0d1117] to-[#0a0d12]'
                    : 'bg-gradient-to-b from-white via-neutral-50 to-white border-r border-neutral-200'
                    }`} />

                {/* Decorative Gradient Orbs - Only in dark mode */}
                {isDark && (
                    <>
                        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-indigo-600/8 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-600/5 to-transparent pointer-events-none" />
                    </>
                )}

                {/* Content */}
                <div className="relative flex flex-col h-full">
                    {/* Brand Header */}
                    <div className="p-5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {/* Logo container with background for visibility */}
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-indigo-50'
                                }`}>
                                <img
                                    src="/logo.png"
                                    className="w-12 h-12 object-contain"
                                    alt="StudyBrick Logo"
                                />
                            </div>
                            <div>
                                <span className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                    StudyBrick
                                </span>
                                <span className={`block text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                    Premium
                                </span>
                            </div>
                        </div>
                        {isMobile && (
                            <button
                                onClick={onClose}
                                className={`p-2.5 rounded-xl transition-all duration-150 ${isDark
                                    ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Divider */}
                    <div className={`mx-5 h-px ${isDark ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : 'bg-neutral-200'}`} />

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                        <div className="px-3 mb-3">
                            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                Menu
                            </span>
                        </div>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={isMobile ? onClose : undefined}
                                    className="relative block group"
                                >
                                    <div
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 ${isActive
                                            ? isDark
                                                ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white'
                                                : 'bg-gradient-to-r from-indigo-100 to-purple-50 text-indigo-700'
                                            : isDark
                                                ? 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                                                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                                            }`}
                                    >
                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" />
                                        )}

                                        <div className={`p-2 rounded-lg transition-colors duration-150 ${isActive
                                            ? isDark
                                                ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                                                : 'bg-indigo-200/50'
                                            : isDark
                                                ? 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                                                : 'bg-neutral-100 group-hover:bg-neutral-200'
                                            }`}>
                                            <Icon className={`w-[18px] h-[18px] ${isActive
                                                ? isDark ? 'text-indigo-400' : 'text-indigo-600'
                                                : isDark
                                                    ? 'text-neutral-500 group-hover:text-neutral-300'
                                                    : 'text-neutral-500 group-hover:text-neutral-700'
                                                }`} />
                                        </div>

                                        <span className={`font-medium text-[14px] ${isActive ? (isDark ? 'text-white' : 'text-indigo-700') : ''}`}>
                                            {item.label}
                                        </span>

                                        {/* Hover arrow */}
                                        <ChevronRight className={`w-4 h-4 ml-auto transition-all duration-150 ${isActive
                                            ? 'opacity-50 translate-x-0'
                                            : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                                            } ${isDark ? '' : 'text-neutral-400'}`} />
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* PWA Install Button - Mobile Only */}
                    {showInstallButton && isMobile && (
                        <div className="px-4 pb-3">
                            <button
                                onClick={handleInstallClick}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-150 hover:-translate-y-0.5"
                            >
                                <Download className="w-5 h-5" />
                                Install App
                            </button>
                        </div>
                    )}

                    {/* User Profile Section */}
                    <div className={`p-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-neutral-200'}`}>
                        <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors duration-150 group ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-neutral-100'
                            }`}>
                            <Link
                                to="/dashboard/profile"
                                onClick={isMobile ? onClose : undefined}
                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                            >
                                {/* Premium Avatar with Ring */}
                                <div className="relative">
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl opacity-75 blur-[2px]" />
                                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    {/* Online indicator */}
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 ${isDark ? 'border-[#0d1117]' : 'border-white'
                                        }`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-[14px] font-semibold truncate ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                        {user?.name || 'User'}
                                    </p>
                                    <p className={`text-[12px] truncate capitalize ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                                        {user?.role === 'institute' ? 'Institute' : user?.role || 'Guest'}
                                    </p>
                                </div>
                            </Link>

                            {/* Sign Out Button */}
                            <button
                                onClick={handleSignOut}
                                className={`p-2.5 rounded-xl transition-all duration-150 ${isDark
                                    ? 'text-neutral-500 hover:text-red-400 hover:bg-red-400/10'
                                    : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                title="Sign Out"
                            >
                                <LogOut className="w-[18px] h-[18px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
