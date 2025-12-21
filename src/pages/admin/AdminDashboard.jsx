import React, { useState, useEffect } from 'react';
import { Upload, FileText, Check, Plus, Book, Trash2, Users, Database, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('questions');
    const [questionContent, setQuestionContent] = useState('');
    const [brickTitle, setBrickTitle] = useState('');
    const [brickFile, setBrickFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    // Bulk upload settings
    const [bulkSettings, setBulkSettings] = useState({
        subject: 'maths',
        chapter: '',
        difficulty: 'Medium',
        type: 'MCQ',
        assignedTo: '' // Empty = all users
    });

    // Real stats from Firestore
    const [stats, setStats] = useState({ users: 0, questions: 0 });

    useEffect(() => {
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllUsers(usersData);
            setStats(prev => ({ ...prev, users: snapshot.size }));
        });
        const unsubQuestions = onSnapshot(collection(db, 'questions'), (snapshot) => {
            setStats(prev => ({ ...prev, questions: snapshot.size }));
        });
        return () => {
            unsubUsers();
            unsubQuestions();
        };
    }, []);

    // Parse questions from raw text
    const parseQuestions = (rawText) => {
        const lines = rawText.trim().split('\n');
        const questions = [];
        let currentQuestion = null;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Match question number patterns: "1.", "1)", "Q1.", "Q1)", etc.
            const questionMatch = trimmed.match(/^(?:Q?\.?\s*)?(\d+)[.)\]]\s*(.+)/i);

            if (questionMatch) {
                // Save previous question
                if (currentQuestion && currentQuestion.content) {
                    questions.push(currentQuestion);
                }
                // Start new question
                currentQuestion = {
                    content: questionMatch[2].trim(),
                    options: [],
                    correct: 0
                };
            } else if (currentQuestion) {
                // Check if it's an option (A), (B), (C), (D) or A., B., C., D.
                const optionMatch = trimmed.match(/^[\(\[]?([A-Da-d])[\)\].]?\s*(.+)/);
                if (optionMatch) {
                    currentQuestion.options.push(optionMatch[2].trim());
                } else {
                    // Append to current question content
                    currentQuestion.content += ' ' + trimmed;
                }
            }
        }

        // Don't forget the last question
        if (currentQuestion && currentQuestion.content) {
            questions.push(currentQuestion);
        }

        return questions;
    };

    const handleQuestionUpload = async () => {
        if (!questionContent.trim()) {
            toast.error('Please paste some questions first');
            return;
        }
        if (!bulkSettings.chapter.trim()) {
            toast.error('Please enter a chapter name');
            return;
        }

        setIsUploading(true);
        try {
            const parsedQuestions = parseQuestions(questionContent);

            if (parsedQuestions.length === 0) {
                toast.error('Could not parse any questions. Use format: 1. Question text');
                setIsUploading(false);
                return;
            }

            let successCount = 0;
            for (const q of parsedQuestions) {
                await addDoc(collection(db, 'questions'), {
                    content: q.content,
                    options: q.options.length > 0 ? q.options : null,
                    correct: q.correct,
                    subject: bulkSettings.subject,
                    chapter: bulkSettings.chapter,
                    difficulty: bulkSettings.difficulty,
                    type: bulkSettings.type,
                    assignedTo: bulkSettings.assignedTo || null,
                    createdAt: serverTimestamp(),
                    createdBy: user?.uid || 'admin'
                });
                successCount++;
            }
            const assignedUser = allUsers.find(u => u.id === bulkSettings.assignedTo);

            if (assignedUser) {
                toast.success(`Added ${successCount} questions for ${assignedUser.name}!`);
            } else {
                toast.success(`Added ${successCount} questions to ${bulkSettings.subject} - ${bulkSettings.chapter}`);
            }
            setQuestionContent('');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleBrickUpload = () => {
        if (!brickTitle || !brickFile) {
            toast.error('Please provide a title and select a PDF file');
            return;
        }
        toast.success(`Study Brick "${brickTitle}" uploaded successfully`);
        setBrickTitle('');
        setBrickFile(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500">Manage content and resources</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/admin/users">
                    <Card className="p-6 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-indigo-200 font-medium mb-1">Total Users</p>
                                <h3 className="text-3xl font-bold">{stats.users}</h3>
                            </div>
                            <div className="p-2 bg-indigo-500/50 rounded-lg group-hover:bg-indigo-400/50 transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs text-indigo-300 mt-2 flex items-center gap-1">
                            Manage users <ArrowRight className="w-3 h-3" />
                        </p>
                    </Card>
                </Link>
                <Link to="/admin/questions">
                    <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 font-medium mb-1">Total Questions</p>
                                <h3 className="text-3xl font-bold text-slate-900">{stats.questions}</h3>
                            </div>
                            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                <Database className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            Manage questions <ArrowRight className="w-3 h-3" />
                        </p>
                    </Card>
                </Link>
                <Card className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Study Bricks</p>
                            <h3 className="text-3xl font-bold text-slate-900">0</h3>
                        </div>
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Book className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Coming soon</p>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'questions'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Bulk Upload Questions
                    </button>
                    <button
                        onClick={() => setActiveTab('bricks')}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'bricks'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Upload Study Bricks
                    </button>
                </div>

                <div className="p-6">
                    <AnimatePresence mode='wait'>
                        {activeTab === 'questions' ? (
                            <motion.div
                                key="questions"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 mb-4">
                                    <h3 className="font-semibold text-indigo-900 mb-2">Bulk Upload Instructions</h3>
                                    <p className="text-sm text-indigo-700">
                                        Paste numbered questions (1. Question...). Options should be on separate lines as A) B) C) D).
                                        All questions will use the settings below.
                                    </p>
                                </div>

                                {/* Bulk Settings */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 block mb-1">Subject</label>
                                        <select
                                            value={bulkSettings.subject}
                                            onChange={(e) => setBulkSettings({ ...bulkSettings, subject: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="maths">Maths</option>
                                            <option value="physics">Physics</option>
                                            <option value="chemistry">Chemistry</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 block mb-1">Chapter *</label>
                                        <input
                                            type="text"
                                            value={bulkSettings.chapter}
                                            onChange={(e) => setBulkSettings({ ...bulkSettings, chapter: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                            placeholder="e.g. Calculus"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 block mb-1">Difficulty</label>
                                        <select
                                            value={bulkSettings.difficulty}
                                            onChange={(e) => setBulkSettings({ ...bulkSettings, difficulty: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Assign to User */}
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <label className="text-xs font-medium text-emerald-700 block mb-1 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> Assign to User/Institute
                                    </label>
                                    <select
                                        value={bulkSettings.assignedTo}
                                        onChange={(e) => setBulkSettings({ ...bulkSettings, assignedTo: e.target.value })}
                                        className="w-full p-2.5 border border-emerald-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">All Users (Global)</option>
                                        {allUsers.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} {u.institute ? `(${u.institute})` : `(${u.role})`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-emerald-600 mt-1">Select a user to assign these questions only to them</p>
                                </div>

                                <textarea
                                    className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-none"
                                    placeholder={`Paste questions here...

Example format:
1. What is the derivative of x²?
A) x
B) 2x
C) x²
D) 2

2. Find the integral of sin(x)
A) cos(x)
B) -cos(x)
C) sin(x)
D) -sin(x)`}
                                    value={questionContent}
                                    onChange={(e) => setQuestionContent(e.target.value)}
                                />

                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-slate-500">
                                        {questionContent ? `~${parseQuestions(questionContent).length} questions detected` : ''}
                                    </p>
                                    <button
                                        onClick={handleQuestionUpload}
                                        disabled={isUploading}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Add to Bank
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="bricks"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="max-w-xl mx-auto space-y-6 pt-10"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Resource Title</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g. JEE Mains 2024 Physics Solutions"
                                        value={brickTitle}
                                        onChange={(e) => setBrickTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Upload PDF</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                                        <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                            <FileText className="w-8 h-8 text-indigo-500" />
                                        </div>
                                        <p className="text-slate-600 font-medium">Click to browse or drag file here</p>
                                        <p className="text-xs text-slate-400 mt-1">PDFs only (Max 10MB)</p>
                                        <input
                                            type="file"
                                            className="hidden w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer"
                                            onChange={(e) => setBrickFile(e.target.files[0])}
                                            accept=".pdf"
                                        />
                                    </div>
                                    {brickFile && (
                                        <div className="flex items-center justify-between p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                                            <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {brickFile.name}</span>
                                            <button onClick={() => setBrickFile(null)} className="text-indigo-400 hover:text-indigo-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleBrickUpload}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                >
                                    Upload Material
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

