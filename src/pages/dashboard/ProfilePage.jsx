import React from 'react';
import { User, Building2, CreditCard, Calendar, Clock, Mail, Shield, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';

const ProfilePage = () => {
    const { user } = useAuth();

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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500">View and manage your account details</p>
                </div>
            </div>

            {/* Profile Card */}
            <Card className="p-6">
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
                            <h2 className="text-2xl font-bold text-slate-900">
                                {user?.name || 'User'}
                            </h2>
                            <p className="text-slate-500 flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4" />
                                {user?.email || 'N/A'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                    user?.role === 'professor' ? 'bg-blue-100 text-blue-700' :
                                        'bg-emerald-100 text-emerald-700'
                                }`}>
                                <Shield className="w-4 h-4" />
                                {(user?.role || 'student').charAt(0).toUpperCase() + (user?.role || 'student').slice(1)}
                            </span>

                            {user?.status && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.status === 'active' ? '● Active' : '○ Inactive'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Institute Info */}
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <Building2 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Institute</p>
                            <p className="text-lg font-semibold text-slate-900 mt-1">
                                {user?.institute || 'Not Assigned'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Plan Info */}
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-100 rounded-xl">
                            <CreditCard className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Subscription Plan</p>
                            <p className="text-lg font-semibold text-slate-900 mt-1 capitalize">
                                {user?.plan || 'Free'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Plan Duration */}
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <Calendar className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Plan Valid Until</p>
                            <p className="text-lg font-semibold text-slate-900 mt-1">
                                {formatDate(user?.planExpiry)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Days Remaining */}
                <Card className={`p-6 ${isExpired ? 'bg-red-50 border-red-200' : isExpiringSoon ? 'bg-amber-50 border-amber-200' : ''}`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isExpired ? 'bg-red-100' : isExpiringSoon ? 'bg-amber-100' : 'bg-blue-100'
                            }`}>
                            <Clock className={`w-6 h-6 ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-blue-600'
                                }`} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Days Remaining</p>
                            <p className={`text-lg font-semibold mt-1 ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-900'
                                }`}>
                                {isExpired ? 'Expired' :
                                    daysRemaining !== null ? `${daysRemaining} days` : 'Unlimited'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Allowed Subjects */}
            {user?.allowedSubjects && user.allowedSubjects.length > 0 && (
                <Card className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-violet-100 rounded-xl">
                            <BookOpen className="w-6 h-6 text-violet-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-500 font-medium mb-3">Allowed Subjects</p>
                            <div className="flex flex-wrap gap-2">
                                {user.allowedSubjects.map(subject => (
                                    <span
                                        key={subject}
                                        className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium capitalize"
                                    >
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Account Info */}
            <Card className="p-6 bg-slate-50">
                <p className="text-xs text-slate-400 text-center">
                    Account ID: {user?.uid || 'N/A'} •
                    Member since: {formatDate(user?.createdAt)}
                </p>
            </Card>
        </div>
    );
};

export default ProfilePage;
