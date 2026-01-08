import React, { useState, useEffect } from 'react';
import { Menu, ArrowLeft, Moon, Sun, Sparkles } from 'lucide-react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
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
        <div className={`min-h-screen flex font-sans ${isDark ? 'dark' : ''}`}>
            {/* Background - Solid only, no gradients */}
            <div className={`fixed inset-0 ${isDark ? 'bg-[#0B0B0B]' : 'bg-[#f5f5f7]'}`} />

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            <div className={`relative flex-1 flex flex-col min-h-screen ${!isMobile ? 'ml-[240px]' : ''}`}>
                {/* Simple Header */}
                <header className={`sticky top-0 z-30 border-b ${isDark
                    ? 'bg-[#0B0B0B] border-[#2c2c2e]'
                    : 'bg-white border-[#e8e8ed]'
                    }`}>
                    <div className="h-14 flex items-center justify-between px-4 lg:px-5">
                        <div className="flex items-center gap-2">
                            {isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className={`p-2 rounded-lg transition-colors duration-120 ${isDark
                                        ? 'text-[#8e8e93] hover:text-white hover:bg-[#2c2c2e]'
                                        : 'text-[#8e8e93] hover:text-[#1c1c1e] hover:bg-[#f5f5f7]'
                                        }`}
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}

                            {canGoBack && (
                                <button
                                    onClick={() => navigate(-1)}
                                    className={`p-2 rounded-lg transition-colors duration-120 ${isDark
                                        ? 'text-[#8e8e93] hover:text-white hover:bg-[#2c2c2e]'
                                        : 'text-[#8e8e93] hover:text-[#1c1c1e] hover:bg-[#f5f5f7]'
                                        }`}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}

                            {isMobile && (
                                <div className="flex items-center gap-2 ml-1">
                                    <div className="w-8 h-8">
                                        <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
                                    </div>
                                    <span className={`font-semibold text-base ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
                                        StudyBrick
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right side - Theme Toggle, Notifications & Avatar */}
                        <div className="flex items-center gap-1">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-colors duration-120 ${isDark
                                    ? 'text-[#8e8e93] hover:text-white hover:bg-[#2c2c2e]'
                                    : 'text-[#8e8e93] hover:text-[#1c1c1e] hover:bg-[#f5f5f7]'
                                    }`}
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Notices Widget */}
                            <NoticesWidget />

                            {/* Simple Avatar */}
                            <div
                                className={`ml-1 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-colors duration-120 bg-[#5B6EAE] text-white hover:bg-[#4a5a94]`}
                                onClick={() => navigate('/dashboard/profile')}
                            >
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main
                    className="relative flex-1 p-4 lg:p-6 overflow-y-auto"
                    key={location.pathname}
                >
                    <div className="fade-in">
                        {children || <Outlet />}
                    </div>
                </main>

                {/* Footer */}
                <footer className={`px-4 lg:px-6 py-3 border-t ${isDark ? 'border-white/[0.04] bg-[#0a0f1a]/50' : 'border-neutral-100 bg-neutral-50/50'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <p className={isDark ? 'text-neutral-600' : 'text-neutral-400'}>
                            © {new Date().getFullYear()} StudyBrick
                        </p>
                        <div className="flex gap-4">
                            <Link to="/privacy-policy" className={`transition-colors ${isDark ? 'text-neutral-600 hover:text-neutral-400' : 'text-neutral-400 hover:text-neutral-600'}`}>
                                Privacy Policy
                            </Link>
                            <Link to="/terms-of-service" className={`transition-colors ${isDark ? 'text-neutral-600 hover:text-neutral-400' : 'text-neutral-400 hover:text-neutral-600'}`}>
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
