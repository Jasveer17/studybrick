import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { User, Lock, Loader2, ArrowRight, AlertCircle, Sparkles, Mail, X, CheckCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Google Icon SVG Component
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const Login = () => {
    const [formData, setFormData] = useState({ id: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.id || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const user = await login(formData.id, formData.password);
            toast.success(`Welcome back, ${user.name || user.displayName || 'User'}!`);

            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard/exam-engine');
            }
        } catch (error) {
            console.error("Login error:", error);
            setError('Invalid ID or Password. Please try again.');
            toast.error('Invalid ID or Password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsGoogleLoading(true);
        try {
            const user = await loginWithGoogle();
            toast.success(`Welcome, ${user.name || 'there'}!`);

            // Check if new user needs onboarding
            if (user.isNewUser || user.profileComplete === false) {
                navigate('/onboarding');
            } else if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard/exam-engine');
            }
        } catch (error) {
            console.error("Google Sign-In error:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                toast.info('Sign-in cancelled');
            } else {
                setError('Google sign-in failed. Please try again.');
                toast.error('Google sign-in failed');
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            toast.error('Please enter your email address');
            return;
        }

        setIsSendingReset(true);
        try {
            await sendPasswordResetEmail(auth, forgotEmail);
            setResetSent(true);
            toast.success('Password reset email sent!');
        } catch (error) {
            console.error("Password reset error:", error);
            if (error.code === 'auth/user-not-found') {
                toast.error('No account found with this email');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('Please enter a valid email address');
            } else {
                toast.error('Failed to send reset email. Please try again.');
            }
        } finally {
            setIsSendingReset(false);
        }
    };

    const closeForgotPassword = () => {
        setShowForgotPassword(false);
        setForgotEmail('');
        setResetSent(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Static Gradient Background - No animation for better performance */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-500/30 via-transparent to-transparent" />
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-500/30 via-transparent to-transparent" />
                </div>
            </div>

            {/* Static Orbs - Pure CSS, no JS animations */}
            <div className="absolute top-20 left-[15%] w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-[60%] w-48 h-48 bg-purple-500/15 rounded-full blur-[80px]" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNNDAgMEgwdjQwaDQwVjB6TTEgMWgzOHYzOEgxVjF6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />

            {/* Login Card - Simple fade in */}
            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Subtle glow behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-2xl" />

                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
                    {/* Logo & Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/40 hover:scale-105 transition-transform duration-300">
                            <img src="/logo.png" alt="StudyBrick Logo" className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500 mt-1 text-sm flex items-center gap-1">
                            Sign in to your StudyBrick account
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        </p>
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full mb-6 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <GoogleIcon />
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-400 font-medium">or sign in with ID</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* User ID */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">User ID</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors duration-150 group-focus-within:text-indigo-500" />
                                <input
                                    type="text"
                                    className="w-full bg-slate-50/80 border-2 border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10 transition-all duration-150"
                                    placeholder="Enter your ID"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors duration-150 group-focus-within:text-indigo-500" />
                                <input
                                    type="password"
                                    className="w-full bg-slate-50/80 border-2 border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:shadow-lg focus:shadow-indigo-500/10 transition-all duration-150"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || isGoogleLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm mt-6">
                        Don't have an account? <span className="text-indigo-600 font-medium cursor-pointer hover:text-indigo-700 transition-colors">Contact admin</span>
                    </p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={closeForgotPassword}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
                        {/* Close button */}
                        <button
                            onClick={closeForgotPassword}
                            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {!resetSent ? (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Reset Password</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Enter your email to receive a reset link
                                    </p>
                                </div>

                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSendingReset}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {isSendingReset ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Check Your Email</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    We've sent a password reset link to <br />
                                    <span className="font-medium text-slate-700">{forgotEmail}</span>
                                </p>
                                <button
                                    onClick={closeForgotPassword}
                                    className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Toaster position="top-center" richColors />

            {/* Inline Styles for animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scaleIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;
