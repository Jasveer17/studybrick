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
            {/* Premium Background */}
            <div className={`fixed inset-0 ${isDark
                ? 'bg-[#0a0f1a]'
                : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50/40'
                }`}>
                {/* Ambient gradient orbs for light mode */}
                {!isDark && (
                    <>
                        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-indigo-100/50 via-purple-50/30 to-transparent rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-blue-50/40 via-cyan-50/20 to-transparent rounded-full blur-3xl" />
                    </>
                )}

                {/* Subtle grid for dark mode */}
                {isDark && (
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                            backgroundSize: '60px 60px'
                        }}
                    />
                )}
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            <div className={`relative flex-1 flex flex-col min-h-screen ${!isMobile ? 'ml-[280px]' : ''}`}>
                {/* Premium Header */}
                <header className={`sticky top-0 z-30 ${isDark
                    ? 'bg-[#0a0f1a]/80 border-white/[0.06]'
                    : 'bg-white/70 border-neutral-200/50'
                    } backdrop-blur-xl border-b`}>
                    <div className="h-16 flex items-center justify-between px-4 lg:px-6">
                        <div className="flex items-center gap-2">
                            {isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className={`p-2.5 rounded-xl transition-all duration-150 ${isDark
                                        ? 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                                        : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                                        }`}
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}

                            {canGoBack && (
                                <button
                                    onClick={() => navigate(-1)}
                                    className={`p-2.5 rounded-xl transition-all duration-150 ${isDark
                                        ? 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                                        : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                                        }`}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}

                            {isMobile && (
                                <div className="flex items-center gap-2.5 ml-1">
                                    <div className="w-10 h-10">
                                        <img src="/logo.png" className="w-full h-full object-contain drop-shadow-lg" alt="Logo" />
                                    </div>
                                    <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                        StudyBrick
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right side - Theme Toggle, Notifications & Avatar */}
                        <div className="flex items-center gap-1.5">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2.5 rounded-xl transition-all duration-150 ${isDark
                                    ? 'text-amber-400 hover:bg-white/[0.06]'
                                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-indigo-600'
                                    }`}
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Real-time Notices Widget */}
                            <NoticesWidget />

                            {/* Premium Avatar */}
                            <div
                                className="relative group cursor-pointer ml-1"
                                onClick={() => navigate('/dashboard/profile')}
                            >
                                {/* Glow effect on hover */}
                                <div className={`absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-60 blur transition-opacity duration-200`} />
                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
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
