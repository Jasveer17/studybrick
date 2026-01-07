import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { collection, query, where, onSnapshot, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let unsubscribeProfile = null;
        let loadingResolved = false;

        // Helper to set loading false safely
        const resolveLoading = () => {
            if (!loadingResolved && isMounted) {
                loadingResolved = true;
                setIsLoading(false);
            }
        };

        // Safety timeout in case Firebase hangs
        const timeout = setTimeout(() => {
            if (isMounted && !loadingResolved) {
                resolveLoading();
            }
        }, 3000);

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!isMounted) return;

            // Clean up previous profile listener
            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            if (firebaseUser) {
                try {
                    // Query by email instead of UID (since admin creates users with auto-generated IDs)
                    const usersQuery = query(
                        collection(db, 'users'),
                        where('email', '==', firebaseUser.email)
                    );

                    unsubscribeProfile = onSnapshot(usersQuery, (snapshot) => {
                        if (!isMounted) return;

                        if (!snapshot.empty) {
                            const userDoc = snapshot.docs[0];
                            setUser({
                                uid: firebaseUser.uid,
                                firestoreId: userDoc.id,
                                email: firebaseUser.email,
                                ...userDoc.data()
                            });
                        } else {
                            // Fallback if no firestore doc exists yet
                            console.log("AuthContext: No Firestore profile found for email:", firebaseUser.email);
                            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'student' });
                        }
                        resolveLoading();
                    }, (error) => {
                        console.error("Error listening to user profile:", error);
                        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'student' });
                        resolveLoading();
                    });
                } catch (error) {
                    console.error("Error setting up user profile listener:", error);
                    setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'student' });
                    resolveLoading();
                }
            } else {
                setUser(null);
                resolveLoading();
            }
            clearTimeout(timeout);
        }, (error) => {
            console.error("AuthContext: Auth Error", error);
            resolveLoading();
        });

        return () => {
            isMounted = false;
            unsubscribe();
            if (unsubscribeProfile) unsubscribeProfile();
            clearTimeout(timeout);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Query user profile from Firestore by email (since admin creates users with auto-generated IDs)
            const usersQuery = query(
                collection(db, 'users'),
                where('email', '==', firebaseUser.email)
            );
            const snapshot = await getDocs(usersQuery);

            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0];
                const firestoreData = userDoc.data();
                const userData = {
                    uid: firebaseUser.uid,
                    firestoreId: userDoc.id,
                    email: firebaseUser.email,
                    ...firestoreData
                };
                setUser(userData);
                return userData;
            } else {
                // Fallback: no profile in Firestore
                const userData = { uid: firebaseUser.uid, email: firebaseUser.email, role: 'student' };
                setUser(userData);
                return userData;
            }
        } catch (error) {
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            // Check if user exists in Firestore
            const usersQuery = query(
                collection(db, 'users'),
                where('email', '==', firebaseUser.email)
            );
            const snapshot = await getDocs(usersQuery);

            let userData;
            if (!snapshot.empty) {
                // User exists, get their data
                const userDoc = snapshot.docs[0];
                userData = {
                    uid: firebaseUser.uid,
                    firestoreId: userDoc.id,
                    email: firebaseUser.email,
                    ...userDoc.data()
                };
            } else {
                // Create new user profile for Google sign-in users
                const newUserData = {
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || '',
                    role: 'student',
                    status: 'active',
                    profilePicture: firebaseUser.photoURL || null, // Auto-capture Google profile pic
                    profileComplete: false, // Needs onboarding
                    totalScore: 0,
                    streak: 0,
                    questionsAttempted: 0,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    authProvider: 'google'
                };

                const userDocRef = doc(collection(db, 'users'));
                await setDoc(userDocRef, newUserData);

                userData = {
                    uid: firebaseUser.uid,
                    firestoreId: userDocRef.id,
                    ...newUserData,
                    isNewUser: true // Flag for redirect logic
                };
            }

            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Google Sign-In error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('studybrick_user'); // Clean up old mock data if present
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading: isLoading, isAuthenticated: !!user }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
