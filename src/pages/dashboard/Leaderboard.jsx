import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Animated Counter Component
const AnimatedScore = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1200;
        const increment = value / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{displayValue.toLocaleString()}</span>;
};

const Leaderboard = () => {
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            orderBy('totalScore', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userData = snapshot.docs.map((doc, index) => ({
                id: doc.id,
                rank: index + 1,
                ...doc.data()
            }));
            setTopUsers(userData);
            setLoading(false);
        }, (error) => {
            console.error('Leaderboard fetch error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1:
                return {
                    bg: isDark
                        ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15'
                        : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50',
                    border: isDark ? 'border-amber-500/30' : 'border-amber-200',
                    glow: 'shadow-xl shadow-amber-500/20',
                    icon: <Crown className="w-5 h-5 text-amber-400" />,
                    badge: 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/40',
                    avatarGradient: 'from-amber-400 to-yellow-500',
                    scoreColor: 'text-amber-400'
                };
            case 2:
                return {
                    bg: isDark
                        ? 'bg-gradient-to-r from-slate-400/10 via-neutral-400/8 to-slate-400/10'
                        : 'bg-gradient-to-r from-slate-50 via-neutral-50 to-slate-50',
                    border: isDark ? 'border-slate-500/30' : 'border-slate-200',
                    glow: '',
                    icon: <Medal className="w-5 h-5 text-slate-400" />,
                    badge: 'bg-gradient-to-br from-slate-400 to-neutral-500 shadow-lg shadow-slate-500/30',
                    avatarGradient: 'from-slate-400 to-neutral-500',
                    scoreColor: 'text-slate-400'
                };
            case 3:
                return {
                    bg: isDark
                        ? 'bg-gradient-to-r from-orange-500/12 via-amber-600/8 to-orange-500/12'
                        : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50',
                    border: isDark ? 'border-orange-500/30' : 'border-orange-200',
                    glow: '',
                    icon: <Medal className="w-5 h-5 text-orange-400" />,
                    badge: 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-500/30',
                    avatarGradient: 'from-orange-400 to-amber-500',
                    scoreColor: 'text-orange-400'
                };
            default:
                return {
                    bg: isDark ? 'bg-[#151b27]' : 'bg-white',
                    border: isDark ? 'border-white/[0.06]' : 'border-neutral-200/50',
                    glow: '',
                    icon: <span className={`text-sm font-bold ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>{rank}</span>,
                    badge: isDark ? 'bg-neutral-700' : 'bg-neutral-100',
                    avatarGradient: 'from-indigo-500 to-purple-600',
                    scoreColor: isDark ? 'text-indigo-400' : 'text-indigo-600'
                };
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 400, damping: 30 }
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Premium Trophy Icon */}
                <motion.div
                    className="relative inline-flex items-center justify-center mb-5"
                >
                    <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                </motion.div>

                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                        <Zap className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        Live Rankings
                    </span>
                </div>

                <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    Leaderboard
                </h1>
                <p className={`mt-2 flex items-center justify-center gap-1.5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Top performers this month
                </p>
            </motion.div>

            {/* Loading State */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        className="space-y-3"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="loading"
                    >
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`p-4 rounded-2xl ${isDark ? 'bg-[#151b27] border border-white/[0.06]' : 'bg-white border border-neutral-200/50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="skeleton-premium w-10 h-10 rounded-xl" />
                                    <div className="skeleton-premium w-12 h-12 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="skeleton-premium h-4 w-32 rounded-lg" />
                                        <div className="skeleton-premium h-3 w-24 rounded-lg" />
                                    </div>
                                    <div className="skeleton-premium h-8 w-16 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : topUsers.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key="empty"
                        className={`text-center py-16 rounded-2xl ${isDark ? 'bg-[#151b27] border border-white/[0.06]' : 'bg-white border border-neutral-200/50 shadow-sm'}`}
                    >
                        <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-neutral-700' : 'text-neutral-200'}`} />
                        <p className={`font-semibold text-lg ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                            No scores yet
                        </p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Complete exams to appear on the leaderboard!
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        key="list"
                    >
                        {topUsers.map((leaderUser) => {
                            const style = getRankStyle(leaderUser.rank);
                            const isCurrentUser = leaderUser.id === currentUser?.uid;
                            const isTopThree = leaderUser.rank <= 3;

                            return (
                                <motion.div
                                    key={leaderUser.id}
                                    variants={itemVariants}
                                    className={`group relative p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${style.bg} ${style.border} ${style.glow}
                                        ${isCurrentUser ? 'ring-2 ring-indigo-500 ring-offset-2' : ''} 
                                        ${isDark && isCurrentUser ? 'ring-offset-[#0a0f1a]' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${style.badge}`}>
                                            {isTopThree ? style.icon : leaderUser.rank}
                                        </div>

                                        {/* Avatar */}
                                        <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${style.avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform duration-200 group-hover:scale-105`}>
                                            {leaderUser.name?.charAt(0) || 'U'}
                                        </div>

                                        {/* Name & Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                                    {leaderUser.name || 'Anonymous'}
                                                </h3>
                                                {isCurrentUser && (
                                                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                                {leaderUser.institute || leaderUser.role || 'Student'}
                                            </p>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <div className="flex items-center gap-1.5">
                                                <Star className={`w-5 h-5 ${style.scoreColor}`} fill="currentColor" />
                                                <span className={`text-2xl font-bold tabular-nums ${style.scoreColor}`}>
                                                    <AnimatedScore value={leaderUser.totalScore || 0} />
                                                </span>
                                            </div>
                                            <p className={`text-xs font-medium ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                                                points
                                            </p>
                                        </div>
                                    </div>

                                    {/* Top 3 Medal Emoji */}
                                    {isTopThree && (
                                        <div className="absolute -top-2 -right-2 text-2xl drop-shadow-lg">
                                            {leaderUser.rank === 1 && '🥇'}
                                            {leaderUser.rank === 2 && '🥈'}
                                            {leaderUser.rank === 3 && '🥉'}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Note */}
            <motion.p
                className={`text-center text-sm font-medium ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                ⚡ Rankings update in real-time
            </motion.p>
        </div>
    );
};

export default Leaderboard;
