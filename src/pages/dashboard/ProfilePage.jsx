import React, { useState, useEffect } from 'react';
import { User, Building2, CreditCard, Calendar, Clock, Mail, Shield, BookOpen, Flame, Target, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

// Animated Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 10, color = '#6366f1' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{progress}%</span>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [animatedStreak, setAnimatedStreak] = useState(0);

    // Real streak from Firestore (defaults to 0)
    const streak = user?.streak || 0;
    useEffect(() => {
        let count = 0;
        const target = Math.min(streak, 30); // Cap animation at 30 for performance
        if (target === 0) {
            setAnimatedStreak(0);
            return;
        }
        const interval = setInterval(() => {
            if (count < target) {
                count++;
                setAnimatedStreak(count);
            } else {
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [streak]);

    // Calculate days remaining if planExpiry exists
    const getDaysRemaining = () => {
        if (!user?.planExpiry) return null;
        const expiry = user.planExpiry.toDate ? user.planExpiry.toDate() : new Date(user.planExpiry);
        const now = new Date();
        const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const daysRemaining = getDaysRemaining();
    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;
    const isExpired = daysRemaining !== null && daysRemaining <= 0;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Real stats from Firestore
    const questionsAttempted = user?.questionsAttempted || 0;
    const totalScore = user?.totalScore || 0;
    const progressPercent = questionsAttempted > 0 ? Math.min(Math.round((totalScore / questionsAttempted) * 100), 100) : 0;

    const cardClass = `rounded-2xl border transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-indigo-100/50'}`;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>My Profile</h1>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>View and manage your account details</p>
                </div>
            </motion.div>

            {/* Profile Card with Streak */}
            <motion.div variants={itemVariants} className={`${cardClass} p-6 relative overflow-hidden`}>
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row gap-6 relative">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <motion.div
                            className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl ${user?.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30' :
                                user?.role === 'professor' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30' :
                                    'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'
                                }`}
                            whileHover={{ scale: 1.05, rotate: 3 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </motion.div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {user?.name || 'User'}
                            </h2>
                            <p className={`flex items-center gap-2 mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Mail className="w-4 h-4" />
                                {user?.email || 'N/A'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${user?.role === 'admin'
                                ? isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700'
                                : user?.role === 'professor'
                                    ? isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700'
                                    : isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                <Shield className="w-4 h-4" />
                                {(user?.role || 'student').charAt(0).toUpperCase() + (user?.role || 'student').slice(1)}
                            </span>

                            {user?.status && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${user.status === 'active'
                                    ? isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700'
                                    : isDark ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.status === 'active' ? '● Active' : '○ Inactive'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Streak Counter */}
                    <motion.div
                        className={`flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl ${isDark ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200'}`}
                        whileHover={{ scale: 1.02 }}
                    >
                        <motion.div
                            className="text-4xl font-bold text-orange-500"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                            <Flame className="w-8 h-8 inline-block mr-1" />
                            {animatedStreak}
                        </motion.div>
                        <p className={`text-sm font-medium mt-1 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>Day Streak</p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Progress Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Progress Ring */}
                <motion.div variants={itemVariants} className={`${cardClass} p-6 flex flex-col items-center justify-center`}>
                    <ProgressRing progress={progressPercent} color={isDark ? '#818cf8' : '#6366f1'} />
                    <p className={`mt-4 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Accuracy Rate</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{questionsAttempted} questions attempted</p>
                </motion.div>

                {/* Quick Stats */}
                <motion.div variants={itemVariants} className={`${cardClass} p-6`}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                                <Target className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{questionsAttempted}</p>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Questions Attempted</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                <TrendingUp className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.totalScore || 0}</p>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Score</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Achievements */}
                <motion.div variants={itemVariants} className={`${cardClass} p-6`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Award className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Achievements</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <motion.span
                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}
                            whileHover={{ scale: 1.05 }}
                        >
                            🔥 7 Day Streak
                        </motion.span>
                        <motion.span
                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}
                            whileHover={{ scale: 1.05 }}
                        >
                            📚 First Quiz
                        </motion.span>
                    </div>
                </motion.div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Institute Info */}
                <motion.div variants={itemVariants} className={`${cardClass} p-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                            <Building2 className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Institute</p>
                            <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {user?.institute || 'Not Assigned'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Plan Info */}
                <motion.div variants={itemVariants} className={`${cardClass} p-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                            <CreditCard className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subscription Plan</p>
                            <p className={`text-lg font-semibold mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {user?.plan || 'Free'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Plan Duration */}
                <motion.div variants={itemVariants} className={`${cardClass} p-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                            <Calendar className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Plan Valid Until</p>
                            <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {formatDate(user?.planExpiry)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Days Remaining */}
                <motion.div variants={itemVariants} className={`${cardClass} p-6 ${isExpired ? isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200' : isExpiringSoon ? isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200' : ''}`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isExpired ? isDark ? 'bg-red-500/20' : 'bg-red-100' : isExpiringSoon ? isDark ? 'bg-amber-500/20' : 'bg-amber-100' : isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                            }`}>
                            <Clock className={`w-6 h-6 ${isExpired ? isDark ? 'text-red-400' : 'text-red-600' : isExpiringSoon ? isDark ? 'text-amber-400' : 'text-amber-600' : isDark ? 'text-blue-400' : 'text-blue-600'
                                }`} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Days Remaining</p>
                            <p className={`text-lg font-semibold mt-1 ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-500' : isDark ? 'text-white' : 'text-slate-900'
                                }`}>
                                {isExpired ? 'Expired' :
                                    daysRemaining !== null ? `${daysRemaining} days` : 'Unlimited'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Allowed Subjects */}
            {user?.allowedSubjects && user.allowedSubjects.length > 0 && (
                <motion.div variants={itemVariants} className={`${cardClass} p-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                            <BookOpen className={`w-6 h-6 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Allowed Subjects</p>
                            <div className="flex flex-wrap gap-2">
                                {user.allowedSubjects.map(subject => (
                                    <motion.span
                                        key={subject}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize ${isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {subject}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Account Info */}
            <motion.div variants={itemVariants} className={`${cardClass} p-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50/50'}`}>
                <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Account ID: {user?.uid || 'N/A'} •
                    Member since: {formatDate(user?.createdAt)}
                </p>
            </motion.div>
        </motion.div>
    );
};

export default ProfilePage;
