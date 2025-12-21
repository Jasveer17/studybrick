import React from 'react';
import { User, Building2, CreditCard, Calendar, Clock, Mail, Shield, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ProfilePage = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();

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

    const cardClass = `rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>My Profile</h1>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>View and manage your account details</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className={`${cardClass} p-6`}>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg ${user?.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                            user?.role === 'professor' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                'bg-gradient-to-br from-emerald-500 to-teal-600'
                            }`}>
                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
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
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${user?.role === 'admin'
                                ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                                : user?.role === 'professor'
                                    ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                                    : isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                <Shield className="w-4 h-4" />
                                {(user?.role || 'student').charAt(0).toUpperCase() + (user?.role || 'student').slice(1)}
                            </span>

                            {user?.status && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${user.status === 'active'
                                    ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                                    : isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.status === 'active' ? '● Active' : '○ Inactive'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Institute Info */}
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                            <Building2 className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Institute</p>
                            <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {user?.institute || 'Not Assigned'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plan Info */}
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
                            <CreditCard className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subscription Plan</p>
                            <p className={`text-lg font-semibold mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {user?.plan || 'Free'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plan Duration */}
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
                            <Calendar className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Plan Valid Until</p>
                            <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {formatDate(user?.planExpiry)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Days Remaining */}
                <div className={`${cardClass} p-6 ${isExpired ? isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200' : isExpiringSoon ? isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200' : ''}`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isExpired ? isDark ? 'bg-red-900/50' : 'bg-red-100' : isExpiringSoon ? isDark ? 'bg-amber-900/50' : 'bg-amber-100' : isDark ? 'bg-blue-900/50' : 'bg-blue-100'
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
                </div>
            </div>

            {/* Allowed Subjects */}
            {user?.allowedSubjects && user.allowedSubjects.length > 0 && (
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-violet-900/50' : 'bg-violet-100'}`}>
                            <BookOpen className={`w-6 h-6 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Allowed Subjects</p>
                            <div className="flex flex-wrap gap-2">
                                {user.allowedSubjects.map(subject => (
                                    <span
                                        key={subject}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${isDark ? 'bg-violet-900/50 text-violet-300' : 'bg-violet-100 text-violet-700'}`}
                                    >
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Info */}
            <div className={`${cardClass} p-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Account ID: {user?.uid || 'N/A'} •
                    Member since: {formatDate(user?.createdAt)}
                </p>
            </div>
        </div>
    );
};

export default ProfilePage;
