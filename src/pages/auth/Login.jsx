import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { User, Lock, Loader2, ArrowRight, AlertCircle, Mail, X, CheckCircle, Sparkles } from 'lucide-react';
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
            {/* Premium Gradient Background */}
            <div className="absolute inset-0 bg-[#0a0d12]">
                {/* Gradient Mesh Effect */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[80px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-[60px]" />
                </div>

                {/* Subtle Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '64px 64px'
                    }}
                />

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.012]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md relative z-10">
                {/* Card Glow */}
                <div className="absolute -inset-px bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-3xl" />
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 rounded-3xl blur-xl" />

                <div className="relative bg-[#12171f]/90 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden">
                    {/* Card Header Gradient Line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                    <div className="p-8">
                        {/* Logo & Header */}
                        <div className="flex flex-col items-center mb-8">
                            {/* Premium Logo */}
                            <div className="mb-5">
                                <div className="w-20 h-20 flex items-center justify-center">
                                    <img src="/logo.png" alt="StudyBrick Logo" className="w-full h-full object-contain drop-shadow-2xl" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
                            <p className="text-neutral-400 mt-2 text-sm">
                                Sign in to your StudyBrick account
                            </p>
                        </div>

                        {/* Google Sign-In Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading || isLoading}
                            className="w-full mb-6 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
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
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-[#12171f] text-neutral-500 text-sm font-medium">
                                    or sign in with ID
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* User ID */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-300">User ID</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 transition-colors duration-150 group-focus-within:text-indigo-400" />
                                    <input
                                        type="text"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.12] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20 transition-all duration-150"
                                        placeholder="Enter your ID"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-neutral-300">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 transition-colors duration-150 group-focus-within:text-indigo-400" />
                                    <input
                                        type="password"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.12] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20 transition-all duration-150"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-in">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || isGoogleLoading}
                                className="w-full relative group bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                {/* Button shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                {/* Button glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

                                {/* Inner shadow for depth */}
                                <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" />

                                <span className="relative flex items-center gap-2">
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        <p className="text-center text-neutral-500 text-sm mt-6">
                            Don't have an account?{' '}
                            <span className="text-indigo-400 font-medium cursor-pointer hover:text-indigo-300 transition-colors">
                                Contact admin
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={closeForgotPassword}
                    />

                    {/* Modal */}
                    <div className="relative bg-[#12171f] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/50 animate-scale-in">
                        {/* Close button */}
                        <button
                            onClick={closeForgotPassword}
                            className="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {!resetSent ? (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Reset Password</h3>
                                    <p className="text-sm text-neutral-400 mt-1">
                                        Enter your email to receive a reset link
                                    </p>
                                </div>

                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSendingReset}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Check Your Email</h3>
                                <p className="text-sm text-neutral-400 mt-2">
                                    We've sent a password reset link to <br />
                                    <span className="font-medium text-neutral-300">{forgotEmail}</span>
                                </p>
                                <button
                                    onClick={closeForgotPassword}
                                    className="mt-6 w-full bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-xl transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer Links */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-sm z-10">
                <Link to="/privacy-policy" className="text-neutral-500 hover:text-neutral-300 transition-colors">
                    Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="text-neutral-500 hover:text-neutral-300 transition-colors">
                    Terms of Service
                </Link>
            </div>

            <Toaster position="top-center" richColors theme="dark" />

            {/* Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.96); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scaleIn 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;
