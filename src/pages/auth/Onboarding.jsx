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
            // Update user profile in Firestore
            const userRef = doc(db, 'users', user.firestoreId);
            await updateDoc(userRef, {
                name: formData.name.trim(),
                role: formData.role,
                gender: formData.gender,
                age: parseInt(formData.age),
                institute: formData.institute.trim(),
                profileComplete: true,
                // Initialize real stats
                totalScore: 0,
                streak: 0,
                questionsAttempted: 0,
                updatedAt: serverTimestamp()
            });

            toast.success('Profile completed successfully!');

            // Navigate based on role
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
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${selected
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${selected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className={`font-semibold ${selected ? 'text-indigo-700' : 'text-slate-900'}`}>{title}</p>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
        </button>
    );

    const GenderOption = ({ value, label, emoji }) => (
        <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: value })}
            className={`flex-1 py-3 px-4 rounded-xl border-2 text-center font-medium transition-all duration-200 ${formData.gender === value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
        >
            <span className="text-lg mr-1">{emoji}</span> {label}
        </button>
    );

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-500/30 via-transparent to-transparent" />
            </div>

            {/* Static orbs */}
            <div className="absolute top-20 left-[15%] w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]" />

            {/* Main card */}
            <div className="w-full max-w-lg relative z-10 animate-fade-in">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-2xl" />

                <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Complete Your Profile</h1>
                        <p className="text-slate-500 mt-1">Tell us a bit about yourself</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">I am a...</label>
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
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Gender</label>
                            <div className="flex gap-3">
                                <GenderOption value="male" label="Male" emoji="👨" />
                                <GenderOption value="female" label="Female" emoji="👩" />
                                <GenderOption value="other" label="Other" emoji="🧑" />
                            </div>
                        </div>

                        {/* Age */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Age</label>
                            <input
                                type="number"
                                placeholder="Enter your age"
                                min="10"
                                max="100"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                            />
                        </div>

                        {/* Institute */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Institute / School / College</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter your institute name"
                                    value={formData.institute}
                                    onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Complete Setup
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <Toaster position="top-center" richColors />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Onboarding;
