import React, { useState, useEffect, useRef } from "react";
import { generate } from "random-words";
import { useAuth } from "../contexts/authProvider";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase/firebase';
import { toast } from "react-toastify";

const TypingGame = () => {
    const { currentUser, userLoggedIn } = useAuth();
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser && userLoggedIn) {
                const docRef = doc(db, "Users", currentUser.uid);
                const docInfo = await getDoc(docRef);
                if (docInfo.exists()) {
                    setUserDetails(docInfo.data());
                    // console.log('User ID:', currentUser.uid);
                } else {
                    console.log("user is not logged in");
                }
            } else {
                console.log("No user is logged in.");
            }
        };
        fetchUserData();
    }, [currentUser]);

    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [mode, setMode] = useState("word"); // Default mode is word
    const [content, setContent] = useState("");
    const [charIndex, setCharIndex] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [correctWrong, setCorrectWrong] = useState([]);
    const [accuracy, setAccuracy] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameConquer, setGameConquer] = useState(false);
    const [lostLifeIndex, setLostLifeIndex] = useState(null);

    const inputRef = useRef(null);
    const charRefs = useRef([]);

    useEffect(() => {
        setContent(generateContent());
        inputRef.current.focus();
        resetGame();
    }, [mode]);

    const generateContent = () => {
        if (mode === "word") {
            const word = generate({ exactly: 1, minLength: 5 })[0];
            return word;
        } else if (mode === "paragraph") {
            return generate({ exactly: 20, join: " " });
        }
    };

    // Handle user input
    const handleChange = (e) => {
        const typedChar = e.target.value.slice(-1);
        const currentChar = charRefs.current[charIndex]?.textContent;

        if (charIndex < content.length && lives > 0 && (!gameOver || !gameConquer)) {
            if (typedChar === currentChar) {
                correctWrong[charIndex] = "correct";
            } else {
                correctWrong[charIndex] = "wrong";
                setMistakes((prevMistakes) => prevMistakes + 1);
            }
            setCharIndex((prevIndex) => prevIndex + 1);

            if (charIndex === content.length - 1) {
                handleGameEnd();
            }
        }
    };

    // Update accuracy as characters are typed
    useEffect(() => {
        if (charIndex > 0) {
            const correctChars = charIndex - mistakes;
            const acc = Math.round((correctChars / charIndex) * 100);
            setAccuracy(acc);
        }
    }, [charIndex, mistakes]);

    // Handle game end conditions
    const handleGameEnd = () => {

        if (lives - 1 === 0) {
            setGameOver(true);
        }
        if (level === 100) {
            setGameConquer(true);
        }

        setContent(generateContent());
        setCorrectWrong([]);
        setCharIndex(0);
        setMistakes(0);

        if (accuracy >= 80 && level < 100) {
            setLevel((prevLevel) => prevLevel + 1);
        } else {
            setLostLifeIndex(lives - 1); // Track animation for lost life
            setTimeout(() => setLostLifeIndex(null), 300); // Reset animation index
            setLives((prevLives) => prevLives - 1);
        }
    };

    // Reset game
    const resetGame = () => {
        setLives(3);
        setLevel(1);
        setContent(generateContent());
        setCharIndex(0);
        setMistakes(0);
        setCorrectWrong([]);
        setAccuracy(0);
        setGameOver(false);
        setGameConquer(false);
        inputRef.current.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
            e.preventDefault(); // Prevent backspace from doing anything
            toast.info(`${e.key} is disabled during typing!`, {
                position: "bottom-center",
            });
        }
    };

    //save game record
    //async (function need to take sometimes to run)but it will not blocking the main program execution
    const saveGameRecord = async () => {
        if (!userLoggedIn) return; // Do nothing if the user is not login

        const record = {
            userId: currentUser.uid,
            timestamp: serverTimestamp(),
            level: level
        };

        try {
            await addDoc(collection(db, "TypingGame"), record);
            console.log("Typing game record saved successfully.");
        } catch (error) {
            console.error("Error saving typing game record:", error);
        }
    };

    useEffect(() => {
        if (gameOver || gameConquer) {
            if (userLoggedIn) {
                saveGameRecord(); // Save the record only if the user is logged in
            }
        }
    }, [gameOver, gameConquer]);

    return (
        <div className='max-w-[1240px] w-full h-screen mx-auto text-center flex-col justify-center my-10 md:px-10' onKeyDown={handleKeyDown} tabIndex={0}>
            <h1 className='text-4xl font-extrabold text-center mb-6 text-gray-800'>Typing Game</h1>
            <div className='place-self-center max-w-screen-lg mx-5 ml-5 mr-5 p-6 rounded-lg border border-gray-300 bg-white shadow-md'>
                <div className='font-semibold text-2xl flex justify-between items-center mb-5 pb-5 border-b-2 border-gray-600'>
                    <p className="mx-auto px-4">
                        Mode:{" "}
                        <span
                            onClick={() => setMode("word")}
                            className={`cursor-pointer px-2 py-1 rounded-md ${mode === "word" ? "bg-[#476730] text-white" : "hover:text-[#476730]"}`}
                        >
                            Word
                        </span>
                        /
                        <span
                            onClick={() => setMode("paragraph")}
                            className={`cursor-pointer px-2 py-1 rounded-md ${mode === "paragraph" ? "bg-[#476730] text-white" : "hover:text-[#476730]"}`}
                        >
                            Paragraph
                        </span>
                    </p>
                    <p className="mx-auto px-4">
                        Lives:{" "}
                        {[...Array(3)].map((_, index) => (
                            <span
                                key={index}
                                className={`text-red-500 px-1 align-middle
                                        ${index >= lives
                                        ? "opacity-0"
                                        : lostLifeIndex === index
                                            ? "animate-pulse"
                                            : ""
                                    }`}
                            >
                                ❤️
                            </span>
                        ))}
                    </p>
                    <p className="mx-auto px-4">Level: <span className='text-[#476730]'>{level}</span></p>
                    <p className="mx-auto px-4">Accuracy: <span className={`${accuracy >= 80 ? "text-green-600" : "text-red-600"}`}>{accuracy}%</span></p>
                </div>

                <div className="text-justify" onClick={() => inputRef.current && inputRef.current.focus()}>
                    <input
                        type="text"
                        ref={inputRef}
                        onChange={handleChange}
                        className="opacity-0 absolute -z-999 cursor-default"
                    />
                    {content.split("").map((char, index) => (
                        <span
                            key={index}
                            className={`text-2xl select-none
                                ${index === charIndex ? 'border-b-4 border-blue-500' : ''} 
                                ${correctWrong[index] === 'correct' ? 'bg-green-500' : ''} 
                                ${correctWrong[index] === 'wrong' ? 'bg-red-500' : ''}`}
                            ref={(e) => (charRefs.current[index] = e)}
                        >
                            {char}
                        </span>
                    ))}
                </div>
            </div>
            {gameOver && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
                        <h2 className="text-2xl font-extrabold mb-4">Game Over</h2>
                        <p className="mb-2">
                            <strong>Level reached:</strong> {level}
                        </p>
                        <button
                            className="font-semibold bg-[#476730] w-[150px] rounded-md mx-auto py-2 text-white items-center justify-center hover:bg-gray-700"
                            onClick={resetGame}
                        >
                            Start New Game
                        </button>
                    </div>
                </div>
            )}
            {gameConquer && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
                        <h2 className="text-2xl font-extrabold mb-4">You Has been Conquer the Game, Congratulations!</h2>
                        <p className="mb-2">
                            <strong>Level reached:</strong> {level}
                        </p>
                        <button
                            className="font-semibold bg-[#476730] w-[150px] rounded-md mx-auto py-2 text-white items-center justify-center hover:bg-gray-700"
                            onClick={resetGame}
                        >
                            Start New Game
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default TypingGame;
