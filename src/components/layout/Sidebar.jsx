import React, { useState, useEffect } from 'react';
import { LogOut, BookMarked, X, FileText, UploadCloud, Database, Users, UserCircle, Download } from 'lucide-react';
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
            else setTimeout(() => setShowMobileOverlay(false), 120);
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
        { icon: FileText, label: 'Question Bank', path: '/dashboard/exam-engine' },
        { icon: BookMarked, label: 'Study Materials', path: '/dashboard/study-bricks' },
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
                    className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-120 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                />
            )}

            <div className={`fixed left-0 top-0 h-screen w-[240px] flex flex-col z-50 transition-transform duration-120 ease-out ${mobileClasses}`}>
                {/* Background - Solid, no gradients */}
                <div className={`absolute inset-0 ${isDark
                    ? 'bg-[#111111] border-r border-[#2c2c2e]'
                    : 'bg-white border-r border-[#e8e8ed]'
                    }`} />

                {/* Content */}
                <div className="relative flex flex-col h-full">
                    {/* Brand Header - Simplified */}
                    <div className="px-5 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9">
                                <img
                                    src="/logo.png"
                                    className="w-full h-full object-contain"
                                    alt="StudyBrick"
                                />
                            </div>
                            <span className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
                                StudyBrick
                            </span>
                        </div>
                        {isMobile && (
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors duration-120 ${isDark
                                    ? 'text-[#8e8e93] hover:text-white hover:bg-[#2c2c2e]'
                                    : 'text-[#8e8e93] hover:text-[#1c1c1e] hover:bg-[#f5f5f7]'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-2 overflow-y-auto">
                        <div className="space-y-0.5">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={isMobile ? onClose : undefined}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-120 ${isActive
                                            ? isDark
                                                ? 'bg-[#2c2c2e] text-white'
                                                : 'bg-[#e8e8ed] text-[#1c1c1e]'
                                            : isDark
                                                ? 'text-[#8e8e93] hover:text-white hover:bg-[#1c1c1e]'
                                                : 'text-[#636366] hover:text-[#1c1c1e] hover:bg-[#f5f5f7]'
                                            }`}
                                    >
                                        {/* Left border indicator for active state */}
                                        {isActive && (
                                            <div className={`absolute left-0 w-0.5 h-5 rounded-r ${isDark ? 'bg-[#5B6EAE]' : 'bg-[#5B6EAE]'}`} />
                                        )}

                                        <Icon className={`w-[18px] h-[18px] ${isActive
                                            ? isDark ? 'text-[#5B6EAE]' : 'text-[#5B6EAE]'
                                            : ''
                                            }`} />

                                        <span className="text-[14px] font-medium">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* PWA Install Button - Simplified */}
                    {showInstallButton && isMobile && (
                        <div className="px-3 pb-3">
                            <button
                                onClick={handleInstallClick}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors duration-120 ${isDark
                                    ? 'bg-[#5B6EAE] text-white hover:bg-[#4a5a94]'
                                    : 'bg-[#5B6EAE] text-white hover:bg-[#4a5a94]'
                                    }`}
                            >
                                <Download className="w-4 h-4" />
                                Install App
                            </button>
                        </div>
                    )}

                    {/* User Profile Section - Simplified */}
                    <div className={`p-3 border-t ${isDark ? 'border-[#2c2c2e]' : 'border-[#e8e8ed]'}`}>
                        <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-120 ${isDark ? 'hover:bg-[#1c1c1e]' : 'hover:bg-[#f5f5f7]'}`}>
                            <Link
                                to="/dashboard/profile"
                                onClick={isMobile ? onClose : undefined}
                                className="flex items-center gap-3 flex-1 min-w-0"
                            >
                                {/* Simple Avatar */}
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium ${isDark
                                    ? 'bg-[#5B6EAE] text-white'
                                    : 'bg-[#5B6EAE] text-white'
                                    }`}>
                                    {user?.name?.charAt(0) || 'U'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-[13px] font-medium truncate ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
                                        {user?.name || 'User'}
                                    </p>
                                    <p className={`text-[11px] truncate ${isDark ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`}>
                                        {user?.role === 'institute' ? 'Institute' : user?.role || 'Guest'}
                                    </p>
                                </div>
                            </Link>

                            {/* Sign Out Button */}
                            <button
                                onClick={handleSignOut}
                                className={`p-2 rounded-lg transition-colors duration-120 ${isDark
                                    ? 'text-[#8e8e93] hover:text-[#ef4444] hover:bg-[#2c2c2e]'
                                    : 'text-[#8e8e93] hover:text-[#ef4444] hover:bg-[#f5f5f7]'
                                    }`}
                                title="Sign Out"
                            >
                                <LogOut className="w-[16px] h-[16px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
