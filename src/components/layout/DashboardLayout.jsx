import React, { useState, useEffect } from 'react';
import { Menu, ArrowLeft, Sparkles } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we can go back (not on the main dashboard pages)
    const canGoBack = location.pathname !== '/dashboard/exam-engine' &&
        location.pathname !== '/admin/dashboard';

    // Handle Resize for responsive check
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false); // Reset on desktop
            }
        };

        // Initial check
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex font-sans">
            {/* Subtle Background Pattern */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl" />
            </div>

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 relative ${!isMobile ? 'ml-64' : ''}`}>

                {/* Mobile Header */}
                <header className="lg:hidden glass sticky top-0 z-30 border-b border-slate-200/50">
                    <div className="h-16 flex items-center px-4 gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </motion.button>

                        <AnimatePresence>
                            {canGoBack && (
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(-1)}
                                    className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                    title="Go Back"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-2 ml-2">
                            <img src="/logo.png" className="w-8 h-8" alt="Logo" />
                            <span className="font-bold text-slate-900 text-lg tracking-tight">StudyBrick</span>
                        </div>
                    </div>
                </header>

                {/* Desktop Back Button */}
                <AnimatePresence>
                    {!isMobile && canGoBack && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass border-b border-slate-200/50 px-8 py-3"
                        >
                            <motion.button
                                whileHover={{ x: -3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children || <Outlet />}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
