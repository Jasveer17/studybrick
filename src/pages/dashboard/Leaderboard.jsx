import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Sparkles } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// Confetti Component for Top 3
const Confetti = () => {
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA15E'];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        background: colors[i % colors.length],
                        left: `${Math.random() * 100}%`,
                        top: '-10px',
                    }}
                    animate={{
                        y: ['0vh', '100vh'],
                        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                        scale: [1, 0.5],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
};

// Animated Counter Component
const AnimatedScore = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
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

    return <span>{displayValue}</span>;
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
                        ? 'bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20'
                        : 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50',
                    border: 'border-yellow-400/50',
                    glow: 'shadow-yellow-500/25',
                    icon: <Crown className="w-5 h-5 text-yellow-400" />,
                    badge: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30'
                };
            case 2:
                return {
                    bg: isDark
                        ? 'bg-gradient-to-r from-slate-400/20 via-gray-400/20 to-slate-400/20'
                        : 'bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50',
                    border: 'border-slate-300/50',
                    glow: 'shadow-slate-500/20',
                    icon: <Medal className="w-5 h-5 text-slate-300" />,
                    badge: 'bg-gradient-to-r from-slate-300 to-gray-400 text-white shadow-lg shadow-slate-500/30'
                };
            case 3:
                return {
                    bg: isDark
                        ? 'bg-gradient-to-r from-orange-500/20 via-amber-600/20 to-orange-500/20'
                        : 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50',
                    border: 'border-orange-300/50',
                    glow: 'shadow-orange-500/20',
                    icon: <Medal className="w-5 h-5 text-orange-400" />,
                    badge: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                };
            default:
                return {
                    bg: isDark ? 'bg-slate-800/50' : 'bg-white',
                    border: isDark ? 'border-slate-700/50' : 'border-slate-200',
                    glow: '',
                    icon: <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{rank}</span>,
                    badge: isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                };
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 25 }
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 relative">
            {/* Confetti for celebration */}
            {!loading && topUsers.length > 0 && <Confetti />}

            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-4 shadow-xl shadow-purple-500/30"
                    animate={{
                        boxShadow: [
                            '0 20px 25px -5px rgba(168, 85, 247, 0.3)',
                            '0 20px 25px -5px rgba(168, 85, 247, 0.5)',
                            '0 20px 25px -5px rgba(168, 85, 247, 0.3)',
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Trophy className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span className="gradient-text">Leaderboard</span>
                </h1>
                <p className={`mt-2 flex items-center justify-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Top performers this month
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                </p>
            </motion.div>

            {/* Loading State */}
            <AnimatePresence>
                {loading ? (
                    <motion.div
                        className="space-y-3"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="skeleton w-10 h-10 rounded-full" />
                                    <div className="skeleton w-12 h-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="skeleton h-4 w-32 rounded" />
                                        <div className="skeleton h-3 w-24 rounded" />
                                    </div>
                                    <div className="skeleton h-6 w-16 rounded" />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : topUsers.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-center py-16 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}
                    >
                        <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`font-semibold text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            No scores yet
                        </p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Complete exams to appear on the leaderboard!
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {topUsers.map((leaderUser) => {
                            const style = getRankStyle(leaderUser.rank);
                            const isCurrentUser = leaderUser.id === currentUser?.id;
                            const isTopThree = leaderUser.rank <= 3;

                            return (
                                <motion.div
                                    key={leaderUser.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className={`relative p-4 rounded-2xl border-2 transition-all ${style.bg} ${style.border} ${style.glow ? `shadow-xl ${style.glow}` : ''}
                                        ${isCurrentUser ? 'ring-2 ring-indigo-500 ring-offset-2' : ''} 
                                        ${isDark && isCurrentUser ? 'ring-offset-slate-900' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <motion.div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${style.badge}`}
                                            whileHover={{ rotate: [0, -10, 10, 0] }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {isTopThree ? style.icon : leaderUser.rank}
                                        </motion.div>

                                        {/* Avatar */}
                                        <motion.div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${leaderUser.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-500/30' :
                                                    leaderUser.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-gray-400 shadow-slate-400/30' :
                                                        leaderUser.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-orange-500/30' :
                                                            'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
                                                }`}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {leaderUser.name?.charAt(0) || 'U'}
                                        </motion.div>

                                        {/* Name & Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {leaderUser.name || 'Anonymous'}
                                                </h3>
                                                {isCurrentUser && (
                                                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full animate-pulse">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {leaderUser.institute || leaderUser.role || 'Student'}
                                            </p>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <div className="flex items-center gap-1">
                                                <Star className={`w-5 h-5 ${leaderUser.rank === 1 ? 'text-yellow-400' :
                                                        leaderUser.rank === 2 ? 'text-slate-300' :
                                                            leaderUser.rank === 3 ? 'text-orange-400' :
                                                                isDark ? 'text-indigo-400' : 'text-indigo-600'
                                                    }`} fill="currentColor" />
                                                <span className={`text-2xl font-extrabold ${leaderUser.rank === 1 ? 'text-yellow-400' :
                                                        leaderUser.rank === 2 ? 'text-slate-300' :
                                                            leaderUser.rank === 3 ? 'text-orange-400' :
                                                                isDark ? 'text-indigo-400' : 'text-indigo-600'
                                                    }`}>
                                                    <AnimatedScore value={leaderUser.totalScore || 0} />
                                                </span>
                                            </div>
                                            <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                points
                                            </p>
                                        </div>
                                    </div>

                                    {/* Top 3 Emoji Badges */}
                                    {isTopThree && (
                                        <motion.div
                                            className="absolute -top-3 -right-3"
                                            animate={{
                                                rotate: [0, 10, -10, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <span className="text-3xl drop-shadow-lg">
                                                {leaderUser.rank === 1 && '🥇'}
                                                {leaderUser.rank === 2 && '🥈'}
                                                {leaderUser.rank === 3 && '🥉'}
                                            </span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Note */}
            <motion.p
                className={`text-center text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                ⚡ Rankings update in real-time • Complete exams to earn points
            </motion.p>
        </div>
    );
};

export default Leaderboard;
