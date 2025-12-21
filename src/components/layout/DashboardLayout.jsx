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
                setIsSidebarOpen(false); // Reset on desktop
            }
        };

        // Initial check
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
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${!isMobile ? 'ml-64' : ''}`}>

                {/* Mobile Header Toggle */}
                <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    {canGoBack && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg ml-1"
                            title="Go Back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <span className="ml-4 font-bold text-gray-900 text-lg">StudyBrick</span>
                </header>

                {/* Desktop Back Button */}
                {!isMobile && canGoBack && (
                    <div className="bg-white border-b border-gray-100 px-6 py-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>
                )}

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
