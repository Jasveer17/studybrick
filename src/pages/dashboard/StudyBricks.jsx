import React from 'react';
import { Download, FileText, Calendar, Search } from 'lucide-react';
import Card from '../../components/ui/Card';

const MOCK_RESOURCES = [
    { id: 1, title: 'JEE Mains 2024 - Physics Complete Solutions', subject: 'Physics', date: '2024-03-15', size: '2.4 MB' },
    { id: 2, title: 'Organic Chemistry Formula Sheet', subject: 'Chemistry', date: '2024-03-10', size: '1.1 MB' },
    { id: 3, title: 'Maths - Integration Question Bank', subject: 'Maths', date: '2024-02-28', size: '3.5 MB' },
    { id: 4, title: 'Electrostatics & Magnetism Notes', subject: 'Physics', date: '2024-02-15', size: '4.2 MB' },
    { id: 5, title: 'Physical Chemistry Quick Revision', subject: 'Chemistry', date: '2024-01-20', size: '0.9 MB' },
    { id: 6, title: 'Vectors & 3D Geometry Practice Set', subject: 'Maths', date: '2024-01-05', size: '1.8 MB' },
];

import { useAuth } from '../../context/AuthContext';

const StudyBricks = () => {
    const { user } = useAuth();
    const filteredResources = MOCK_RESOURCES.filter(resource =>
        user?.allowedSubjects
            ? user.allowedSubjects.includes(resource.subject.toLowerCase())
            : true
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Study Bricks
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                            Premium Library
                        </span>
                    </h1>
                    <p className="text-slate-500">Curated materials for your success</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No resources available for your current plan.
                    </div>
                ) : (
                    filteredResources.map((resource) => (
                        <Card key={resource.id} className="group hover:border-indigo-300 transition-all duration-300">
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${resource.subject === 'Physics' ? 'bg-violet-100 text-violet-600' :
                                        resource.subject === 'Chemistry' ? 'bg-rose-100 text-rose-600' :
                                            'bg-sky-100 text-sky-600'
                                        }`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        {resource.size}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 min-h-[3rem]">
                                    {resource.title}
                                </h3>

                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Calendar className="w-3 h-3" />
                                        {resource.date}
                                    </div>
                                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )))}
            </div>
        </div>
    );
};

export default StudyBricks;
