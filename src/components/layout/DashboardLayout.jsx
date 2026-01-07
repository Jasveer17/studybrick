import React, { useState, useEffect } from 'react';
import { Menu, ArrowLeft, Moon, Sun } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import NoticesWidget from '../ui/NoticesWidget';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const canGoBack = location.pathname !== '/dashboard/exam-engine' &&
        location.pathname !== '/admin/dashboard';

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={`min-h-screen flex font-sans ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30'}`}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            <div className={`flex-1 flex flex-col min-h-screen ${!isMobile ? 'ml-64' : ''}`}>

                {/* Glassmorphism Header */}
                <header className={`sticky top-0 z-30 ${isDark
                    ? 'bg-slate-800/80 border-slate-700/50'
                    : 'bg-white/70 border-slate-200/50'
                    } backdrop-blur-xl border-b`}>
                    <div className="h-16 flex items-center justify-between px-4 lg:px-6">
                        <div className="flex items-center gap-3">
                            {isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className={`p-2.5 rounded-xl transition-colors duration-150 ${isDark ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}

                            {canGoBack && (
                                <button
                                    onClick={() => navigate(-1)}
                                    className={`p-2.5 rounded-xl transition-colors duration-150 ${isDark ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}

                            {isMobile && (
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 shadow-lg shadow-indigo-500/30">
                                        <img src="/logo.png" className="w-full h-full" alt="Logo" />
                                    </div>
                                    <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        StudyBrick
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right side - Theme Toggle, Notifications & Avatar */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2.5 rounded-xl transition-colors duration-150 ${isDark
                                    ? 'text-amber-400 hover:bg-slate-700/50 hover:text-amber-300'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
                                    }`}
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Real-time Notices Widget */}
                            <NoticesWidget />

                            {/* Avatar */}
                            <div
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-lg shadow-indigo-500/25 transition-shadow duration-150 hover:shadow-indigo-500/40"
                                onClick={() => navigate('/dashboard/profile')}
                            >
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main
                    className="flex-1 p-4 lg:p-6 overflow-y-auto fade-in"
                    key={location.pathname}
                >
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

