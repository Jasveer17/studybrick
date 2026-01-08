import React, { useState, useRef, useCallback } from 'react';
import { User, Building2, CreditCard, Calendar, Mail, Shield, Camera, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'sonner';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Simple Info Card - Apple style
const InfoCard = ({ icon: Icon, label, value }) => {
    const { isDark } = useTheme();

    return (
        <div className={`p-4 rounded-lg border ${isDark
            ? 'bg-[#1c1c1e] border-[#3a3a3c]'
            : 'bg-white border-[#e8e8ed]'
            }`}>
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isDark ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`} />
                <div className="flex-1 min-w-0">
                    <p className={`text-[11px] uppercase tracking-wide ${isDark ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`}>
                        {label}
                    </p>
                    <p className={`text-[15px] font-medium mt-0.5 truncate ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
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

    // Crop state
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 80, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [scale, setScale] = useState(1);
    const imgRef = useRef(null);

    // Handle profile picture upload - Open crop modal first
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB for cropping, will be compressed)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Read file and open crop modal
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setShowCropModal(true);
            setScale(1);
            setCrop({ unit: '%', width: 80, aspect: 1 });
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again
        e.target.value = '';
    };

    // Get cropped image as base64
    const getCroppedImg = useCallback(() => {
        if (!completedCrop || !imgRef.current) return null;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Output size (200x200 for profile)
        const outputSize = 200;
        canvas.width = outputSize;
        canvas.height = outputSize;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            outputSize,
            outputSize
        );

        return canvas.toDataURL('image/jpeg', 0.85);
    }, [completedCrop]);

    // Save cropped image
    const handleSaveCroppedImage = async () => {
        const croppedImage = getCroppedImg();
        if (!croppedImage) {
            toast.error('Please select a crop area');
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const userRef = doc(db, 'users', user.firestoreId);
            await updateDoc(userRef, {
                profilePicture: croppedImage
            });

            toast.success('Profile picture updated!');
            setShowCropModal(false);
            setImageSrc(null);
            if (refreshUser) refreshUser();
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to update profile picture');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Cancel crop
    const handleCancelCrop = () => {
        setShowCropModal(false);
        setImageSrc(null);
        setScale(1);
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

            {/* Header - Simplified */}
            <div className="mb-6">
                <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
                    Profile
                </h1>
                <p className={`text-[13px] mt-1 ${isDark ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`}>
                    Account information
                </p>
            </div>

            {/* Profile Card - Simple without streak */}
            <div className={`rounded-lg border p-5 ${isDark ? 'bg-[#1c1c1e] border-[#3a3a3c]' : 'bg-white border-[#e8e8ed]'}`}>
                <div className="flex flex-col md:flex-row gap-5">
                    {/* Avatar with Upload */}
                    <div className="flex-shrink-0">
                        <div className="relative group">
                            <button
                                onClick={handleAvatarClick}
                                disabled={isUploadingAvatar}
                                className={`relative w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center text-xl font-medium cursor-pointer transition-opacity duration-120 bg-[#5B6EAE] text-white`}
                            >
                                {isUploadingAvatar ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user?.name?.charAt(0) || 'U'
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-120">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </button>
                        </div>
                        <p className={`text-[11px] text-center mt-1.5 ${isDark ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`}>
                            Change photo
                        </p>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-3">
                        <div>
                            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
                                {user?.name || 'User'}
                            </h2>
                            <p className={`flex items-center gap-1.5 text-[13px] mt-0.5 ${isDark ? 'text-[#8e8e93]' : 'text-[#636366]'}`}>
                                <Mail className="w-3.5 h-3.5" />
                                {user?.email || 'N/A'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium ${isDark ? 'bg-[#2c2c2e] text-[#aeaeb2]' : 'bg-[#f5f5f7] text-[#636366]'}`}>
                                <Shield className="w-3.5 h-3.5" />
                                {(user?.role || 'student').charAt(0).toUpperCase() + (user?.role || 'student').slice(1)}
                            </span>

                            {user?.status && (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium ${user.status === 'active' ? 'text-[#22c55e]' : 'text-[#ef4444]'} ${isDark ? 'bg-[#2c2c2e]' : 'bg-[#f5f5f7]'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
                                    {user.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid - Simplified */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoCard
                    icon={Building2}
                    label="Institute"
                    value={user?.institute || 'Not Assigned'}
                />
                <InfoCard
                    icon={CreditCard}
                    label="Subscription Plan"
                    value={(user?.plan || 'Free').charAt(0).toUpperCase() + (user?.plan || 'Free').slice(1)}
                />
                <InfoCard
                    icon={Calendar}
                    label="Plan Valid Until"
                    value={formatDate(user?.planExpiry)}
                />

                {/* Days Remaining - Simple text */}
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1c1c1e] border-[#3a3a3c]' : 'bg-white border-[#e8e8ed]'}`}>
                    <div className="flex items-center gap-3">
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`} />
                        <div className="flex-1 min-w-0">
                            <p className={`text-[11px] uppercase tracking-wide ${isDark ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`}>
                                Days Remaining
                            </p>
                            <p className={`text-[15px] font-medium mt-0.5 ${isExpired ? 'text-[#ef4444]' : isExpiringSoon ? 'text-[#eab308]' : isDark ? 'text-white' : 'text-[#1c1c1e]'}`}>
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

            {/* Image Crop Modal */}
            {showCropModal && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={handleCancelCrop}
                    />

                    {/* Modal */}
                    <div className={`relative w-full max-w-md rounded-xl overflow-hidden ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
                        {/* Header */}
                        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-[#3a3a3c]' : 'border-[#e8e8ed]'}`}>
                            <h3 className={`text-[15px] font-semibold ${isDark ? 'text-[#F5F5F7]' : 'text-[#1c1c1e]'}`}>
                                Crop Photo
                            </h3>
                            <button
                                onClick={handleCancelCrop}
                                className={`p-1.5 rounded-md transition-colors duration-100 ${isDark ? 'hover:bg-[#2c2c2e] text-[#8e8e93]' : 'hover:bg-[#f5f5f7] text-[#636366]'}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Crop Area */}
                        <div className="p-4">
                            <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-[#0B0B0B]' : 'bg-[#f5f5f7]'}`}>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    circularCrop
                                >
                                    <img
                                        ref={imgRef}
                                        src={imageSrc}
                                        alt="Crop preview"
                                        style={{
                                            maxHeight: '300px',
                                            width: '100%',
                                            objectFit: 'contain',
                                            transform: `scale(${scale})`
                                        }}
                                    />
                                </ReactCrop>
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <button
                                    onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                                    className={`p-2 rounded-lg transition-colors duration-100 ${isDark ? 'bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#F5F5F7]' : 'bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1c1c1e]'}`}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <span className={`text-[12px] font-medium min-w-[50px] text-center ${isDark ? 'text-[#A1A1A6]' : 'text-[#636366]'}`}>
                                    {Math.round(scale * 100)}%
                                </span>
                                <button
                                    onClick={() => setScale(Math.min(3, scale + 0.1))}
                                    className={`p-2 rounded-lg transition-colors duration-100 ${isDark ? 'bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#F5F5F7]' : 'bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1c1c1e]'}`}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={`flex gap-3 px-4 py-3 border-t ${isDark ? 'border-[#3a3a3c]' : 'border-[#e8e8ed]'}`}>
                            <button
                                onClick={handleCancelCrop}
                                className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-100 ${isDark ? 'bg-[#2c2c2e] text-[#F5F5F7] hover:bg-[#3a3a3c]' : 'bg-[#f5f5f7] text-[#1c1c1e] hover:bg-[#e8e8ed]'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCroppedImage}
                                disabled={isUploadingAvatar}
                                className="flex-1 py-2.5 bg-[#5B6EAE] hover:bg-[#4a5a94] text-white rounded-lg text-[13px] font-medium transition-colors duration-100 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isUploadingAvatar ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
