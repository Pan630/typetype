import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase"; // Ensure these are correctly imported
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [role, setRole] = useState(null); // New state to store the user's role
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser({ ...user });
                setUserLoggedIn(true);

                // Fetch role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "Users", user.uid)); // Update the path as needed
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setRole(userData.role || "user"); // Default to "user" if role is not found
                    } else {
                        setRole(null); // Handle case where user document doesn't exist
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole(null);
                }
            } else {
                // User is logged out
                setCurrentUser(null);
                setUserLoggedIn(false);
                setRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userLoggedIn,
        role,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
};


