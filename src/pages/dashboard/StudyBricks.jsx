import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Search, Loader2, AlertCircle } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';

const StudyBricks = () => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch study materials assigned to this user from Firestore
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'studyBricks'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const materials = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Only show materials assigned to this user (by firestoreId or email) or global (no assignedTo)
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

    // Filter by search
    const filteredResources = resources.filter(resource => {
        const query = searchQuery.toLowerCase();
        return !searchQuery ||
            resource.title?.toLowerCase().includes(query) ||
            resource.subject?.toLowerCase().includes(query) ||
            resource.description?.toLowerCase().includes(query);
    });

    // Get subject color
    const getSubjectStyle = (subject) => {
        const s = subject?.toLowerCase();
        if (s === 'physics') return 'bg-violet-100 text-violet-600';
        if (s === 'chemistry') return 'bg-rose-100 text-rose-600';
        return 'bg-sky-100 text-sky-600';
    };

    // Format file size
    const formatSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            ) : filteredResources.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No study materials available</p>
                    <p className="text-slate-400 text-sm mt-1">Contact your admin to get study materials assigned</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                        <Card key={resource.id} className="group hover:border-indigo-300 transition-all duration-300">
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${getSubjectStyle(resource.subject)}`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        {formatSize(resource.size)}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 min-h-[3rem]">
                                    {resource.title}
                                </h3>

                                {resource.description && (
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                                        {resource.description}
                                    </p>
                                )}

                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Calendar className="w-3 h-3" />
                                        {resource.uploadedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                    </div>
                                    {resource.downloadUrl && (
                                        <a
                                            href={resource.downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudyBricks;
