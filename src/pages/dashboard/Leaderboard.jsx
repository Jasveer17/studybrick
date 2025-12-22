import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Leaderboard = () => {
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();
    const { user: currentUser } = useAuth();

    useEffect(() => {
        // Query top 10 users by totalScore
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
                    bg: isDark ? 'bg-gradient-to-r from-yellow-600/30 to-amber-600/30' : 'bg-gradient-to-r from-yellow-100 to-amber-100',
                    border: 'border-yellow-400',
                    icon: <Crown className="w-6 h-6 text-yellow-500" />,
                    badge: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                };
            case 2:
                return {
                    bg: isDark ? 'bg-gradient-to-r from-slate-500/30 to-gray-500/30' : 'bg-gradient-to-r from-slate-100 to-gray-100',
                    border: 'border-slate-400',
                    icon: <Medal className="w-6 h-6 text-slate-400" />,
                    badge: 'bg-gradient-to-r from-slate-400 to-gray-500 text-white'
                };
            case 3:
                return {
                    bg: isDark ? 'bg-gradient-to-r from-orange-700/30 to-amber-700/30' : 'bg-gradient-to-r from-orange-100 to-amber-100',
                    border: 'border-orange-400',
                    icon: <Medal className="w-6 h-6 text-orange-500" />,
                    badge: 'bg-gradient-to-r from-orange-400 to-amber-600 text-white'
                };
            default:
                return {
                    bg: isDark ? 'bg-slate-800' : 'bg-white',
                    border: isDark ? 'border-slate-700' : 'border-slate-200',
                    icon: <span className={`text-lg font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{rank}</span>,
                    badge: isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                };
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                    <Trophy className="w-8 h-8 text-white" />
                </div>
                <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Leaderboard
                </h1>
                <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Top performers this month
                </p>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
                </div>
            ) : topUsers.length === 0 ? (
                <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <TrendingUp className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                    <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        No scores yet. Complete exams to appear here!
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {topUsers.map((leaderUser, index) => {
                        const style = getRankStyle(leaderUser.rank);
                        const isCurrentUser = leaderUser.id === currentUser?.id;

                        return (
                            <motion.div
                                key={leaderUser.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative p-4 rounded-xl border-2 transition-all ${style.bg} ${style.border} ${isCurrentUser ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                                    } ${isDark && isCurrentUser ? 'ring-offset-slate-900' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Rank */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.badge}`}>
                                        {leaderUser.rank <= 3 ? style.icon : leaderUser.rank}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                        {leaderUser.name?.charAt(0) || 'U'}
                                    </div>

                                    {/* Name & Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {leaderUser.name || 'Anonymous'}
                                            </h3>
                                            {isCurrentUser && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500 text-white rounded-full">
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
                                            <Star className={`w-4 h-4 ${leaderUser.rank === 1 ? 'text-yellow-500' : isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                            <span className={`text-xl font-bold ${leaderUser.rank === 1 ? 'text-yellow-500' :
                                                    isDark ? 'text-indigo-400' : 'text-indigo-600'
                                                }`}>
                                                {leaderUser.totalScore || 0}
                                            </span>
                                        </div>
                                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            points
                                        </p>
                                    </div>
                                </div>

                                {/* Top 3 Special Effects */}
                                {leaderUser.rank <= 3 && (
                                    <div className="absolute -top-1 -right-1">
                                        {leaderUser.rank === 1 && (
                                            <span className="text-2xl">🥇</span>
                                        )}
                                        {leaderUser.rank === 2 && (
                                            <span className="text-2xl">🥈</span>
                                        )}
                                        {leaderUser.rank === 3 && (
                                            <span className="text-2xl">🥉</span>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Footer Note */}
            <p className={`text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Rankings update in real-time • Complete exams to earn points
            </p>
        </div>
    );
};

export default Leaderboard;
