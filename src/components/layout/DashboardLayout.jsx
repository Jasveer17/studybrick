import React, { useState, useEffect } from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-200 ${!isMobile ? 'ml-64' : ''}`}>

                {/* Mobile Header */}
                <header className="lg:hidden bg-white/90 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-100">
                    <div className="h-14 flex items-center px-4 gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg btn-press"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {canGoBack && (
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg btn-press"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}

                        <div className="flex items-center gap-2">
                            <img src="/logo.png" className="w-7 h-7" alt="Logo" />
                            <span className="font-bold text-slate-900 tracking-tight">StudyBrick</span>
                        </div>
                    </div>
                </header>

                {/* Desktop Back Button */}
                {!isMobile && canGoBack && (
                    <div className="bg-white border-b border-slate-100 px-8 py-2.5">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            Back
                        </button>
                    </div>
                )}

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="fade-in">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
