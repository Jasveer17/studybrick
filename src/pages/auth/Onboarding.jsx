import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User, GraduationCap, Building2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const Onboarding = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        role: '',
        gender: '',
        age: '',
        institute: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error('Please enter your name');
            return;
        }
        if (!formData.role) {
            toast.error('Please select your role');
            return;
        }
        if (!formData.gender) {
            toast.error('Please select your gender');
            return;
        }
        if (!formData.age || formData.age < 10 || formData.age > 100) {
            toast.error('Please enter a valid age');
            return;
        }
        if (!formData.institute.trim()) {
            toast.error('Please enter your institute name');
            return;
        }

        setIsLoading(true);
        try {
            const userRef = doc(db, 'users', user.firestoreId);
            await updateDoc(userRef, {
                name: formData.name.trim(),
                role: formData.role,
                gender: formData.gender,
                age: parseInt(formData.age),
                institute: formData.institute.trim(),
                profileComplete: true,
                totalScore: 0,
                streak: 0,
                questionsAttempted: 0,
                updatedAt: serverTimestamp()
            });

            toast.success('Profile completed successfully!');

            if (formData.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard/exam-engine');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const RoleCard = ({ value, icon: Icon, title, description, selected }) => (
        <button
            type="button"
            onClick={() => setFormData({ ...formData, role: value })}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${selected
                ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-500/15'
                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md'
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${selected
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-neutral-100 text-neutral-500'
                    }`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className={`font-semibold ${selected ? 'text-indigo-700' : 'text-neutral-900'}`}>{title}</p>
                    <p className="text-sm text-neutral-500">{description}</p>
                </div>
            </div>
        </button>
    );

    const GenderOption = ({ value, label, emoji }) => (
        <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: value })}
            className={`flex-1 py-3.5 px-4 rounded-xl border-2 text-center font-medium transition-all duration-200 ${formData.gender === value
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
        >
            <span className="text-lg mr-1">{emoji}</span> {label}
        </button>
    );

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Premium Gradient Background */}
            <div className="absolute inset-0 bg-[#0a0d12]">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[128px]" />
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[128px]" />
                </div>

                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '64px 64px'
                    }}
                />
            </div>

            {/* Main Card */}
            <div className="w-full max-w-lg relative z-10">
                <div className="absolute -inset-px bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-3xl" />
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 rounded-3xl blur-xl" />

                <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="relative inline-block mb-5">
                                <div className="w-20 h-20 flex items-center justify-center">
                                    <img src="/logo.png" alt="StudyBrick" className="w-full h-full object-contain drop-shadow-2xl" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900">Complete Your Profile</h1>
                            <p className="text-neutral-500 mt-1">Tell us a bit about yourself</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-neutral-700">I am a...</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <RoleCard
                                        value="student"
                                        icon={GraduationCap}
                                        title="Student"
                                        description="I'm here to learn and practice"
                                        selected={formData.role === 'student'}
                                    />
                                    <RoleCard
                                        value="professor"
                                        icon={User}
                                        title="Professor / Teacher"
                                        description="I'm here to create tests and teach"
                                        selected={formData.role === 'professor'}
                                    />
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-neutral-50 border-2 border-neutral-200 hover:border-neutral-300 rounded-xl py-3.5 pl-12 pr-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Gender</label>
                                <div className="flex gap-3">
                                    <GenderOption value="male" label="Male" emoji="👨" />
                                    <GenderOption value="female" label="Female" emoji="👩" />
                                    <GenderOption value="other" label="Other" emoji="🧑" />
                                </div>
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Age</label>
                                <input
                                    type="number"
                                    placeholder="Enter your age"
                                    min="10"
                                    max="100"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full bg-neutral-50 border-2 border-neutral-200 hover:border-neutral-300 rounded-xl py-3.5 px-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>

                            {/* Institute */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700">Institute / School / College</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Enter your institute name"
                                        value={formData.institute}
                                        onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                                        className="w-full bg-neutral-50 border-2 border-neutral-200 hover:border-neutral-300 rounded-xl py-3.5 pl-12 pr-4 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative group bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-xl shadow-indigo-500/25"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                <span className="relative flex items-center gap-2">
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Complete Setup
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Toaster position="top-center" richColors theme="dark" />
        </div>
    );
};

export default Onboarding;
