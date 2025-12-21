import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, writeBatch, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { mockQuestions } from '../../data/mockQuestions';
import { Loader2, Database, Check, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'sonner';

const SeedDatabase = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [status, setStatus] = useState('idle');
    const [userStatus, setUserStatus] = useState('idle');

    // IMPORTANT: These UIDs must match your Firebase Authentication users
    // You can find them in Firebase Console > Authentication > Users
    const defaultUsers = [
        {
            uid: 'PByRahATxqR9yNbDmYupV8GIPjB3', // Admin's Firebase Auth UID
            email: 'admin@studybrick.com',
            name: 'Admin User',
            role: 'admin',
            institute: 'StudyBrick HQ',
            plan: 'enterprise',
            planExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            allowedSubjects: ['maths', 'physics', 'chemistry'],
            status: 'active'
        },
        // Add more users here with their actual Firebase Auth UIDs
    ];

    const handleSeedQuestions = async () => {
        setIsLoading(true);
        setStatus('loading');
        try {
            const batch = writeBatch(db);
            const questionsRef = collection(db, 'questions');

            mockQuestions.forEach((q) => {
                const docRef = doc(questionsRef, String(q.id));
                batch.set(docRef, { ...q, createdAt: new Date() });
            });

            await batch.commit();
            setStatus('success');
            toast.success(`Successfully uploaded ${mockQuestions.length} questions!`);
        } catch (error) {
            console.error("Detailed Error:", error);
            setStatus('error');
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeedUsers = async () => {
        setIsLoadingUsers(true);
        setUserStatus('loading');
        try {
            for (const user of defaultUsers) {
                const { uid, ...userData } = user;
                await setDoc(doc(db, 'users', uid), {
                    ...userData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
            setUserStatus('success');
            toast.success(`Created ${defaultUsers.length} user profile(s)!`);
        } catch (error) {
            console.error("User Seed Error:", error);
            setUserStatus('error');
            toast.error(`Failed: ${error.message}`);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Database className="w-8 h-8 text-indigo-400" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Database Seeder</h1>
                    <p className="text-slate-400 text-sm">
                        Initialize your Firebase Firestore with default data.
                    </p>
                </div>

                {/* Questions Section */}
                <div className="space-y-3 p-4 bg-slate-900/50 rounded-xl">
                    <h3 className="text-sm font-medium text-slate-300 text-left">1. Questions</h3>
                    {status === 'success' && (
                        <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg text-xs flex items-center gap-2 justify-center">
                            <Check className="w-3 h-3" /> Questions uploaded!
                        </div>
                    )}
                    <button
                        onClick={handleSeedQuestions}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        Seed Questions
                    </button>
                </div>

                {/* Users Section */}
                <div className="space-y-3 p-4 bg-slate-900/50 rounded-xl">
                    <h3 className="text-sm font-medium text-slate-300 text-left">2. User Profiles</h3>
                    <p className="text-xs text-slate-500 text-left">
                        Creates Firestore profiles for your Firebase Auth users (admin, etc.)
                    </p>
                    {userStatus === 'success' && (
                        <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg text-xs flex items-center gap-2 justify-center">
                            <Check className="w-3 h-3" /> User profiles created!
                        </div>
                    )}
                    {userStatus === 'error' && (
                        <div className="bg-red-500/10 text-red-400 p-2 rounded-lg text-xs flex items-center gap-2 justify-center">
                            <AlertTriangle className="w-3 h-3" /> Check console
                        </div>
                    )}
                    <button
                        onClick={handleSeedUsers}
                        disabled={isLoadingUsers}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                        {isLoadingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                        Create User Profiles
                    </button>
                </div>

                <p className="text-xs text-slate-600">
                    Admin UID: PByRahATxqR9yNbDmYupV8GIPjB3
                </p>
            </div>
        </div>
    );
};

export default SeedDatabase;

