import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Search, Filter, Plus, Check, Trash2,
    FileText, Download, GripVertical, AlertCircle, X, Loader2
} from 'lucide-react';
// Animation imports removed for instant UI
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Toaster, toast } from 'sonner';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import MathRenderer from '../../components/ui/MathRenderer';
import Card from '../../components/ui/Card';

// Sortable Item Component - With Dark Mode Support
const SortableItem = ({ question, onRemove }) => {
    const { isDark } = useTheme();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 0.15s ease-out',
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-3 rounded-lg border group transition-[border-color,box-shadow] duration-150 mb-2 ${isDragging
                ? 'border-indigo-400 shadow-lg'
                : isDark
                    ? 'bg-slate-700 border-slate-600 hover:border-indigo-500'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <button
                    className={`mt-1.5 p-1 rounded cursor-grab active:cursor-grabbing transition-all duration-100 ${isDark
                        ? 'text-[#6E6E73] hover:text-[#A1A1A6] hover:bg-[#2c2c2e]'
                        : 'text-[#aeaeb2] hover:text-[#636366] hover:bg-[#f5f5f7]'
                        }`}
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0">
                    <p className={`text-sm line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ fontFamily: '"Times New Roman", "Cambria Math", serif' }}>
                        <MathRenderer>{question.content}</MathRenderer>
                    </p>
                </div>

                <button
                    onClick={() => onRemove(question.id)}
                    className={`p-1.5 rounded-md transition-all duration-100 opacity-0 group-hover:opacity-100 mt-1 ${isDark
                        ? 'text-[#8e8e93] hover:text-[#ff6b6b] hover:bg-[#ff6b6b]/10'
                        : 'text-[#8e8e93] hover:text-[#ef4444] hover:bg-[#ef4444]/10'
                        }`}
                    title="Remove from paper"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const ExamEngine = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const availableSubjects = user?.allowedSubjects || ['maths', 'physics', 'chemistry'];
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Will be initialized by useEffect
    const [selectedChapters, setSelectedChapters] = useState([]); // Empty = all chapters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState(() => {
        // Load from localStorage on initial render
        const saved = localStorage.getItem('paperBuilderQuestions');
        try {
            const parsed = saved ? JSON.parse(saved) : [];
            // Limit to max 100 questions on load
            return Array.isArray(parsed) ? parsed.slice(0, 100) : [];
        } catch {
            return [];
        }
    });
    const [isExporting, setIsExporting] = useState(false);

    // Rate limiting for PDF exports (max 5 per hour)
    const MAX_EXPORTS_PER_HOUR = 5;
    const MAX_QUESTIONS_PER_PAPER = 100;

    const canExportPDF = () => {
        const exportHistory = JSON.parse(localStorage.getItem('pdfExportHistory') || '[]');
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentExports = exportHistory.filter(timestamp => timestamp > oneHourAgo);
        return recentExports.length < MAX_EXPORTS_PER_HOUR;
    };

    const recordExport = () => {
        const exportHistory = JSON.parse(localStorage.getItem('pdfExportHistory') || '[]');
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentExports = exportHistory.filter(timestamp => timestamp > oneHourAgo);
        recentExports.push(Date.now());
        localStorage.setItem('pdfExportHistory', JSON.stringify(recentExports));
    };

    // Save selected questions to localStorage whenever they change (with limit)
    useEffect(() => {
        const limitedQuestions = selectedQuestions.slice(0, MAX_QUESTIONS_PER_PAPER);
        localStorage.setItem('paperBuilderQuestions', JSON.stringify(limitedQuestions));
    }, [selectedQuestions]);

    // Real Data State
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize selectedSubjects when user loads
    useEffect(() => {
        if (user?.allowedSubjects && selectedSubjects.length === 0) {
            setSelectedSubjects(user.allowedSubjects);
        } else if (!user?.allowedSubjects && selectedSubjects.length === 0) {
            setSelectedSubjects(['maths', 'physics', 'chemistry']);
        }
    }, [user]);

    // PDF Settings State
    const [pdfSettings, setPdfSettings] = useState({
        instituteName: 'StudyBrick Institute',
        examTitle: 'Mock Test 1'
    });
    const printRef = useRef(null);

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch Questions from Firestore
    useEffect(() => {
        const q = query(collection(db, 'questions'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const questions = [];
            querySnapshot.forEach((doc) => {
                questions.push({ id: doc.id, ...doc.data() });
            });
            setAllQuestions(questions);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Get available chapters from questions matching selected subjects
    // Also respect user's allowedChapters if set
    const availableChapters = useMemo(() => {
        const chapters = new Set();
        const userAllowedChapters = user?.allowedChapters || [];

        allQuestions.forEach(q => {
            if (selectedSubjects.includes(q.subject?.toLowerCase()) && q.chapter) {
                // If user has chapter restrictions, only show allowed ones
                if (userAllowedChapters.length === 0 || userAllowedChapters.includes(q.chapter)) {
                    chapters.add(q.chapter);
                }
            }
        });
        return Array.from(chapters).sort();
    }, [allQuestions, selectedSubjects, user]);

    // Reset chapters when subjects change
    useEffect(() => {
        setSelectedChapters([]);
    }, [selectedSubjects]);

    // Filter Logic - now supports multiple subjects and chapters
    // Also respects user's allowedSubjects and allowedChapters permissions
    useEffect(() => {
        const userAllowedChapters = user?.allowedChapters || [];

        const filtered = allQuestions.filter(q => {
            // Subject matching - case insensitive
            const qSubject = q.subject?.toLowerCase();
            const matchSubject = selectedSubjects.length === 0 ||
                selectedSubjects.map(s => s.toLowerCase()).includes(qSubject);

            // Chapter matching
            const matchChapter = selectedChapters.length === 0 || selectedChapters.includes(q.chapter);

            // Search matching - check content, subject, and chapter
            const query = searchQuery.toLowerCase();
            const matchSearch = !searchQuery ||
                q.content?.toLowerCase().includes(query) ||
                q.subject?.toLowerCase().includes(query) ||
                q.chapter?.toLowerCase().includes(query);

            // Filter by user assignment (null = global, or assigned to current user)
            // Check UID, Firestore document ID, and email since admin assigns using Firestore ID
            const matchUser = !q.assignedTo ||
                q.assignedTo === user?.uid ||
                q.assignedTo === user?.firestoreId ||
                q.assignedTo === user?.email;

            // Respect user's chapter restrictions (empty or contains "all" = all allowed)
            const matchAllowedChapter = userAllowedChapters.length === 0 ||
                userAllowedChapters.includes('all') ||
                userAllowedChapters.includes(q.chapter);

            return matchSubject && matchChapter && matchSearch && matchUser && matchAllowedChapter;
        });

        setFilteredQuestions(filtered);
    }, [selectedSubjects, selectedChapters, searchQuery, allQuestions, user]);

    // Handlers
    const handleAddQuestion = (question) => {
        // Enforce question limit
        if (selectedQuestions.length >= MAX_QUESTIONS_PER_PAPER) {
            toast.error(`Maximum ${MAX_QUESTIONS_PER_PAPER} questions allowed per paper`, {
                position: 'bottom-right',
                duration: 3000
            });
            return;
        }
        if (!selectedQuestions.find(q => q.id === question.id)) {
            setSelectedQuestions([...selectedQuestions, question]);
            toast.success('Question added to paper', {
                position: 'bottom-right',
                duration: 2000,
                className: 'bg-indigo-600 text-white border-none'
            });
        }
    };

    const handleRemoveQuestion = (id) => {
        setSelectedQuestions(selectedQuestions.filter(q => q.id !== id));
        toast.info('Question removed', { position: 'bottom-right' });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!!over && active.id !== over.id) {
            setSelectedQuestions((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleExportPDF = async () => {
        if (selectedQuestions.length === 0) {
            toast.error('Add questions before exporting');
            return;
        }

        // Rate limiting check
        if (!canExportPDF()) {
            toast.error('Export limit reached. Please try again later.', {
                description: `Maximum ${MAX_EXPORTS_PER_HOUR} exports per hour allowed.`,
                duration: 5000
            });
            return;
        }

        setIsExporting(true);
        toast.info('Generating PDF...', { duration: 2000 });

        try {
            if (printRef.current) {
                // Temporarily make the print element visible for rendering
                printRef.current.style.opacity = '1';
                printRef.current.style.left = '0';

                // Use html-to-image which supports modern CSS better
                const dataUrl = await toPng(printRef.current, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2,
                    width: 794,
                });

                // Hide it again immediately
                printRef.current.style.opacity = '0';
                printRef.current.style.left = '-9999px';

                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const imgProps = pdf.getImageProperties(dataUrl);
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('studybrick-paper.pdf');

                // Record successful export for rate limiting
                recordExport();
                toast.success('PDF Downloaded successfully!');
            }
        } catch (error) {
            toast.error('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    // Show loading state immediately to prevent layout shift
    if (loading) {
        return (
            <div className={`flex h-[calc(100vh-4rem)] -m-4 items-center justify-center ${isDark ? 'bg-[#0a0f1a]' : 'bg-slate-50'}`}>
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex h-[calc(100vh-4rem)] -m-4 -mb-4 overflow-hidden ${isDark ? 'bg-[#0B0B0B]' : 'bg-[#f5f5f7]'}`}>
            <Toaster />

            {/*
        LEFT PANEL: Question Bank
      */}
            <div className={`w-full md:w-[70%] flex flex-col border-r ${isDark ? 'bg-[#0B0B0B] border-[#2A2A2A]' : 'bg-[#f5f5f7] border-[#e8e8ed]'}`}>

                {/* Header */}
                <div className={`border-b px-5 py-4 sticky top-0 z-10 ${isDark ? 'bg-[#0B0B0B] border-[#2A2A2A]' : 'bg-white border-[#e8e8ed]'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-[#F5F5F7]' : 'text-[#1c1c1e]'}`}>
                            <Search className="w-4 h-4 text-[#5B6EAE]" />
                            Question Bank
                        </h2>
                        <div className="flex gap-2">
                            <button className={`px-2.5 py-1.5 text-[12px] font-medium rounded-md flex items-center gap-1 transition-colors duration-100 ${isDark ? 'text-[#A1A1A6] bg-[#2A2A2A] hover:bg-[#3a3a3c]' : 'text-[#636366] bg-[#f5f5f7] hover:bg-[#e8e8ed]'}`}>
                                <Filter className="w-3.5 h-3.5" /> Filters
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Subject Filter - Multi-select */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className={`text-sm mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subjects:</span>
                            <button
                                onClick={() => setSelectedSubjects(availableSubjects)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${selectedSubjects.length === availableSubjects.length
                                    ? 'bg-indigo-600 text-white'
                                    : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                All
                            </button>
                            {availableSubjects.map(sub => {
                                const isSelected = selectedSubjects.includes(sub);
                                return (
                                    <button
                                        key={sub}
                                        onClick={() => {
                                            if (isSelected) {
                                                // Don't allow deselecting all
                                                if (selectedSubjects.length > 1) {
                                                    setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
                                                }
                                            } else {
                                                setSelectedSubjects([...selectedSubjects, sub]);
                                            }
                                        }}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-all flex items-center gap-1 ${isSelected
                                            ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300'
                                            : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {isSelected && <Check className="w-3 h-3" />}
                                        {sub}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-64 group">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
                            <input
                                type="text"
                                placeholder="Search topics, equations..."
                                className={`w-full pl-10 pr-4 py-2 border-2 border-transparent rounded-xl text-sm focus:ring-0 transition-all ${isDark ? 'bg-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-600 focus:border-indigo-500' : 'bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500'}`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Chapter Filter */}
                    {availableChapters.length > 0 && (
                        <div className={`flex flex-wrap gap-2 items-center mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <span className={`text-sm mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Chapters:</span>
                            <button
                                onClick={() => setSelectedChapters([])}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${selectedChapters.length === 0
                                    ? 'bg-emerald-600 text-white'
                                    : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                All ({availableChapters.length})
                            </button>
                            {availableChapters.map(chapter => {
                                const isSelected = selectedChapters.includes(chapter);
                                return (
                                    <button
                                        key={chapter}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedChapters(selectedChapters.filter(c => c !== chapter));
                                            } else {
                                                setSelectedChapters([...selectedChapters, chapter]);
                                            }
                                        }}
                                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${isSelected
                                            ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
                                            : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {isSelected && <Check className="w-3 h-3" />}
                                        {chapter}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                    {filteredQuestions.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center h-64 fade-in ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            <AlertCircle className={`w-10 h-10 mb-2 opacity-50 ${isDark ? 'text-slate-600' : 'text-indigo-200'}`} />
                            <p>No questions found.</p>
                        </div>
                    ) : (
                        filteredQuestions.map((q) => {
                            const isSelected = selectedQuestions.some(sq => sq.id === q.id);
                            return (
                                <div
                                    key={q.id}
                                    className={`p-4 rounded-lg border transition-colors duration-120 ${isSelected
                                        ? isDark ? 'border-[#5B6EAE] bg-[#5B6EAE]/5' : 'border-[#5B6EAE] bg-[#5B6EAE]/5'
                                        : isDark ? 'bg-[#1c1c1e] border-[#3a3a3c]' : 'bg-white border-[#e8e8ed]'}`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            {/* Quiet metadata row */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[11px] font-medium uppercase ${q.difficulty === 'Easy'
                                                    ? 'text-[#22c55e]'
                                                    : q.difficulty === 'Medium'
                                                        ? 'text-[#eab308]'
                                                        : 'text-[#ef4444]'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                                <span className={`text-[11px] ${isDark ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`}>·</span>
                                                <span className={`text-[11px] ${isDark ? 'text-[#8e8e93]' : 'text-[#636366]'}`}>
                                                    {q.type}
                                                </span>
                                                <span className={`text-[11px] ${isDark ? 'text-[#8e8e93]' : 'text-[#8e8e93]'}`}>·</span>
                                                <span className={`text-[11px] ${isDark ? 'text-[#636366]' : 'text-[#8e8e93]'}`}>
                                                    {q.chapter}
                                                </span>
                                            </div>

                                            {/* Question content - highest priority */}
                                            <div className={`text-[15px] leading-relaxed ${isDark ? 'text-[#e8e8ed]' : 'text-[#1c1c1e]'}`}>
                                                <MathRenderer>{q.content}</MathRenderer>

                                                {/* Options if MCQ */}
                                                {q.options && (
                                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                                        {q.options.map((opt, i) => (
                                                            <div key={i} className={`flex items-center gap-2 text-[13px] p-2 rounded-md ${isDark ? 'bg-[#2c2c2e] text-[#aeaeb2]' : 'bg-[#f5f5f7] text-[#636366]'}`}>
                                                                <span className="font-medium text-[#8e8e93] w-4">{String.fromCharCode(65 + i)}.</span>
                                                                <MathRenderer>{opt}</MathRenderer>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Toggle add/remove button */}
                                        <button
                                            onClick={() => isSelected ? handleRemoveQuestion(q.id) : handleAddQuestion(q)}
                                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-100 ${isSelected
                                                ? isDark ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 hover:bg-[#ef4444]/10 hover:text-[#ef4444] hover:border-[#ef4444]/30' : 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 hover:bg-[#ef4444]/10 hover:text-[#ef4444] hover:border-[#ef4444]/30'
                                                : isDark ? 'border border-[#3a3a3c] text-[#8e8e93] hover:bg-[#2c2c2e] hover:text-white' : 'border border-[#d2d2d7] text-[#8e8e93] hover:bg-[#f5f5f7] hover:text-[#1c1c1e]'
                                                }`}
                                            title={isSelected ? 'Remove from paper' : 'Add to paper'}
                                        >
                                            {isSelected ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Plus className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/*
        RIGHT PANEL: Paper Builder - Premium Design with Dark Mode
      */}
            <div className={`hidden md:flex w-[30%] flex-col border-l shadow-lg z-20 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {/* Header */}
                <div className={`p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    {/* Paper Builder Header - Simplified */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#5B6EAE] rounded-lg">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className={`font-semibold text-[15px] ${isDark ? 'text-[#F5F5F7]' : 'text-[#1c1c1e]'}`}>Paper Builder</h3>
                            <p className={`text-[11px] ${isDark ? 'text-[#6E6E73]' : 'text-[#8e8e93]'}`}>Drag to reorder</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className={`p-3 rounded-lg border text-center ${isDark ? 'bg-[#1C1C1E] border-[#2A2A2A]' : 'bg-white border-[#e8e8ed]'}`}>
                            <span className={`text-[10px] uppercase tracking-wide font-medium block mb-0.5 ${isDark ? 'text-[#6E6E73]' : 'text-[#8e8e93]'}`}>Questions</span>
                            <span className={`text-xl font-semibold ${isDark ? 'text-[#F5F5F7]' : 'text-[#1c1c1e]'}`}>{selectedQuestions.length}</span>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${isDark ? 'bg-[#1C1C1E] border-[#2A2A2A]' : 'bg-white border-[#e8e8ed]'}`}>
                            <span className={`text-[10px] uppercase tracking-wide font-medium block mb-0.5 ${isDark ? 'text-[#6E6E73]' : 'text-[#8e8e93]'}`}>Est. Time</span>
                            <span className="text-xl font-semibold text-[#5B6EAE]">{selectedQuestions.length * 3}<span className="text-[11px] ml-0.5">min</span></span>
                        </div>
                    </div>
                </div>

                {/* Questions List */}
                <div className={`flex-1 overflow-y-auto p-4 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={selectedQuestions.map(q => q.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {selectedQuestions.length === 0 && (
                                    <div className="text-center py-16 px-6">
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                            <FileText className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                                        </div>
                                        <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Your paper is empty</p>
                                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Add questions from the left panel</p>
                                    </div>
                                )}
                                {selectedQuestions.map((q) => (
                                    <SortableItem key={q.id} question={q} onRemove={handleRemoveQuestion} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                {/* Footer with PDF Settings */}
                <div className={`p-4 border-t space-y-3 ${isDark ? 'border-[#2A2A2A] bg-[#161616]' : 'border-[#e8e8ed] bg-white'}`}>
                    <div className="space-y-2">
                        <div>
                            <label className={`text-[10px] uppercase tracking-wide font-medium mb-1 block ${isDark ? 'text-[#6E6E73]' : 'text-[#8e8e93]'}`}>Institute Name</label>
                            <input
                                type="text"
                                value={pdfSettings.instituteName}
                                onChange={(e) => setPdfSettings({ ...pdfSettings, instituteName: e.target.value })}
                                className={`w-full border rounded-lg px-3 py-2 text-[13px] focus:border-[#5B6EAE] focus:outline-none transition-colors duration-100 ${isDark ? 'bg-[#1C1C1E] border-[#2A2A2A] text-[#F5F5F7] placeholder:text-[#6E6E73]' : 'bg-[#f5f5f7] border-[#e8e8ed] text-[#1c1c1e]'}`}
                                placeholder="Enter Institute Name"
                            />
                        </div>
                        <div>
                            <label className={`text-[10px] uppercase tracking-wide font-medium mb-1 block ${isDark ? 'text-[#6E6E73]' : 'text-[#8e8e93]'}`}>Exam Title</label>
                            <input
                                type="text"
                                value={pdfSettings.examTitle}
                                onChange={(e) => setPdfSettings({ ...pdfSettings, examTitle: e.target.value })}
                                className={`w-full border rounded-lg px-3 py-2 text-[13px] focus:border-[#5B6EAE] focus:outline-none transition-colors duration-100 ${isDark ? 'bg-[#1C1C1E] border-[#2A2A2A] text-[#F5F5F7] placeholder:text-[#6E6E73]' : 'bg-[#f5f5f7] border-[#e8e8ed] text-[#1c1c1e]'}`}
                                placeholder="e.g. JEE Mains Mock 1"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting || selectedQuestions.length === 0}
                        className="w-full py-2.5 px-4 bg-[#5B6EAE] hover:bg-[#4a5a94] text-white font-medium text-[13px] rounded-lg flex items-center justify-center gap-2 transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isExporting ? 'Generating...' : 'Export Paper PDF'}
                    </button>
                </div>
            </div>

            {/*
                HIDDEN PRINT TEMPLATE
                Moved off-screen and made invisible. Uses opacity:0 and left:-9999 to ensure
                browser paints it for html-to-image but user never sees it.
            */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '-9999px',
                    width: '794px', // A4 pixel width
                    minHeight: '1123px',
                    opacity: 0,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontFamily: '"Times New Roman", "Cambria Math", "STIX Two Math", serif',
                    padding: '40px',
                    pointerEvents: 'none'
                }}
                ref={printRef}
            >
                {/* Exam Header */}
                <div style={{ borderBottom: '2px solid #000', marginBottom: '30px', paddingBottom: '20px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                        {pdfSettings.instituteName}
                    </h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500' }}>
                        <span><strong>Exam:</strong> {pdfSettings.examTitle}</span>
                        <span><strong>Subject:</strong> {selectedSubjects.join(', ').toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500', marginTop: '5px' }}>
                        <span><strong>Time:</strong> {selectedQuestions.length * 3} Mins</span>
                        <span><strong>Max Marks:</strong> {selectedQuestions.length * 4}</span>
                    </div>
                </div>

                {/* Instructions */}
                <div style={{ marginBottom: '30px', fontSize: '12px', fontStyle: 'italic', border: '1px solid #ccc', padding: '10px' }}>
                    <strong>Instructions:</strong>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '5px' }}>
                        <li>All questions are compulsory.</li>
                        <li>Each question carries 4 marks.</li>
                        <li>There is no negative marking for this mock test.</li>
                    </ul>
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {selectedQuestions.map((q, idx) => (
                        <div key={q.id} style={{ breakInside: 'avoid' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <span style={{ fontWeight: 'bold', minWidth: '25px' }}>{idx + 1}.</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                                        <MathRenderer>{q.content}</MathRenderer>
                                    </div>

                                    {q.options && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            {q.options.map((opt, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 'bold' }}>({String.fromCharCode(97 + i)})</span>
                                                    <MathRenderer>{opt}</MathRenderer>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    Generated by StudyBrick Exam Engine
                </div>
            </div>
        </div >
    );
};

export default ExamEngine;
