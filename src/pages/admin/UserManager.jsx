import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Save, X, Loader2, Shield, Mail, CheckCircle, XCircle, Copy, Eye, Key, Building2, Calendar, ArrowLeft, Database, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';

const SUBJECTS = ['maths', 'physics', 'chemistry'];
const ROLES = ['admin', 'professor', 'student', 'institute'];
const PLANS = ['free', 'basic', 'pro', 'enterprise'];

// Generate random ID
const generateUserId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SB';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Generate random password
const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const UserManager = () => {
    const { isDark } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userQuestions, setUserQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [allQuestions, setAllQuestions] = useState([]);
    const [selectedQIds, setSelectedQIds] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        loginId: '',
        password: '',
        email: '',
        name: '',
        role: 'student',
        institute: '',
        plan: 'free',
        planExpiry: '',
        allowedSubjects: ['maths'],
        allowedChapters: [], // Empty = all chapters allowed
        status: 'active'
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(data);
            setLoading(false);
        });

        // Also fetch all questions for assign modal
        const unsubQ = onSnapshot(collection(db, 'questions'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllQuestions(data);
        });

        return () => {
            unsubscribe();
            unsubQ();
        };
    }, []);

    // Fetch user-specific questions when user is selected
    useEffect(() => {
        if (selectedUser) {
            setLoadingQuestions(true);
            const fetchQuestions = async () => {
                try {
                    const q = query(collection(db, 'questions'), where('assignedTo', '==', selectedUser.id));
                    const snapshot = await getDocs(q);
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setUserQuestions(data);
                } catch (error) {
                    console.error('Error fetching user questions:', error);
                }
                setLoadingQuestions(false);
            };
            fetchQuestions();
        }
    }, [selectedUser]);

    const resetForm = () => {
        setFormData({
            loginId: generateUserId(),
            password: generatePassword(),
            email: '',
            name: '',
            role: 'student',
            institute: '',
            plan: 'free',
            planExpiry: '',
            allowedSubjects: ['maths'],
            allowedChapters: [],
            status: 'active'
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const openAddModal = () => {
        setFormData({
            loginId: generateUserId(),
            password: generatePassword(),
            email: '',
            name: '',
            role: 'student',
            institute: '',
            plan: 'free',
            planExpiry: '',
            allowedSubjects: ['maths'],
            allowedChapters: [],
            status: 'active'
        });
        setIsAdding(true);
    };

    const handleSubjectToggle = (subject) => {
        const current = formData.allowedSubjects;
        if (current.includes(subject)) {
            if (current.length > 1) {
                // Also remove chapters from the removed subject
                const subjectChapters = allQuestions
                    .filter(q => q.subject?.toLowerCase() === subject)
                    .map(q => q.chapter);
                setFormData({
                    ...formData,
                    allowedSubjects: current.filter(s => s !== subject),
                    allowedChapters: formData.allowedChapters.filter(c => !subjectChapters.includes(c))
                });
            }
        } else {
            setFormData({ ...formData, allowedSubjects: [...current, subject] });
        }
    };

    // Get available chapters based on selected subjects
    const availableChaptersForForm = React.useMemo(() => {
        const chapters = new Set();
        allQuestions.forEach(q => {
            if (formData.allowedSubjects.includes(q.subject?.toLowerCase()) && q.chapter) {
                chapters.add(q.chapter);
            }
        });
        return Array.from(chapters).sort();
    }, [allQuestions, formData.allowedSubjects]);

    const handleChapterToggle = (chapter) => {
        const current = formData.allowedChapters;
        if (current.includes(chapter)) {
            setFormData({ ...formData, allowedChapters: current.filter(c => c !== chapter) });
        } else {
            setFormData({ ...formData, allowedChapters: [...current, chapter] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Please enter a name');
            return;
        }

        try {
            const userData = {
                ...formData,
                email: formData.email || `${formData.loginId.toLowerCase()}@studybrick.app`,
                planExpiry: formData.planExpiry ? new Date(formData.planExpiry) : null,
                updatedAt: serverTimestamp()
            };

            if (editingId) {
                await updateDoc(doc(db, 'users', editingId), userData);
                toast.success('User updated!');
            } else {
                userData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'users'), userData);
                toast.success('User created! Share the credentials with them.');
            }
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save user');
        }
    };

    const handleEdit = (user) => {
        setFormData({
            loginId: user.loginId || '',
            password: user.password || '',
            email: user.email || '',
            name: user.name || '',
            role: user.role || 'student',
            institute: user.institute || '',
            plan: user.plan || 'free',
            planExpiry: user.planExpiry ? new Date(user.planExpiry.seconds * 1000).toISOString().split('T')[0] : '',
            allowedSubjects: user.allowedSubjects || ['maths'],
            allowedChapters: user.allowedChapters || [],
            status: user.status || 'active'
        });
        setEditingId(user.id);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user? This will remove their data from the system.')) return;
        try {
            await deleteDoc(doc(db, 'users', id));
            toast.success('User deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const toggleStatus = async (user) => {
        try {
            await updateDoc(doc(db, 'users', user.id), {
                status: user.status === 'active' ? 'disabled' : 'active'
            });
            toast.success(`User ${user.status === 'active' ? 'disabled' : 'activated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const copyCredentials = (user) => {
        const text = `StudyBrick Login Credentials\n\nLogin ID: ${user.loginId || user.email}\nPassword: ${user.password || 'Set via Firebase'}\n\nLogin at: ${window.location.origin}/login`;
        navigator.clipboard.writeText(text);
        toast.success('Credentials copied to clipboard!');
    };

    const toggleQuestionSelection = (qId) => {
        if (selectedQIds.includes(qId)) {
            setSelectedQIds(selectedQIds.filter(id => id !== qId));
        } else {
            setSelectedQIds([...selectedQIds, qId]);
        }
    };

    const handleAssignQuestions = async () => {
        if (selectedQIds.length === 0) {
            toast.error('Select at least one question');
            return;
        }
        try {
            for (const qId of selectedQIds) {
                await updateDoc(doc(db, 'questions', qId), {
                    assignedTo: selectedUser.id
                });
            }
            toast.success(`Assigned ${selectedQIds.length} questions to ${selectedUser.name}`);
            setShowAssignModal(false);
            setSelectedQIds([]);
            // Refresh user questions
            const q = query(collection(db, 'questions'), where('assignedTo', '==', selectedUser.id));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setUserQuestions(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to assign questions');
        }
    };

    const handleRemoveQuestion = async (qId) => {
        try {
            await updateDoc(doc(db, 'questions', qId), {
                assignedTo: null
            });
            toast.success('Question removed from user');
            setUserQuestions(userQuestions.filter(q => q.id !== qId));
        } catch (error) {
            toast.error('Failed to remove');
        }
    };

    // Get unassigned questions for the modal
    const availableQuestions = allQuestions.filter(q => !q.assignedTo || q.assignedTo === '');

    // User Detail View
    if (selectedUser) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedUser(null)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedUser.name}</h1>
                        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{selectedUser.email}</p>
                    </div>
                </div>

                {/* User Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Key className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Login ID</p>
                                <p className="font-mono font-bold text-slate-900">{selectedUser.loginId || 'N/A'}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Institute</p>
                                <p className="font-bold text-slate-900">{selectedUser.institute || 'N/A'}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Shield className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Plan</p>
                                <p className="font-bold text-slate-900 capitalize">{selectedUser.plan || 'Free'}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Expiry</p>
                                <p className="font-bold text-slate-900">
                                    {selectedUser.planExpiry
                                        ? new Date(selectedUser.planExpiry.seconds * 1000).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Allowed Subjects */}
                <Card className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Allowed Subjects
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {(selectedUser.allowedSubjects || []).map(sub => (
                            <span key={sub} className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg capitalize font-medium">
                                {sub}
                            </span>
                        ))}
                    </div>
                </Card>

                {/* User's Assigned Questions */}
                <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Database className="w-4 h-4" /> Assigned Questions ({userQuestions.length})
                        </h3>
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                        >
                            + Assign Questions
                        </button>
                    </div>

                    {loadingQuestions ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                        </div>
                    ) : userQuestions.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">
                            No questions specifically assigned to this user.<br />
                            They can access all questions in their allowed subjects.
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {userQuestions.map(q => (
                                <div key={q.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center gap-2">
                                    <span className="text-sm flex-1">{q.content?.substring(0, 80)}...</span>
                                    <span className="px-2 py-0.5 bg-slate-200 rounded text-xs capitalize">{q.subject}</span>
                                    <button
                                        onClick={() => handleRemoveQuestion(q.id)}
                                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                                        title="Remove from user"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={() => copyCredentials(selectedUser)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" /> Copy Login Credentials
                    </button>
                    <button
                        onClick={() => handleEdit(selectedUser)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" /> Edit User
                    </button>
                </div>

                {/* Assign Questions Modal */}
                <AnimatePresence>
                    {showAssignModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => { setShowAssignModal(false); setSelectedQIds([]); }}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Assign Questions to {selectedUser.name}
                                    </h2>
                                    <button onClick={() => { setShowAssignModal(false); setSelectedQIds([]); }} className="p-2 hover:bg-slate-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-sm text-slate-500 mb-4">
                                    Select questions below. Selected: {selectedQIds.length}
                                </p>

                                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                                    {availableQuestions.length === 0 ? (
                                        <p className="text-center text-slate-400 py-8">No unassigned questions available</p>
                                    ) : (
                                        availableQuestions.map(q => (
                                            <div
                                                key={q.id}
                                                onClick={() => toggleQuestionSelection(q.id)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedQIds.includes(q.id)
                                                    ? 'bg-indigo-50 border-indigo-300'
                                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedQIds.includes(q.id)}
                                                        onChange={() => { }}
                                                        className="w-4 h-4 text-indigo-600 rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-slate-800">{q.content?.substring(0, 100)}...</p>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className="px-2 py-0.5 bg-slate-200 rounded text-xs capitalize">{q.subject}</span>
                                                            <span className="px-2 py-0.5 bg-slate-200 rounded text-xs">{q.chapter}</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                                                                q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-rose-100 text-rose-700'
                                                                }`}>{q.difficulty}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => { setShowAssignModal(false); setSelectedQIds([]); }}
                                        className={`flex-1 py-2.5 border font-medium rounded-lg ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAssignQuestions}
                                        disabled={selectedQIds.length === 0}
                                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Assign {selectedQIds.length} Questions
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>User Management</h1>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Create users with login credentials and manage permissions</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Add/Edit Form Modal */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => resetForm()}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`rounded-2xl p-6 max-w-xl w-full my-8 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {editingId ? 'Edit User' : 'Create New User'}
                                </h2>
                                <button onClick={resetForm} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100'}`}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Auto-generated Credentials */}
                                {!editingId && (
                                    <div className={`p-4 rounded-lg border ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
                                        <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                                            <Key className="w-4 h-4" /> Login Credentials (Auto-Generated)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={`text-xs ${isDark ? 'text-emerald-500' : 'text-emerald-700'}`}>Login ID</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={formData.loginId}
                                                        onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                                                        className={`w-full p-2 border rounded-lg font-mono text-sm ${isDark ? 'bg-slate-800 border-emerald-800 text-white' : 'bg-white border-emerald-200 text-slate-900'}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, loginId: generateUserId() })}
                                                        className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/30 hover:bg-emerald-800 text-emerald-400' : 'bg-emerald-100 hover:bg-emerald-200'}`}
                                                        title="Regenerate"
                                                    >
                                                        🔄
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={`text-xs ${isDark ? 'text-emerald-500' : 'text-emerald-700'}`}>Password</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        className={`w-full p-2 border rounded-lg font-mono text-sm ${isDark ? 'bg-slate-800 border-emerald-800 text-white' : 'bg-white border-emerald-200 text-slate-900'}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, password: generatePassword() })}
                                                        className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/30 hover:bg-emerald-800 text-emerald-400' : 'bg-emerald-100 hover:bg-emerald-200'}`}
                                                        title="Regenerate"
                                                    >
                                                        🔄
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-emerald-600 mt-2">
                                            Share these credentials with the user so they can login
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`mt-1 w-full p-2.5 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                            placeholder="Institute/User Name"
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`mt-1 w-full p-2.5 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900'}`}
                                            placeholder="optional@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Institute</label>
                                        <input
                                            type="text"
                                            value={formData.institute}
                                            onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                                            className={`mt-1 w-full p-2.5 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                            placeholder="e.g. Delhi Public School"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className={`mt-1 w-full p-2.5 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        >
                                            {ROLES.map(role => (
                                                <option key={role} value={role} className="capitalize">
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Plan</label>
                                        <select
                                            value={formData.plan}
                                            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                            className={`mt-1 w-full p-2.5 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        >
                                            {PLANS.map(plan => (
                                                <option key={plan} value={plan} className="capitalize">
                                                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Plan Expiry</label>
                                        <input
                                            type="date"
                                            value={formData.planExpiry}
                                            onChange={(e) => setFormData({ ...formData, planExpiry: e.target.value })}
                                            className={`mt-1 w-full p-2.5 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Allowed Subjects</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {SUBJECTS.map(subject => (
                                            <button
                                                key={subject}
                                                type="button"
                                                onClick={() => handleSubjectToggle(subject)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${formData.allowedSubjects.includes(subject)
                                                    ? 'bg-indigo-600 text-white'
                                                    : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {subject}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Allowed Chapters - Custom Input */}
                                <div>
                                    <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Allowed Chapters
                                        <span className="text-xs text-slate-400 font-normal">
                                            (Add custom chapter names - Empty = all chapters)
                                        </span>
                                    </label>

                                    {/* Add Chapter Input */}
                                    <div className="mt-2 flex gap-2">
                                        <input
                                            type="text"
                                            id="newChapterInput"
                                            placeholder="Type chapter name and press Enter"
                                            className={`flex-1 p-2 border rounded-lg text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900'}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const value = e.target.value.trim();
                                                    if (value && !formData.allowedChapters.includes(value)) {
                                                        setFormData({
                                                            ...formData,
                                                            allowedChapters: [...formData.allowedChapters, value]
                                                        });
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('newChapterInput');
                                                const value = input.value.trim();
                                                if (value && !formData.allowedChapters.includes(value)) {
                                                    setFormData({
                                                        ...formData,
                                                        allowedChapters: [...formData.allowedChapters, value]
                                                    });
                                                    input.value = '';
                                                }
                                            }}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Chapter Chips */}
                                    {formData.allowedChapters.length > 0 ? (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {formData.allowedChapters.map(chapter => (
                                                <span
                                                    key={chapter}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}
                                                >
                                                    {chapter}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            allowedChapters: formData.allowedChapters.filter(c => c !== chapter)
                                                        })}
                                                        className="ml-1 hover:text-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, allowedChapters: [] })}
                                                className="text-xs text-red-500 hover:text-red-700 underline"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    ) : (
                                        <p className={`mt-2 text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                            No specific chapters set - user can access all chapters
                                        </p>
                                    )}

                                    {/* Quick Add from Existing */}
                                    {availableChaptersForForm.length > 0 && (
                                        <div className="mt-3">
                                            <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick add from existing:</p>
                                            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                                {availableChaptersForForm
                                                    .filter(ch => !formData.allowedChapters.includes(ch))
                                                    .map(chapter => (
                                                        <button
                                                            key={chapter}
                                                            type="button"
                                                            onClick={() => setFormData({
                                                                ...formData,
                                                                allowedChapters: [...formData.allowedChapters, chapter]
                                                            })}
                                                            className={`px-2 py-0.5 rounded text-xs transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                        >
                                                            + {chapter}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Status</label>
                                    <div className="mt-2 flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={formData.status === 'active'}
                                                onChange={() => setFormData({ ...formData, status: 'active' })}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={formData.status === 'disabled'}
                                                onChange={() => setFormData({ ...formData, status: 'disabled' })}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Disabled</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className={`flex-1 py-2.5 border font-medium rounded-lg ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {editingId ? 'Update' : 'Create'} User
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Users Table */}
            <Card className="overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No users found. Add your first user!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={`border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <tr>
                                    <th className={`text-left p-4 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>User</th>
                                    <th className={`text-left p-4 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Login ID</th>
                                    <th className={`text-left p-4 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Institute</th>
                                    <th className={`text-left p-4 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Plan</th>
                                    <th className={`text-left p-4 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Status</th>
                                    <th className={`text-right p-4 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                {users.map((user) => (
                                    <tr key={user.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                        <td className="p-4">
                                            <div>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name || 'Unnamed'}</p>
                                                <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-mono text-sm px-2 py-1 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                                                {user.loginId || '-'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{user.institute || '-'}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${user.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                                user.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                                                    user.plan === 'basic' ? 'bg-emerald-100 text-emerald-700' :
                                                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {user.plan || 'free'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleStatus(user)}
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${user.status === 'active'
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {user.status === 'active' ? (
                                                    <><CheckCircle className="w-3 h-3" /> Active</>
                                                ) : (
                                                    <><XCircle className="w-3 h-3" /> Disabled</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-indigo-400' : 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600'}`}
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => copyCredentials(user)}
                                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-emerald-400' : 'hover:bg-slate-100 text-slate-500 hover:text-emerald-600'}`}
                                                    title="Copy Credentials"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-indigo-400' : 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600'}`}
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-red-400' : 'hover:bg-slate-100 text-slate-500 hover:text-red-600'}`}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Total: {users.length} users
            </p>
        </div>
    );
};

export default UserManager;
