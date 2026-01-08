import React from 'react';
import { FileText, Database, Users, TrendingUp, Clock, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const StatCard = ({ title, value, subtitle, icon: Icon, color, gradient }) => {
    const { isDark } = useTheme();

    return (
        <div className={`group relative overflow-hidden rounded-2xl p-6 transition-colors duration-150 ${isDark
            ? 'bg-[#151b27] border border-white/[0.06] hover:border-white/[0.1]'
            : 'bg-white border border-neutral-200/50 hover:border-indigo-200 hover:bg-neutral-50/30'
            }`}>
            {/* Accent top bar - always visible */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] opacity-60 ${gradient}`} />

            <div className="relative flex justify-between items-start">
                <div className="space-y-1">
                    <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {title}
                    </p>
                    <h3 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {value}
                    </h3>
                </div>

                {/* Icon Container */}
                <div className={`p-3 rounded-xl ${gradient}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className="relative mt-5 flex items-center text-sm gap-1.5">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="font-semibold">{subtitle}</span>
                </div>
                <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>vs last month</span>
            </div>
        </div>
    );
};

const ActivityRow = ({ title, subject, date, status }) => {
    const { isDark } = useTheme();

    return (
        <tr className={`group transition-colors duration-150 ${isDark
            ? 'hover:bg-white/[0.02] border-b border-white/[0.04] last:border-0'
            : 'hover:bg-neutral-50/50 border-b border-neutral-100 last:border-0'
            }`}>
            <td className="py-4 px-6">
                <div className={`font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>{title}</div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    ID: #P-{Math.floor(Math.random() * 1000)}
                </div>
            </td>
            <td className="py-4 px-6">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${isDark
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                    {subject}
                </span>
            </td>
            <td className={`py-4 px-6 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {date}
                </div>
            </td>
            <td className="py-4 px-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${status === 'Published'
                    ? isDark
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : isDark
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                    {status}
                </span>
            </td>
            <td className="py-4 px-6 text-right">
                <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${isDark
                    ? 'text-indigo-400 hover:bg-indigo-500/15'
                    : 'text-indigo-600 hover:bg-indigo-50'
                    }`}>
                    Edit
                </button>
            </td>
        </tr>
    );
};

const Overview = () => {
    const { isDark } = useTheme();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                            <Zap className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <span className={`text-sm font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            Dashboard
                        </span>
                    </div>
                    <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        Good Morning! ✨
                    </h1>
                    <p className={`mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Here's what's happening with your exams today.
                    </p>
                </div>

                <button className="btn-premium btn-primary">
                    <Sparkles className="w-4 h-4" />
                    Create New Exam
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCard
                    title="Total Papers Generated"
                    value="1,284"
                    subtitle="+12%"
                    icon={FileText}
                    gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
                />
                <StatCard
                    title="Questions Database"
                    value="5,000+"
                    subtitle="+350 new"
                    icon={Database}
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                />
                <StatCard
                    title="Active Batches"
                    value="12"
                    subtitle="+2"
                    icon={Users}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                />
            </div>

            {/* Recent Activity Table */}
            <div className={`rounded-2xl overflow-hidden ${isDark
                ? 'bg-[#151b27] border border-white/[0.06]'
                : 'bg-white border border-neutral-200/50 shadow-sm'
                }`}>
                {/* Table Header */}
                <div className={`p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 ${isDark ? 'bg-white/[0.02] border-b border-white/[0.06]' : 'bg-neutral-50/50 border-b border-neutral-100'
                    }`}>
                    <div>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                            Recent Papers Created
                        </h2>
                        <p className={`text-sm mt-0.5 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Track your recently created exam papers
                        </p>
                    </div>
                    <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${isDark
                        ? 'text-indigo-400 hover:bg-indigo-500/15'
                        : 'text-indigo-600 hover:bg-indigo-50'
                        }`}>
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={isDark
                                ? 'text-neutral-500 text-xs uppercase tracking-wider bg-white/[0.02]'
                                : 'text-neutral-500 text-xs uppercase tracking-wider bg-neutral-50/50'
                            }>
                                <th className="py-4 px-6 font-semibold">Paper Name</th>
                                <th className="py-4 px-6 font-semibold">Subject</th>
                                <th className="py-4 px-6 font-semibold">Created Date</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ActivityRow
                                title="JEE Mains Mock 1 - Math"
                                subject="Mathematics"
                                date="2 hrs ago"
                                status="Published"
                            />
                            <ActivityRow
                                title="Physics Chapter 4 Quiz"
                                subject="Physics"
                                date="5 hrs ago"
                                status="Draft"
                            />
                            <ActivityRow
                                title="Chemistry Organic Revision"
                                subject="Chemistry"
                                date="Yesterday"
                                status="Published"
                            />
                            <ActivityRow
                                title="Class 10 Biology Term 1"
                                subject="Biology"
                                date="2 days ago"
                                status="Published"
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Overview;
