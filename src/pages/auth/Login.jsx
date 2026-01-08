import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { User, Lock, Loader2, AlertCircle, Mail, X, CheckCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Google Icon SVG Component
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] p-4">
            <Toaster position="top-center" />

            {/* Login Card - Apple style: clean, centered, minimal */}
            <div className="w-full max-w-[340px]">
                {/* Card */}
                <div className="bg-[#161616] rounded-xl border border-[#2A2A2A] p-6">
                    {/* Logo + Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 mx-auto mb-3">
                            <img src="/logo.png" alt="StudyBrick" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-[20px] font-semibold text-[#F5F5F7]">Sign in</h1>
                        <p className="text-[13px] text-[#A1A1A6] mt-1">
                            Welcome to StudyBrick
                        </p>
                    </div>

                    {/* Google Sign-In */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full bg-white hover:bg-[#F5F5F7] text-[#1c1c1e] font-medium text-[14px] py-2.5 rounded-lg flex items-center justify-center gap-2.5 transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <GoogleIcon />
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-[#2A2A2A]" />
                        <span className="text-[12px] text-[#6E6E73]">or</span>
                        <div className="flex-1 h-px bg-[#2A2A2A]" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* User ID */}
                        <div>
                            <label className="block text-[12px] font-medium text-[#A1A1A6] mb-1.5">User ID</label>
                            <input
                                type="text"
                                className="w-full bg-[#1C1C1E] border border-[#2A2A2A] rounded-lg py-2.5 px-3 text-[14px] text-[#F5F5F7] placeholder:text-[#6E6E73] focus:outline-none focus:border-[#5B6EAE] transition-colors duration-100"
                                placeholder="Enter your ID"
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-[12px] font-medium text-[#A1A1A6]">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-[11px] text-[#5B6EAE] hover:text-[#7d8bc0] transition-colors duration-100"
                                >
                                    Forgot?
                                </button>
                            </div>
                            <input
                                type="password"
                                className="w-full bg-[#1C1C1E] border border-[#2A2A2A] rounded-lg py-2.5 px-3 text-[14px] text-[#F5F5F7] placeholder:text-[#6E6E73] focus:outline-none focus:border-[#5B6EAE] transition-colors duration-100"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-2.5 bg-[#3a1c1c] border border-[#5c2828] rounded-lg text-[#ef4444] text-[12px]">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || isGoogleLoading}
                            className="w-full bg-[#5B6EAE] hover:bg-[#4a5a94] text-white font-medium text-[14px] py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[12px] text-[#6E6E73] mt-5">
                        Need an account?{' '}
                        <span className="text-[#5B6EAE] cursor-pointer hover:text-[#7d8bc0] transition-colors duration-100">
                            Contact admin
                        </span>
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-center gap-4 mt-6">
                    <Link to="/privacy-policy" className="text-[11px] text-[#6E6E73] hover:text-[#A1A1A6] transition-colors duration-100">
                        Privacy
                    </Link>
                    <Link to="/terms-of-service" className="text-[11px] text-[#6E6E73] hover:text-[#A1A1A6] transition-colors duration-100">
                        Terms
                    </Link>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={closeForgotPassword}
                    />

                    {/* Modal */}
                    <div className="relative bg-[#161616] border border-[#2A2A2A] rounded-xl p-5 w-full max-w-[320px]">
                        <button
                            onClick={closeForgotPassword}
                            className="absolute top-3 right-3 p-1.5 text-[#6E6E73] hover:text-[#F5F5F7] hover:bg-[#2A2A2A] rounded-md transition-colors duration-100"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {!resetSent ? (
                            <>
                                <div className="mb-4">
                                    <h2 className="text-[16px] font-semibold text-[#F5F5F7]">Reset Password</h2>
                                    <p className="text-[12px] text-[#A1A1A6] mt-1">
                                        Enter your email to receive a reset link.
                                    </p>
                                </div>

                                <form onSubmit={handleForgotPassword}>
                                    <input
                                        type="email"
                                        className="w-full bg-[#1C1C1E] border border-[#2A2A2A] rounded-lg py-2.5 px-3 text-[14px] text-[#F5F5F7] placeholder:text-[#6E6E73] focus:outline-none focus:border-[#5B6EAE] transition-colors duration-100 mb-3"
                                        placeholder="your@email.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSendingReset}
                                        className="w-full bg-[#5B6EAE] hover:bg-[#4a5a94] text-white font-medium text-[13px] py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-100 disabled:opacity-50"
                                    >
                                        {isSendingReset ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <CheckCircle className="w-10 h-10 text-[#22c55e] mx-auto mb-3" />
                                <h2 className="text-[16px] font-semibold text-[#F5F5F7] mb-1">Email Sent</h2>
                                <p className="text-[12px] text-[#A1A1A6]">
                                    Check your inbox for the reset link.
                                </p>
                                <button
                                    onClick={closeForgotPassword}
                                    className="mt-4 text-[13px] text-[#5B6EAE] hover:text-[#7d8bc0] transition-colors duration-100"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
