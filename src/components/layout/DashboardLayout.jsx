import React, { useState, useEffect } from 'react';
import { Menu, ArrowLeft, Bell } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

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
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={isMobile}
            />

            <div className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-200 ${!isMobile ? 'ml-64' : ''}`}>

                {/* Header */}
                <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
                    <div className="h-14 flex items-center justify-between px-4 lg:px-6">
                        <div className="flex items-center gap-3">
                            {/* Mobile menu button */}
                            {isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}

                            {/* Back button */}
                            {canGoBack && (
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}

                            {/* Mobile logo */}
                            {isMobile && (
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4a574] to-[#c9a961] p-1">
                                        <img src="/logo.png" className="w-full h-full" alt="Logo" />
                                    </div>
                                    <span className="font-bold text-slate-900">StudyBrick</span>
                                </div>
                            )}
                        </div>

                        {/* Right side - Notifications & Avatar */}
                        <div className="flex items-center gap-3">
                            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d4a574] rounded-full"></span>
                            </button>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4a574] to-[#c9a961] flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
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
