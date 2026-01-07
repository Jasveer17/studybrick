import React, { useState, useEffect } from 'react';
import { Upload, FileText, Check, Plus, Book, Trash2, Users, Database, ArrowRight, Loader2, AlertCircle, Bell, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('questions');
    const [questionContent, setQuestionContent] = useState('');
    const [brickTitle, setBrickTitle] = useState('');
    const [brickDownloadUrl, setBrickDownloadUrl] = useState('');
    const [brickSettings, setBrickSettings] = useState({
        subject: 'maths',
        description: '',
        assignedTo: ''
    });
    const [isUploading, setIsUploading] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    // Bulk upload settings
    const [bulkSettings, setBulkSettings] = useState({
        subject: 'maths',
        chapter: '',
        difficulty: 'Medium',
        type: 'MCQ',
        assignedTo: ''
    });

    // Real stats from Firestore
    const [stats, setStats] = useState({ users: 0, questions: 0 });

    // Notice posting state
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeMessage, setNoticeMessage] = useState('');
    const [noticeType, setNoticeType] = useState('normal');
    const [isPostingNotice, setIsPostingNotice] = useState(false);

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

    const handleBrickUpload = async () => {
        if (!brickTitle.trim()) {
            toast.error('Please provide a title');
            return;
        }
        if (!brickDownloadUrl.trim()) {
            toast.error('Please provide a download URL');
            return;
        }

        setIsUploading(true);
        try {
            await addDoc(collection(db, 'studyBricks'), {
                title: brickTitle.trim(),
                downloadUrl: brickDownloadUrl.trim(),
                subject: brickSettings.subject,
                description: brickSettings.description.trim(),
                assignedTo: brickSettings.assignedTo || null,
                size: 0,
                uploadedAt: serverTimestamp(),
                createdBy: user?.uid || 'admin'
            });

            const assignedUser = allUsers.find(u => u.id === brickSettings.assignedTo);
            if (assignedUser) {
                toast.success(`Study material "${brickTitle}" added for ${assignedUser.name}!`);
            } else {
                toast.success(`Study material "${brickTitle}" added for all users!`);
            }

            // Reset form
            setBrickTitle('');
            setBrickDownloadUrl('');
            setBrickSettings({ subject: 'maths', description: '', assignedTo: '' });
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    // Post Notice to all users
    const handlePostNotice = async () => {
        if (!noticeTitle.trim()) {
            toast.error('Please provide a notice title');
            return;
        }
        if (!noticeMessage.trim()) {
            toast.error('Please provide a notice message');
            return;
        }

        setIsPostingNotice(true);
        try {
            await addDoc(collection(db, 'notices'), {
                title: noticeTitle.trim(),
                message: noticeMessage.trim(),
                type: noticeType,
                createdAt: serverTimestamp(),
                createdBy: user?.uid || 'admin'
            });

            toast.success('Notice posted successfully!');
            setNoticeTitle('');
            setNoticeMessage('');
            setNoticeType('normal');
        } catch (error) {
            console.error('Notice post error:', error);
            toast.error(`Failed: ${error.message}`);
        } finally {
            setIsPostingNotice(false);
        }
    };


    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Admin Dashboard
                    </h1>
                    <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage content, users, and resources</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Link to="/admin/users" className="block hover-lift">
                    <div className={`rounded-xl p-6 border cursor-pointer transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`font-medium mb-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Users</p>
                                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.users}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-900/50' : 'bg-gradient-to-br from-indigo-50 to-indigo-100'}`}>
                                <Users className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/admin/questions" className="block hover-lift">
                    <div className={`rounded-xl p-6 border cursor-pointer transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`font-medium mb-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Questions</p>
                                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.questions}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-900/50' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'}`}>
                                <Database className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                        </div>
                    </div>
                </Link>

                <div className={`rounded-xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`font-medium mb-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Study Bricks</p>
                            <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>—</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-900/50' : 'bg-gradient-to-br from-amber-50 to-amber-100'}`}>
                            <Book className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {/* Tabs */}
                <div className={`flex border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'questions'
                            ? 'border-indigo-500 text-indigo-500'
                            : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`
                            }`}
                    >
                        Bulk Upload Questions
                    </button>
                    <button
                        onClick={() => setActiveTab('bricks')}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'bricks'
                            ? 'border-indigo-500 text-indigo-500'
                            : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`
                            }`}
                    >
                        Upload Study Bricks
                    </button>
                    <button
                        onClick={() => setActiveTab('notices')}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'notices'
                            ? 'border-indigo-500 text-indigo-500'
                            : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`
                            }`}
                    >
                        <Bell className="w-4 h-4" />
                        Post Notice
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
                                <div className={`p-4 rounded-lg border mb-4 ${isDark ? 'bg-indigo-900/30 border-indigo-800' : 'bg-indigo-50 border-indigo-100'}`}>
                                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>Bulk Upload Instructions</h3>
                                    <p className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                        Paste numbered questions (1. Question...). Options should be on separate lines as A) B) C) D).
                                        All questions will use the settings below.
                                    </p>
                                </div>

                                {/* Bulk Settings */}
                                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                                    <div>
                                        <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subject</label>
                                        <select
                                            value={bulkSettings.subject}
                                            onChange={(e) => setBulkSettings({ ...bulkSettings, subject: e.target.value })}
                                            className={`w-full p-2 border rounded-lg text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="maths">Maths</option>
                                            <option value="physics">Physics</option>
                                            <option value="chemistry">Chemistry</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Chapter *</label>
                                        <input
                                            type="text"
                                            value={bulkSettings.chapter}
                                            onChange={(e) => setBulkSettings({ ...bulkSettings, chapter: e.target.value })}
                                            className={`w-full p-2 border rounded-lg text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900'}`}
                                            placeholder="e.g. Calculus"
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Difficulty</label>
                                        <select
                                            value={bulkSettings.difficulty}
                                            onChange={(e) => setBulkSettings({ ...bulkSettings, difficulty: e.target.value })}
                                            className={`w-full p-2 border rounded-lg text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Assign to User */}
                                <div className={`p-4 rounded-lg border ${isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
                                    <label className={`text-xs font-medium block mb-1 flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                        <Users className="w-3 h-3" /> Assign to User/Institute
                                    </label>
                                    <select
                                        value={bulkSettings.assignedTo}
                                        onChange={(e) => setBulkSettings({ ...bulkSettings, assignedTo: e.target.value })}
                                        className={`w-full p-2.5 border rounded-lg text-sm ${isDark ? 'bg-slate-800 border-emerald-700 text-white' : 'bg-white border-emerald-200 text-slate-900'}`}
                                    >
                                        <option value="">All Users (Global)</option>
                                        <option value="none">Assign to No One</option>
                                        {allUsers.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} {u.institute ? `(${u.institute})` : `(${u.role})`}
                                            </option>
                                        ))}
                                    </select>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Select a user to assign these questions only to them</p>
                                </div>

                                <textarea
                                    className={`w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-none ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
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
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {questionContent ? `~${parseQuestions(questionContent).length} questions detected` : ''}
                                    </p>
                                    <button
                                        onClick={handleQuestionUpload}
                                        disabled={isUploading}
                                        className="px-6 py-2.5 bg-gradient-to-r from-[#d4a574] to-[#c9a961] hover:from-[#c9a961] hover:to-[#d4a574] text-white font-semibold rounded-lg shadow-lg shadow-[#d4a574]/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Add to Bank
                                    </button>
                                </div>
                            </motion.div>
                        ) : activeTab === 'bricks' ? (
                            <motion.div
                                key="bricks"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="max-w-xl mx-auto space-y-5 pt-6"
                            >
                                <div className={`p-4 rounded-lg border mb-4 ${isDark ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>Upload Study Materials</h3>
                                    <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                                        Add study materials (PDFs, documents) for your users. Upload a file directly or paste an external link.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Resource Title *</label>
                                    <input
                                        type="text"
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        placeholder="e.g. JEE Mains 2024 Physics Solutions"
                                        value={brickTitle}
                                        onChange={(e) => setBrickTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Download URL *</label>
                                    <input
                                        type="url"
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        placeholder="https://drive.google.com/file/... or any direct download link"
                                        value={brickDownloadUrl}
                                        onChange={(e) => setBrickDownloadUrl(e.target.value)}
                                    />
                                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Paste a shareable link from Google Drive, Dropbox, OneDrive, etc.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Subject</label>
                                        <select
                                            value={brickSettings.subject}
                                            onChange={(e) => setBrickSettings({ ...brickSettings, subject: e.target.value })}
                                            className={`w-full p-2.5 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="maths">Maths</option>
                                            <option value="physics">Physics</option>
                                            <option value="chemistry">Chemistry</option>
                                            <option value="general">General</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            <Users className="w-3 h-3" /> Assign To
                                        </label>
                                        <select
                                            value={brickSettings.assignedTo}
                                            onChange={(e) => setBrickSettings({ ...brickSettings, assignedTo: e.target.value })}
                                            className={`w-full p-2.5 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        >
                                            <option value="">All Users (Global)</option>
                                            {allUsers.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name} {u.institute ? `(${u.institute})` : `(${u.role})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Description (Optional)</label>
                                    <textarea
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-20 ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        placeholder="Brief description of the material..."
                                        value={brickSettings.description}
                                        onChange={(e) => setBrickSettings({ ...brickSettings, description: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={handleBrickUpload}
                                    disabled={isUploading}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {isUploading ? 'Adding...' : 'Add Material'}
                                </button>
                            </motion.div>
                        ) : activeTab === 'notices' ? (
                            <motion.div
                                key="notices"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="max-w-xl mx-auto space-y-5 pt-6"
                            >
                                <div className={`p-4 rounded-lg border mb-4 ${isDark ? 'bg-indigo-900/30 border-indigo-800' : 'bg-indigo-50 border-indigo-200'}`}>
                                    <h3 className={`font-semibold mb-1 flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>
                                        <Bell className="w-4 h-4" />
                                        Broadcast Notice
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                        Post a notice that all students will see instantly in real-time.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Notice Title *</label>
                                    <input
                                        type="text"
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        placeholder="e.g. Important: Exam Schedule Change"
                                        value={noticeTitle}
                                        onChange={(e) => setNoticeTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Message *</label>
                                    <textarea
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-28 ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        placeholder="Enter the notice message..."
                                        value={noticeMessage}
                                        onChange={(e) => setNoticeMessage(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Notice Type</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNoticeType('normal')}
                                            className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all ${noticeType === 'normal'
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : isDark ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            Normal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNoticeType('urgent')}
                                            className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${noticeType === 'urgent'
                                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                : isDark ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            Urgent
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePostNotice}
                                    disabled={isPostingNotice}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPostingNotice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {isPostingNotice ? 'Posting...' : 'Post Notice'}
                                </button>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

