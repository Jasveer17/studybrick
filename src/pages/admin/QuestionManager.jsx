import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Search, Filter, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import MathRenderer from '../../components/ui/MathRenderer';

const QuestionManager = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [questions, setQuestions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filterSubject, setFilterSubject] = useState('all');
    const [filterUser, setFilterUser] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        subject: 'maths',
        chapter: '',
        type: 'MCQ',
        difficulty: 'Medium',
        content: '',
        options: ['', '', '', ''],
        correct: 0,
        assignedTo: '' // User ID to assign question to
    });

    // Fetch questions from Firestore
    useEffect(() => {
        const unsubQuestions = onSnapshot(collection(db, 'questions'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuestions(data);
            setLoading(false);
        });

        // Fetch users for dropdown
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(data);
        });

        return () => {
            unsubQuestions();
            unsubUsers();
        };
    }, []);

    const resetForm = () => {
        setFormData({
            subject: 'maths',
            chapter: '',
            type: 'MCQ',
            difficulty: 'Medium',
            content: '',
            options: ['', '', '', ''],
            correct: 0,
            assignedTo: ''
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content.trim() || !formData.chapter.trim()) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            const questionData = {
                ...formData,
                options: formData.type === 'MCQ' ? formData.options.filter(o => o.trim()) : null,
                assignedTo: formData.assignedTo || null, // null means available to all
                createdAt: serverTimestamp(),
                createdBy: user?.uid || 'admin'
            };

            if (editingId) {
                await updateDoc(doc(db, 'questions', editingId), questionData);
                toast.success('Question updated!');
            } else {
                await addDoc(collection(db, 'questions'), questionData);
                const assignedUser = users.find(u => u.id === formData.assignedTo);
                if (assignedUser) {
                    toast.success(`Question added for ${assignedUser.name}!`);
                } else {
                    toast.success('Question added to bank (available to all)!');
                }
            }
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save question');
        }
    };

    const handleEdit = (question) => {
        setFormData({
            subject: question.subject || 'maths',
            chapter: question.chapter || '',
            type: question.type || 'MCQ',
            difficulty: question.difficulty || 'Medium',
            content: question.content || '',
            options: question.options || ['', '', '', ''],
            correct: question.correct || 0,
            assignedTo: question.assignedTo || ''
        });
        setEditingId(question.id);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await deleteDoc(doc(db, 'questions', id));
            toast.success('Question deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const filteredQuestions = questions.filter(q => {
        const matchSubject = filterSubject === 'all' || q.subject === filterSubject;
        const matchUser = filterUser === 'all' || q.assignedTo === filterUser || (filterUser === 'none' && !q.assignedTo);
        const matchSearch = q.content?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchSubject && matchUser && matchSearch;
    });

    const getUserName = (userId) => {
        if (!userId) return 'All Users';
        const foundUser = users.find(u => u.id === userId);
        return foundUser?.name || 'Unknown';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Question Bank</h1>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Add and manage questions for the exam engine</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Question
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className={`flex gap-2 p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    {['all', 'maths', 'physics', 'chemistry'].map(sub => (
                        <button
                            key={sub}
                            onClick={() => setFilterSubject(sub)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${filterSubject === sub
                                ? isDark ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'bg-white text-indigo-600 shadow-sm'
                                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>

                {/* User Filter */}
                <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className={`px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                >
                    <option value="all">All Users</option>
                    <option value="none">Unassigned (Global)</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>

                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900'}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => resetForm()}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {editingId ? 'Edit Question' : 'Add New Question'}
                                </h2>
                                <button onClick={resetForm} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100'}`}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Assign to User - Important! */}
                                <div className={`p-4 rounded-lg border ${isDark ? 'bg-indigo-900/30 border-indigo-800' : 'bg-indigo-50 border-indigo-200'}`}>
                                    <label className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                        <Users className="w-4 h-4" /> Assign to User
                                    </label>
                                    <select
                                        value={formData.assignedTo}
                                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                        className={`mt-2 w-full p-2.5 border rounded-lg ${isDark ? 'bg-slate-800 border-indigo-700 text-white' : 'bg-white border-indigo-200 text-slate-900'}`}
                                    >
                                        <option value="">All Users (Global)</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.institute || u.role})
                                            </option>
                                        ))}
                                    </select>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        Leave as "All Users" for global questions, or select a specific user/institute
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className={`mt-1 w-full p-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="maths">Maths</option>
                                            <option value="physics">Physics</option>
                                            <option value="chemistry">Chemistry</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className={`mt-1 w-full p-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="MCQ">MCQ</option>
                                            <option value="Integer">Integer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Difficulty</label>
                                        <select
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                            className={`mt-1 w-full p-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Chapter</label>
                                        <input
                                            type="text"
                                            value={formData.chapter}
                                            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                            className={`mt-1 w-full p-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                            placeholder="e.g. Calculus"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Question Content</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className={`mt-1 w-full p-3 border rounded-lg h-32 font-mono text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        placeholder="Enter question text. Use $...$ for LaTeX math."
                                    />
                                    {formData.content && (
                                        <div className={`mt-2 p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border'}`}>
                                            <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Preview:</p>
                                            <MathRenderer>{formData.content}</MathRenderer>
                                        </div>
                                    )}
                                </div>

                                {formData.type === 'MCQ' && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Options</label>
                                        <div className="mt-2 space-y-2">
                                            {formData.options.map((opt, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="correct"
                                                        checked={formData.correct === i}
                                                        onChange={() => setFormData({ ...formData, correct: i })}
                                                        className="w-4 h-4 text-indigo-600"
                                                    />
                                                    <span className="text-sm font-bold text-slate-400 w-6">
                                                        {String.fromCharCode(65 + i)}.
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...formData.options];
                                                            newOpts[i] = e.target.value;
                                                            setFormData({ ...formData, options: newOpts });
                                                        }}
                                                        className={`flex-1 p-2 border rounded-lg text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Select the correct answer</p>
                                    </div>
                                )}

                                {formData.type === 'Integer' && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Correct Answer</label>
                                        <input
                                            type="text"
                                            value={formData.correct}
                                            onChange={(e) => setFormData({ ...formData, correct: e.target.value })}
                                            className={`mt-1 w-full p-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                            placeholder="Enter correct answer"
                                        />
                                    </div>
                                )}

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
                                        {editingId ? 'Update' : 'Save'} Question
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Questions List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-slate-500">No questions found. Add your first question!</p>
                    </Card>
                ) : (
                    filteredQuestions.map((q) => (
                        <Card key={q.id} className="p-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${q.subject === 'maths' ? 'bg-blue-100 text-blue-700' :
                                            q.subject === 'physics' ? 'bg-purple-100 text-purple-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {q.subject}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                            {q.difficulty}
                                        </span>
                                        <span className="text-xs text-slate-400">{q.chapter}</span>
                                        {q.assignedTo && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {getUserName(q.assignedTo)}
                                            </span>
                                        )}
                                    </div>
                                    <div className={isDark ? 'text-slate-200' : 'text-slate-800'} style={{ fontFamily: '"Times New Roman", "Cambria Math", serif' }}>
                                        <MathRenderer>{q.content}</MathRenderer>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(q)}
                                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-indigo-400' : 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600'}`}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(q.id)}
                                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-red-400' : 'hover:bg-slate-100 text-slate-500 hover:text-red-600'}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Total: {filteredQuestions.length} questions
            </p>
        </div>
    );
};

export default QuestionManager;
