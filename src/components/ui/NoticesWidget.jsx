import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const NoticesWidget = () => {
    const [notices, setNotices] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const { isDark } = useTheme();

    useEffect(() => {
        // Real-time listener for last 5 notices
        const q = query(
            collection(db, 'notices'),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const noticeData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotices(noticeData);

            // Check if there's a new notice (within last 5 minutes)
            if (noticeData.length > 0 && noticeData[0].createdAt) {
                const latestTime = noticeData[0].createdAt.toDate?.() || new Date(noticeData[0].createdAt);
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                if (latestTime > fiveMinutesAgo) {
                    setHasNew(true);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setHasNew(false);
                }}
                className={`relative p-2 rounded-lg transition-colors ${isDark
                        ? 'hover:bg-slate-700 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
            >
                <Bell className="w-5 h-5" />
                {hasNew && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
            </button>

            {/* Notices Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className={`absolute right-0 top-12 w-80 rounded-xl shadow-2xl border z-50 overflow-hidden ${isDark
                                    ? 'bg-slate-800 border-slate-700'
                                    : 'bg-white border-slate-200'
                                }`}
                        >
                            {/* Header */}
                            <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <Bell className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Live Notices
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Notices List */}
                            <div className="max-h-80 overflow-y-auto">
                                {notices.length === 0 ? (
                                    <div className={`p-6 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No notices yet</p>
                                    </div>
                                ) : (
                                    notices.map((notice, index) => (
                                        <div
                                            key={notice.id}
                                            className={`p-4 border-b transition-colors ${isDark
                                                    ? 'border-slate-700 hover:bg-slate-700/50'
                                                    : 'border-slate-100 hover:bg-slate-50'
                                                } ${index === 0 ? 'bg-indigo-500/5' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {notice.type === 'urgent' && (
                                                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'
                                                            }`}>
                                                            {notice.title}
                                                        </h4>
                                                        {notice.type === 'urgent' && (
                                                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-500 rounded">
                                                                Urgent
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'
                                                        }`}>
                                                        {notice.message}
                                                    </p>
                                                    <span className={`text-xs mt-2 block ${isDark ? 'text-slate-500' : 'text-slate-400'
                                                        }`}>
                                                        {formatTime(notice.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NoticesWidget;
