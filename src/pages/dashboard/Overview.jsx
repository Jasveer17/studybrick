import React from 'react';
import { FileText, Database, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-green-600 gap-1">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">{subtitle}</span>
            <span className="text-gray-400 ml-1">vs last month</span>
        </div>
    </div>
);

const ActivityRow = ({ title, subject, date, status }) => (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
        <td className="py-4 px-6">
            <div className="font-medium text-gray-900">{title}</div>
            <div className="text-xs text-gray-500 mt-0.5">ID: #P-{Math.floor(Math.random() * 1000)}</div>
        </td>
        <td className="py-4 px-6">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {subject}
            </span>
        </td>
        <td className="py-4 px-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {date}
            </div>
        </td>
        <td className="py-4 px-6">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status === 'Published'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Published' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                {status}
            </span>
        </td>
        <td className="py-4 px-6 text-right">
            <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
        </td>
    </tr>
);

const Overview = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Papers Generated"
                    value="1,284"
                    subtitle="+12%"
                    icon={FileText}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Questions Database"
                    value="5,000+"
                    subtitle="+350 new"
                    icon={Database}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Active Batches"
                    value="12"
                    subtitle="+2"
                    icon={Users}
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Recent Papers Created</h2>
                    <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="py-3 px-6 font-semibold">Paper Name</th>
                                <th className="py-3 px-6 font-semibold">Subject</th>
                                <th className="py-3 px-6 font-semibold">Created Date</th>
                                <th className="py-3 px-6 font-semibold">Status</th>
                                <th className="py-3 px-6 font-semibold text-right">Actions</th>
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
