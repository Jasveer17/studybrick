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
        <div className={`min-h-screen flex font-sans transition-colors duration-200 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            <div className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-200 ${!isMobile ? 'ml-64' : ''}`}>

                {/* Header */}
                <header className={`sticky top-0 z-30 border-b transition-colors duration-200 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className="h-14 flex items-center justify-between px-4 lg:px-6">
                        <div className="flex items-center gap-3">
                            {isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}

                            {canGoBack && (
                                <button
                                    onClick={() => navigate(-1)}
                                    className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}

                            {isMobile && (
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 p-1">
                                        <img src="/logo.png" className="w-full h-full" alt="Logo" />
                                    </div>
                                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>StudyBrick</span>
                                </div>
                            )}
                        </div>

                        {/* Right side - Theme Toggle, Notifications & Avatar */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-all duration-200 ${isDark ? 'text-amber-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Real-time Notices Widget */}
                            <NoticesWidget />

                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <div className="fade-in">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
