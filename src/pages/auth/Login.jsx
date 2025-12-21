import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const Login = () => {
    const [formData, setFormData] = useState({ id: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center relative overflow-hidden p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl relative z-10 fade-in">
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                        <img src="/logo.png" alt="StudyBrick Logo" className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-1 text-sm">Sign in to your StudyBrick account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* User ID */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">User ID</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="Enter your ID"
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Don't have an account? Contact your administrator.
                </p>
            </div>
            <Toaster position="top-center" richColors />
        </div>
    );
};

export default Login;
