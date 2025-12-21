import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Search, Filter, Plus, Check, Trash2,
    FileText, Download, GripVertical, AlertCircle, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Toaster, toast } from 'sonner';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import MathRenderer from '../../components/ui/MathRenderer';
import Card from '../../components/ui/Card';

// Sortable Item Component
const SortableItem = ({ question, onRemove }) => {
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
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 group hover:border-slate-500 transition-colors mb-2 relative print-item">
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <button
                    className="mt-1 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-4 h-4" />
                </button>

                <div className="flex-1">
                    <p className="text-sm text-slate-300 line-clamp-2">
                        <MathRenderer>{question.content}</MathRenderer>
                    </p>
                </div>

                <button
                    onClick={() => onRemove(question.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const ExamEngine = () => {
    const { user } = useAuth();
    const availableSubjects = user?.allowedSubjects || ['maths', 'physics', 'chemistry'];
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Will be initialized by useEffect
    const [selectedChapters, setSelectedChapters] = useState([]); // Empty = all chapters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [isExporting, setIsExporting] = useState(false);

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

        console.log("Filter Debug:", {
            user: user?.name,
            firestoreId: user?.firestoreId,
            uid: user?.uid,
            selectedSubjects,
            userAllowedChapters,
            totalQuestions: allQuestions.length
        });

        const filtered = allQuestions.filter(q => {
            // Subject matching - case insensitive
            const qSubject = q.subject?.toLowerCase();
            const matchSubject = selectedSubjects.length === 0 ||
                selectedSubjects.map(s => s.toLowerCase()).includes(qSubject);

            // Chapter matching
            const matchChapter = selectedChapters.length === 0 || selectedChapters.includes(q.chapter);

            // Search matching
            const matchSearch = !searchQuery || q.content?.toLowerCase().includes(searchQuery.toLowerCase());

            // Filter by user assignment (null = global, or assigned to current user)
            // Check both Firebase Auth UID and Firestore document ID since admin assigns using Firestore ID
            const matchUser = !q.assignedTo || q.assignedTo === user?.uid || q.assignedTo === user?.firestoreId;

            // Respect user's chapter restrictions (empty = all allowed)
            const matchAllowedChapter = userAllowedChapters.length === 0 || userAllowedChapters.includes(q.chapter);

            return matchSubject && matchChapter && matchSearch && matchUser && matchAllowedChapter;
        });

        console.log("Filtered questions:", filtered.length);
        setFilteredQuestions(filtered);
    }, [selectedSubjects, selectedChapters, searchQuery, allQuestions, user]);

    // Handlers
    const handleAddQuestion = (question) => {
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

        setIsExporting(true);
        toast.info('Generating PDF...', { duration: 2000 });

        try {
            if (printRef.current) {
                // Use html-to-image which supports modern CSS better
                // We must ensure fonts are loaded.
                const dataUrl = await toPng(printRef.current, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2, // Higher quality
                    width: 794, // Force A4 width in pixels
                });

                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const imgProps = pdf.getImageProperties(dataUrl);
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('studybrick-paper.pdf');

                toast.success('PDF Downloaded successfully!');
            }
        } catch (error) {
            console.error(error);
            toast.error(`Failed to export PDF: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-_theme(spacing.32))] md:h-[calc(100vh-_theme(spacing.16))] -m-8 relative overflow-hidden">
            <Toaster />

            {/*
        LEFT PANEL: Question Bank
      */}
            <div className="w-full md:w-[70%] bg-slate-50 flex flex-col border-r border-slate-200">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Search className="w-5 h-5 text-indigo-600" />
                            Question Bank
                        </h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1 transition-colors">
                                <Filter className="w-4 h-4" /> Filters
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Subject Filter - Multi-select */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-slate-500 mr-2">Subjects:</span>
                            <button
                                onClick={() => setSelectedSubjects(availableSubjects)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${selectedSubjects.length === availableSubjects.length
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search topics, equations..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-2 border-transparent rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Chapter Filter */}
                    {availableChapters.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center mt-3 pt-3 border-t border-slate-200">
                            <span className="text-sm text-slate-500 mr-2">Chapters:</span>
                            <button
                                onClick={() => setSelectedChapters([])}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${selectedChapters.length === 0
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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
                    <AnimatePresence>
                        {filteredQuestions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center h-64 text-slate-400"
                            >
                                <AlertCircle className="w-10 h-10 mb-2 opacity-50 text-indigo-200" />
                                <p>No questions found.</p>
                            </motion.div>
                        ) : (
                            filteredQuestions.map((q, idx) => {
                                const isSelected = selectedQuestions.some(sq => sq.id === q.id);
                                return (
                                    <motion.div
                                        key={q.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className={`p-5 ${isSelected ? 'border-indigo-200 bg-indigo-50/30' : ''}`}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-rose-100 text-rose-700'
                                                            }`}>
                                                            {q.difficulty}
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                                            {q.type}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {q.chapter}
                                                        </span>
                                                    </div>

                                                    <div className="text-slate-800 text-base leading-relaxed font-serif">
                                                        {/* Render Main Content */}
                                                        <MathRenderer>{q.content}</MathRenderer>

                                                        {/* Render Options if MCQ */}
                                                        {q.options && (
                                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {q.options.map((opt, i) => (
                                                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                                                        <span className="font-bold text-slate-400 w-4">{String.fromCharCode(65 + i)}.</span>
                                                                        <MathRenderer>{opt}</MathRenderer>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => !isSelected && handleAddQuestion(q)}
                                                    disabled={isSelected}
                                                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected
                                                        ? 'bg-green-100 text-green-600 scale-90'
                                                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-110 active:scale-95'
                                                        }`}
                                                >
                                                    <AnimatePresence mode='wait'>
                                                        {isSelected ? (
                                                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                                <Check className="w-6 h-6" />
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                                <Plus className="w-6 h-6" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/*
        RIGHT PANEL: Paper Builder (Sortable)
      */}
            <div className="hidden md:flex w-[30%] bg-slate-900 text-slate-200 flex-col border-l border-slate-800 shadow-2xl z-20 relative">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900" />

                <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-900/40">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg tracking-tight">Paper Builder</h3>
                            <p className="text-xs text-slate-400 font-medium">Drag to reorder</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 text-center">
                            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1">Questions</span>
                            <span className="text-xl font-bold text-white font-mono">{selectedQuestions.length}</span>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 text-center">
                            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1">Est. Time</span>
                            <span className="text-xl font-bold text-emerald-400 font-mono">{selectedQuestions.length * 3} <span className="text-xs text-emerald-600">min</span></span>
                        </div>
                    </div>
                </div>

                {/* Capture Area for PDF */}
                <div className="flex-1 overflow-y-auto p-4 z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <div className="pb-20"> {/* Wrapper for DND */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={selectedQuestions.map(q => q.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {selectedQuestions.length === 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="text-center py-12 px-4 border-2 border-dashed border-slate-800 rounded-xl"
                                            >
                                                <p className="text-slate-500 text-sm">Your paper is empty.</p>
                                                <p className="text-slate-600 text-xs mt-2">Questions added will appear here.</p>
                                            </motion.div>
                                        )}
                                        {selectedQuestions.map((q) => (
                                            <SortableItem key={q.id} question={q} onRemove={handleRemoveQuestion} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur z-20 space-y-4">

                    {/* PDF Settings */}
                    <div className="space-y-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div>
                            <label className="text-xs text-slate-400 font-medium ml-1">Institute Name</label>
                            <input
                                type="text"
                                value={pdfSettings.instituteName}
                                onChange={(e) => setPdfSettings({ ...pdfSettings, instituteName: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                                placeholder="Enter Institute Name"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-medium ml-1">Exam Title</label>
                            <input
                                type="text"
                                value={pdfSettings.examTitle}
                                onChange={(e) => setPdfSettings({ ...pdfSettings, examTitle: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                                placeholder="e.g. JEE Mains Mock 1"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 className="w-5 h-4 animate-spin" /> : <Download className="w-5 h-5" />}
                        {isExporting ? 'Generating PDF...' : 'Export Paper PDF'}
                    </button>
                </div>
            </div>

            {/*
                HIDDEN PRINT TEMPLATE
                Positioned FIXED behind the main content to ensure browser paints it.
                Using z-index -1000 to hide it from user view but keep it strictly rendered.
            */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '794px', // A4 pixel width
                    minHeight: '1123px',
                    zIndex: -1000,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontFamily: 'serif',
                    padding: '40px',
                    pointerEvents: 'none' // Ensure no interaction
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
        </div>
    );
};

export default ExamEngine;
