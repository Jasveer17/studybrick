import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Search, Loader2, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const StudyBricks = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'studyBricks'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const materials = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (!data.assignedTo ||
                    data.assignedTo === user.firestoreId ||
                    data.assignedTo === user.email ||
                    data.assignedTo === user.uid) {
                    materials.push({ id: doc.id, ...data });
                }
            });
            setResources(materials);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const filteredResources = resources.filter(resource => {
        const query = searchQuery.toLowerCase();
        return !searchQuery ||
            resource.title?.toLowerCase().includes(query) ||
            resource.subject?.toLowerCase().includes(query) ||
            resource.description?.toLowerCase().includes(query);
    });

    const getSubjectStyle = (subject) => {
        const s = subject?.toLowerCase();
        if (s === 'physics') return {
            bg: isDark ? 'bg-violet-500/20' : 'bg-violet-100',
            text: isDark ? 'text-violet-400' : 'text-violet-600',
            gradient: 'from-violet-500 to-purple-600'
        };
        if (s === 'chemistry') return {
            bg: isDark ? 'bg-rose-500/20' : 'bg-rose-100',
            text: isDark ? 'text-rose-400' : 'text-rose-600',
            gradient: 'from-rose-500 to-pink-600'
        };
        return {
            bg: isDark ? 'bg-sky-500/20' : 'bg-sky-100',
            text: isDark ? 'text-sky-400' : 'text-sky-600',
            gradient: 'from-sky-500 to-blue-600'
        };
    };

    const formatSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                            <BookOpen className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <span className={`text-sm font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            Resources
                        </span>
                    </div>
                    <h1 className={`text-3xl font-bold tracking-tight flex items-center gap-3 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        Study Bricks
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            Premium
                        </span>
                    </h1>
                    <p className={`mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Curated materials for your success
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-11 pr-4 py-3 rounded-xl text-sm font-medium w-full md:w-72 transition-all duration-150 ${isDark
                                ? 'bg-[#151b27] border border-white/[0.06] text-white placeholder:text-neutral-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                                : 'bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
                            } focus:outline-none`}
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : filteredResources.length === 0 ? (
                <div className={`py-20 text-center rounded-2xl ${isDark ? 'bg-[#151b27] border border-white/[0.06]' : 'bg-white border border-neutral-200/50'}`}>
                    <AlertCircle className={`w-14 h-14 mx-auto mb-4 ${isDark ? 'text-neutral-700' : 'text-neutral-200'}`} />
                    <p className={`text-lg font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        No study materials available
                    </p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        Contact your admin to get study materials assigned
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredResources.map((resource) => {
                        const subjectStyle = getSubjectStyle(resource.subject);

                        return (
                            <div
                                key={resource.id}
                                className={`group relative overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 ${isDark
                                        ? 'bg-[#151b27] border border-white/[0.06] hover:border-white/[0.1]'
                                        : 'bg-white border border-neutral-200/50 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50'
                                    }`}
                            >
                                {/* Top gradient bar on hover */}
                                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${subjectStyle.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

                                <div className="p-6 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${subjectStyle.bg} transition-transform duration-200 group-hover:scale-110`}>
                                            <FileText className={`w-6 h-6 ${subjectStyle.text}`} />
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isDark ? 'text-neutral-400 bg-white/[0.04]' : 'text-neutral-500 bg-neutral-100'
                                            }`}>
                                            {formatSize(resource.size)}
                                        </span>
                                    </div>

                                    <h3 className={`font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem] ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                        {resource.title}
                                    </h3>

                                    {resource.description && (
                                        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                            {resource.description}
                                        </p>
                                    )}

                                    <div className={`mt-auto pt-4 flex items-center justify-between border-t ${isDark ? 'border-white/[0.06]' : 'border-neutral-100'}`}>
                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                            <Calendar className="w-3.5 h-3.5" />
                                            {resource.uploadedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                        </div>
                                        {resource.downloadUrl && (
                                            <a
                                                href={resource.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-2.5 rounded-xl transition-all duration-150 ${isDark
                                                        ? 'text-indigo-400 hover:bg-indigo-500/15'
                                                        : 'text-indigo-600 hover:bg-indigo-50'
                                                    }`}
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudyBricks;
