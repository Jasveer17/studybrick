import React, { useState, useEffect } from 'react';
import { User, Building2, CreditCard, Calendar, Clock, Mail, Shield, BookOpen, Flame, Target, TrendingUp, Award, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Premium Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 10, color = '#6366f1' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-neutral-200 dark:text-neutral-700"
                />
                {/* Progress ring with gradient effect */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))'
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{progress}%</span>
                <span className="text-xs text-neutral-500 font-medium">Accuracy</span>
            </div>
        </div>
    );
};

// Premium Info Card Component
const InfoCard = ({ icon: Icon, label, value, iconColor, iconBg }) => {
    const { isDark } = useTheme();

    return (
        <div className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 ${isDark
                ? 'bg-[#151b27] border border-white/[0.06] hover:border-white/[0.1]'
                : 'bg-white border border-neutral-200/50 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50'
            }`}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {label}
                    </p>
                    <p className={`text-lg font-bold mt-1 truncate ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {value}
                    </p>
                </div>
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
        const target = Math.min(streak, 30);
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
        }, 80);
        return () => clearInterval(interval);
    }, [streak]);

    // Calculate days remaining
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
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Real stats
    const questionsAttempted = user?.questionsAttempted || 0;
    const totalScore = user?.totalScore || 0;
    const progressPercent = questionsAttempted > 0 ? Math.min(Math.round((totalScore / questionsAttempted) * 100), 100) : 0;

    const getRoleGradient = () => {
        if (user?.role === 'admin') return 'from-purple-500 to-indigo-600';
        if (user?.role === 'professor') return 'from-blue-500 to-cyan-600';
        return 'from-indigo-500 to-purple-600';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                            <User className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <span className={`text-sm font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            Profile
                        </span>
                    </div>
                    <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        My Profile
                    </h1>
                    <p className={`mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        View and manage your account details
                    </p>
                </div>
            </div>

            {/* Profile Card with Streak */}
            <div className={`relative overflow-hidden rounded-2xl p-6 ${isDark
                    ? 'bg-[#151b27] border border-white/[0.06]'
                    : 'bg-white border border-neutral-200/50 shadow-sm'
                }`}>
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-6 relative">
                    {/* Premium Avatar */}
                    <div className="flex-shrink-0">
                        <div className="relative group">
                            <div className={`absolute -inset-1 bg-gradient-to-br ${getRoleGradient()} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />
                            <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${getRoleGradient()} flex items-center justify-center text-white text-3xl font-bold shadow-xl`}>
                                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </div>
                            {/* Online indicator */}
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 ${isDark ? 'border-[#151b27]' : 'border-white'}`} />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                {user?.name || 'User'}
                            </h2>
                            <p className={`flex items-center gap-2 mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
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
                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    {user.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Premium Streak Counter */}
                    <div className="flex-shrink-0">
                        <div className={`relative overflow-hidden rounded-2xl p-5 text-center ${isDark
                                ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30'
                                : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200'
                            }`}>
                            {/* Fire glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent" />

                            <div className="relative">
                                <div className="flex items-center justify-center gap-2">
                                    <Flame className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                                    <span className={`text-4xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                        {animatedStreak}
                                    </span>
                                </div>
                                <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                                    Day Streak
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Progress Ring Card */}
                <div className={`relative overflow-hidden rounded-2xl p-6 flex flex-col items-center justify-center ${isDark
                        ? 'bg-[#151b27] border border-white/[0.06]'
                        : 'bg-white border border-neutral-200/50 shadow-sm'
                    }`}>
                    <ProgressRing progress={progressPercent} color={isDark ? '#818cf8' : '#6366f1'} />
                    <p className={`mt-4 font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        Accuracy Rate
                    </p>
                    <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {questionsAttempted} questions attempted
                    </p>
                </div>

                {/* Quick Stats Card */}
                <div className={`rounded-2xl p-6 ${isDark
                        ? 'bg-[#151b27] border border-white/[0.06]'
                        : 'bg-white border border-neutral-200/50 shadow-sm'
                    }`}>
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                                <Target className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                    {questionsAttempted}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                    Questions Attempted
                                </p>
                            </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />

                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                <TrendingUp className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                    {totalScore}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                    Total Score
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Card */}
                <div className={`rounded-2xl p-6 ${isDark
                        ? 'bg-[#151b27] border border-white/[0.06]'
                        : 'bg-white border border-neutral-200/50 shadow-sm'
                    }`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Award className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                            Achievements
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-105 cursor-default ${isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                            }`}>
                            <Flame className="w-4 h-4" />
                            7 Day Streak
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-105 cursor-default ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                            <Star className="w-4 h-4" />
                            First Quiz
                        </span>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoCard
                    icon={Building2}
                    label="Institute"
                    value={user?.institute || 'Not Assigned'}
                    iconColor={isDark ? 'text-indigo-400' : 'text-indigo-600'}
                    iconBg={isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}
                />
                <InfoCard
                    icon={CreditCard}
                    label="Subscription Plan"
                    value={(user?.plan || 'Free').charAt(0).toUpperCase() + (user?.plan || 'Free').slice(1)}
                    iconColor={isDark ? 'text-amber-400' : 'text-amber-600'}
                    iconBg={isDark ? 'bg-amber-500/20' : 'bg-amber-100'}
                />
                <InfoCard
                    icon={Calendar}
                    label="Plan Valid Until"
                    value={formatDate(user?.planExpiry)}
                    iconColor={isDark ? 'text-emerald-400' : 'text-emerald-600'}
                    iconBg={isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
                />

                {/* Days Remaining - with expiry styling */}
                <div className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 ${isExpired
                        ? isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                        : isExpiringSoon
                            ? isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'
                            : isDark ? 'bg-[#151b27] border border-white/[0.06] hover:border-white/[0.1]' : 'bg-white border border-neutral-200/50 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl transition-transform duration-200 group-hover:scale-110 ${isExpired
                                ? isDark ? 'bg-red-500/20' : 'bg-red-100'
                                : isExpiringSoon
                                    ? isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                                    : isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                            }`}>
                            <Clock className={`w-5 h-5 ${isExpired
                                    ? isDark ? 'text-red-400' : 'text-red-600'
                                    : isExpiringSoon
                                        ? isDark ? 'text-amber-400' : 'text-amber-600'
                                        : isDark ? 'text-blue-400' : 'text-blue-600'
                                }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                Days Remaining
                            </p>
                            <p className={`text-lg font-bold mt-1 ${isExpired ? 'text-red-500'
                                    : isExpiringSoon ? 'text-amber-500'
                                        : isDark ? 'text-white' : 'text-neutral-900'
                                }`}>
                                {isExpired ? 'Expired' : daysRemaining !== null ? `${daysRemaining} days` : 'Unlimited'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Allowed Subjects */}
            {user?.allowedSubjects && user.allowedSubjects.length > 0 && (
                <div className={`rounded-2xl p-6 ${isDark
                        ? 'bg-[#151b27] border border-white/[0.06]'
                        : 'bg-white border border-neutral-200/50 shadow-sm'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                            <BookOpen className={`w-5 h-5 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                Allowed Subjects
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {user.allowedSubjects.map(subject => (
                                    <span
                                        key={subject}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-150 hover:scale-105 cursor-default ${isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'
                                            }`}
                                    >
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Info Footer */}
            <div className={`rounded-2xl p-4 ${isDark ? 'bg-[#151b27]/50 border border-white/[0.04]' : 'bg-neutral-50/50 border border-neutral-100'}`}>
                <p className={`text-xs text-center ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    Account ID: {user?.uid || 'N/A'} • Member since: {formatDate(user?.createdAt)}
                </p>
            </div>
        </div>
    );
};

export default ProfilePage;
