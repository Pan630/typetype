import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/authProvider";
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PracticeLetter from "../component/PracticeLetter";
import { Link } from "react-router-dom";

const fetchErrorLettersWithState = async (userId) => {
    const results = {};
    const practicedLetters = {};

    try {
        const recordsRef = collection(db, "TestResults");
        const q = query(recordsRef, where("userId", "==", userId), orderBy("testTime", "desc"), limit(1));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const errors = data.errorLetters || {};
            for (const [char, count] of Object.entries(errors)) {
                results[char] = (results[char] || 0) + count;
            }
        });

        const recordRef = doc(db, "PracticeRecords", userId);
        const recordDoc = await getDoc(recordRef);
        if (recordDoc.exists()) {
            Object.assign(practicedLetters, recordDoc.data().practicedLetters || {});
        }

        const errorWithState = Object.entries(results)
            .map(([char, count]) => ({
                char,
                count,
                passed: practicedLetters[char]?.passed || false,
            }))
            .filter(({ passed }) => !passed)
            .sort((a, b) => b.count - a.count);

        return errorWithState;
    } catch (error) {
        console.error("Error fetching error letters:", error);
        return [];
    }
};

const TypingPractice = () => {
    const { currentUser, userLoggedIn } = useAuth();
    const [errorLetters, setErrorLetters] = useState([]);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const hasNavigated = useRef(false);
    const [completedLetter, setCompletedLetter] = useState(null);

    const fetchData = async () => {
        if (userLoggedIn && currentUser) {
            const errors = await fetchErrorLettersWithState(currentUser.uid);
            setErrorLetters(errors);
            setLoading(false);
        } else {
            if (!hasNavigated.current) {
                hasNavigated.current = true;
                navigate('/Login');
                toast.info("You have to login to continue.", {
                    position: "bottom-center",
                });
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser, userLoggedIn]);

    const handleComplete = (letter) => {
        setCompletedLetter(letter); // Set the letter to be removed
        setSelectedLetter(null);    // Clear the selected letter to navigate back
        fetchErrorLettersWithState(currentUser.uid); // Refresh the error letters after practice
    };

    useEffect(() => {
        if (completedLetter) {
            setErrorLetters((prev) => prev.filter((item) => item.char !== completedLetter));
            setCompletedLetter(null); // Reset the completed letter
        }
    }, [completedLetter]);

    if (selectedLetter) {
        return (
            <PracticeLetter
                letter={selectedLetter}
                onComplete={handleComplete}
                onBack={() => setSelectedLetter(null)} // Reset selectedLetter to go back
            />
        );
    }

    return (
        <div className="max-w-[1240px] w-full h-screen mx-auto text-center flex-col justify-center my-10 md:px-10">
            <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 ">Select a Letter to Practice</h1>
            {loading ? (
                <p className="text-lg font-semibold">Loading...</p>
            ) : (errorLetters.length == 0 ? (
                <p className="font-semibold text-xl mt-6">A <Link to="/TypingTest" className="text-[#375224] underline underline-offset-8">Typing test</Link> is required before you can continue.</p>
            ) : (
                <div className="grid grid-cols-6 gap-6 px-10">
                    {errorLetters.map(({ char }) => (
                        <button
                            key={char}
                            onClick={() => setSelectedLetter(char)}
                            className={"p-2 rounded bg-[#476730] font-semibold text-2xl text-white"}
                        >
                            {char}
                        </button>
                    ))}
                </div>
            )
            )}
        </div>
    );
};

export default TypingPractice;
