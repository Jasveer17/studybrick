import React, { useState, useEffect } from 'react';
import { Menu, ArrowLeft, Moon, Sun } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import NoticesWidget from '../ui/NoticesWidget';
import { motion } from 'framer-motion';

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
        <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30'}`}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            <div className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-300 ${!isMobile ? 'ml-64' : ''}`}>

                {/* Glassmorphism Header */}
                <header className={`sticky top-0 z-30 transition-all duration-300 ${isDark
                        ? 'bg-slate-800/80 border-slate-700/50'
                        : 'bg-white/70 border-slate-200/50'
                    } backdrop-blur-xl border-b`}>
                    <div className="h-16 flex items-center justify-between px-4 lg:px-6">
                        <div className="flex items-center gap-3">
                            {isMobile && (
                                <motion.button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className={`p-2.5 rounded-xl transition-all ${isDark ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Menu className="w-5 h-5" />
                                </motion.button>
                            )}

                            {canGoBack && (
                                <motion.button
                                    onClick={() => navigate(-1)}
                                    className={`p-2.5 rounded-xl transition-all ${isDark ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'}`}
                                    whileHover={{ scale: 1.05, x: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </motion.button>
                            )}

                            {isMobile && (
                                <div className="flex items-center gap-2.5">
                                    <motion.div
                                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 shadow-lg shadow-indigo-500/30"
                                        whileHover={{ rotate: 5 }}
                                    >
                                        <img src="/logo.png" className="w-full h-full" alt="Logo" />
                                    </motion.div>
                                    <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        StudyBrick
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right side - Theme Toggle, Notifications & Avatar */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <motion.button
                                onClick={toggleTheme}
                                className={`p-2.5 rounded-xl transition-all duration-300 ${isDark
                                        ? 'text-amber-400 hover:bg-slate-700/50 hover:text-amber-300'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'
                                    }`}
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </motion.button>

                            {/* Real-time Notices Widget */}
                            <NoticesWidget />

                            {/* Avatar */}
                            <motion.div
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-lg shadow-indigo-500/25"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/dashboard/profile')}
                            >
                                {user?.name?.charAt(0) || 'U'}
                            </motion.div>
                        </div>
                    </div>
                </header>

                <motion.main
                    className="flex-1 p-4 lg:p-6 overflow-y-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    key={location.pathname}
                >
                    {children || <Outlet />}
                </motion.main>
            </div>
        </div>
    );
};

export default DashboardLayout;
