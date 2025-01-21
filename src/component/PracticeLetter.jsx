import React, { useEffect, useState, useRef, useCallback } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/authProvider";
import { generate } from "random-words";
import { toast } from "react-toastify";
import { IoMdArrowRoundBack } from "react-icons/io";
import Keyboard from "./Keyboard";

const PracticeLetter = ({ letter, onComplete, onBack }) => {
    const { currentUser } = useAuth();
    const [practiceParagraph, setPracticeParagraph] = useState("");
    const [accuracy, setAccuracy] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [totalTyped, setTotalTyped] = useState(0);
    const inputRef = useRef(null);
    const charRefs = useRef([]);
    const [correctWrong, setCorrectWrong] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPracticeEnd, setIsPracticeEnd] = useState(false);

    const generateWordsWithLetter = useCallback((letter, count = 20) => {
        const words = [];
        while (words.length < count) {
            const word = generate();
            if (word.includes(letter)) {
                words.push(word);
            }
        }
        return words.join(" ");
    }, []);

    useEffect(() => {
        setPracticeParagraph(generateWordsWithLetter(letter));
        inputRef.current.focus();
    }, [letter, generateWordsWithLetter]);

    const handleTyping = (e) => {
        const typedChar = e.target.value.slice(-1);

        if (totalTyped < practiceParagraph.length) {
            if (!isTyping) {
                setIsTyping(true);
            }

            if (typedChar !== practiceParagraph[totalTyped]) {
                setMistakes((prev) => prev + 1);
            }

            setTotalTyped((prev) => prev + 1);
            setCorrectWrong((prev) => {
                const updated = [...prev];
                updated[totalTyped] = typedChar === practiceParagraph[totalTyped] ? "correct" : "wrong";
                return updated;
            });

            const currentAccuracy = Math.round(((totalTyped + 1 - mistakes) / (totalTyped + 1)) * 100);
            setAccuracy(currentAccuracy);

            if (totalTyped + 1 === practiceParagraph.length) {
                setIsPracticeEnd(true);
                setIsTyping(false);
                if (currentAccuracy >= 95) {
                    markLetterAsPassed(letter, currentAccuracy);
                }
            }
        } else {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
            e.preventDefault(); // Prevent backspace from doing anything
            toast.info(`${e.key} is disabled during typing!`, {
                position: "bottom-center",
            });
        }
    };

    const markLetterAsPassed = async (letter, accuracy) => {
        try {
            const recordRef = doc(db, "PracticeRecords", currentUser.uid);
            await setDoc(recordRef, {
                practicedLetters: {
                    [letter]: { passed: true, accuracy },
                },
            }, { merge: true });
            // onComplete(letter);
        } catch (error) {
            console.error("Error saving practice record:", error);
        }
    };

    const resetPractice = () => {
        setPracticeParagraph(generateWordsWithLetter(letter));
        setCorrectWrong([]);
        setAccuracy(0);
        setMistakes(0);
        setTotalTyped(0);
        setIsPracticeEnd(false);
        inputRef.current.focus();
    };

    return (
        <div className='max-w-[1240px] w-full mx-auto text-center flex-col justify-center md:px-10' onKeyDown={handleKeyDown} tabIndex={0}>
            <h2 className="text-4xl font-extrabold m-6">Practice letter of [{letter}]</h2>
            <div className='place-self-center max-w-screen-lg mx-5 ml-5 mr-5 p-6 rounded-lg border border-gray-300 bg-white shadow-md'>
                <div className="font-semibold text-2xl flex justify-between items-center mb-5 pb-5 border-b-2 border-gray-600">
                    <button
                        className="flex items-center justify-center bg-[#476730] w-[50px] h-[50px] rounded-full text-white hover:bg-gray-700 transition-all"
                        onClick={onBack}
                    >
                        <IoMdArrowRoundBack className="text-2xl" />
                    </button>
                    <p className="mx-auto px-4">Accuracy: <span className={`${accuracy >= 95 ? "text-green-600" : "text-red-600"}`}>{accuracy}%</span></p>
                    <button
                        className="bg-[#476730] px-4 py-2 rounded-md text-white text-xl hover:bg-gray-700 transition-all"
                        onClick={resetPractice}
                    >
                        Try Again
                    </button>
                </div>
                <div className='text-justify text-3xl' onClick={() => inputRef.current.focus()}>
                    <input
                        type="text"
                        ref={inputRef}
                        onChange={handleTyping}
                        className="opacity-0 absolute -z-999 cursor-default"
                    />
                    <p>{practiceParagraph.split("").map((char, index) => (
                        <span
                            key={index}
                            className={`text-2xl px-0.5 select-none
                                ${index === totalTyped ? 'border-b-4 border-blue-500' : ''}  
                                ${correctWrong[index] === "correct" ? "bg-green-500" :
                                    correctWrong[index] === "wrong" ? "bg-red-500" :
                                        "bg-gray-200"}`}
                            ref={(e) => (charRefs.current[index] = e)}>
                            {char}
                        </span>
                    ))}
                    </p>
                </div>
            </div>
            {isPracticeEnd && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
                        <h2 className="text-2xl font-extrabold mb-4">Practice Summary</h2>
                        <p className="mb-2"><strong>Accuracy:</strong> {accuracy}%</p>
                        <p className="mb-2"><strong>Total Letters Typed:</strong> {totalTyped}</p>
                        <p className="mb-2"><strong>Correct Letters:</strong> {totalTyped - mistakes}</p>
                        <p className="mb-2"><strong>Mistakes:</strong> {mistakes}</p>
                        {accuracy >= 95 ? (
                            <button
                                onClick={() => onComplete(letter)}
                                className="font-semibold px-4 py-2 mx-auto transition duration-300 ease-in-out bg-[#476730] hover:bg-[#3e5825] w-auto text-xl text-white rounded-md"
                            >
                                Continue Practice
                            </button>
                        ) : (
                            <div className="mt-4 flex justify-between items-center">
                                <button
                                    onClick={onBack}
                                    className="font-semibold px-4 py-2 mx-auto transition duration-300 ease-in-out bg-[#476730] hover:bg-[#3e5825] w-auto text-xl text-white rounded-md"
                                >
                                    Back to Typing Practice
                                </button>
                                <button
                                    className="font-semibold px-4 py-2 mx-auto transition duration-300 ease-in-out bg-[#AFCFA3] hover:bg-[#D1DEA9] w-[150px] text-xl text-black rounded-md"
                                    onClick={resetPractice}
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Keyboard currentKey={practiceParagraph[totalTyped]} />
        </div >
    );
};

export default PracticeLetter;
