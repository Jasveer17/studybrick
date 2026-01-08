import React, { useState, useEffect, useRef } from 'react';
import { User, Building2, CreditCard, Calendar, Clock, Mail, Shield, BookOpen, Flame, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'sonner';

// Apple-style Info Card Component - no hover translate
const InfoCard = ({ icon: Icon, label, value, iconColor, iconBg }) => {
    const { isDark } = useTheme();

    return (
        <div className={`group relative overflow-hidden rounded-2xl p-5 transition-colors duration-150 ${isDark
            ? 'bg-[#151b27] border border-white/[0.06] hover:border-white/[0.1]'
            : 'bg-white border border-neutral-200/50 hover:border-indigo-200 hover:bg-neutral-50/30'
            }`}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${iconBg}`}>
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
    const { user, refreshUser } = useAuth();
    const { isDark } = useTheme();
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    // Real streak from Firestore (defaults to 0) - displayed instantly, no animation
    const streak = user?.streak || 0;

    // Handle profile picture upload
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB');
            return;
        }

        setIsUploadingAvatar(true);
        try {
            // Convert to base64 for simple storage
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;

                // Update Firestore
                const userRef = doc(db, 'users', user.firestoreId);
                await updateDoc(userRef, {
                    profilePicture: base64String
                });

                toast.success('Profile picture updated!');
                if (refreshUser) refreshUser();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to update profile picture');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

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

    const getRoleGradient = () => {
        if (user?.role === 'admin') return 'from-purple-500 to-indigo-600';
        if (user?.role === 'professor') return 'from-blue-500 to-cyan-600';
        return 'from-indigo-500 to-purple-600';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Hidden file input for avatar upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
            />

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
                    {/* Premium Avatar with Upload Button */}
                    <div className="flex-shrink-0">
                        <div className="relative group">
                            <div className={`absolute -inset-1 bg-gradient-to-br ${getRoleGradient()} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />

                            {/* Avatar - Click to upload */}
                            <button
                                onClick={handleAvatarClick}
                                disabled={isUploadingAvatar}
                                className={`relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br ${getRoleGradient()} flex items-center justify-center text-white text-3xl font-bold shadow-xl cursor-pointer transition-opacity duration-150 hover:opacity-90`}
                            >
                                {isUploadingAvatar ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt="Profile"
                                        className="w-full h-full object-cover object-top"
                                    />
                                ) : (
                                    user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'
                                )}

                                {/* Hover overlay with camera icon */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </button>

                            {/* Online indicator */}
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 ${isDark ? 'border-[#151b27]' : 'border-white'}`} />
                        </div>
                        <p className={`text-xs text-center mt-2 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Click to change
                        </p>
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

                    {/* Premium Streak Counter - Login Streak */}
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
                                        {streak}
                                    </span>
                                </div>
                                <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                                    Day Streak
                                </p>
                                <p className={`text-xs mt-1 ${isDark ? 'text-orange-400/60' : 'text-orange-500/70'}`}>
                                    Keep visiting daily!
                                </p>
                            </div>
                        </div>
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
                <div className={`group relative overflow-hidden rounded-2xl p-5 transition-colors duration-150 ${isExpired
                    ? isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                    : isExpiringSoon
                        ? isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'
                        : isDark ? 'bg-[#151b27] border border-white/[0.06] hover:border-white/[0.1]' : 'bg-white border border-neutral-200/50 hover:border-indigo-200 hover:bg-neutral-50/30'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl transition-transform duration-200 ${isExpired
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
