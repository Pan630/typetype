import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from "../contexts/authProvider";
import { addDoc, doc, getDoc, collection, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import { faker } from '@faker-js/faker';
import { toast } from "react-toastify";
import Keyboard from '../component/Keyboard';

const TypingTest = () => {
    const { currentUser, userLoggedIn } = useAuth();
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser && userLoggedIn) {
                const docRef = doc(db, "Users", currentUser.uid);
                const docInfo = await getDoc(docRef);
                if (docInfo.exists()) {
                    setUserDetails(docInfo.data());

                } else {
                    console.log("user is not logged in");
                }
            } else {
                console.log("No user is logged in.");
            }
        };
        fetchUserData();
    }, [currentUser]);

    const maxTime = 60;
    const [timeLeft, setTimeLeft] = useState(maxTime);
    const [startTime, setStartTime] = useState(null);
    const [timeTaken, setTimeTaken] = useState(0);
    const [mistakes, setMistakes] = useState(0); //count mistakes
    const [errorLetters, setErrorLetters] = useState({}); // collect mistake letters
    const [charIndex, setCharIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [WPM, setWPM] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [paragraph, setParagraph] = useState("");
    const inputRef = useRef(null);
    const charRefs = useRef([]);
    const [correctWrong, setCorrectWrong] = useState([]);
    const [totalLetters, setTotalLetters] = useState(0);
    const [currentTypeKey, setCurrentTypeKey] = useState("");

    const generateParagraph = (wordCount) => {
        const generatedParagraph = Array.from({ length: wordCount }, () => faker.word.sample()).join(" ");
        setTotalLetters(generatedParagraph.length);
        console.log('Total Letters: ', generatedParagraph.length);
        return generatedParagraph;
    };

    useEffect(() => {
        setParagraph(generateParagraph(50));
        inputRef.current.focus();
    }, []);

    useEffect(() => {
        setCorrectWrong([]);
    }, [paragraph]);

    useEffect(() => {
        let interval;

        if (isTyping && timeLeft > 0) {
            interval = setInterval(() => {
                const timeTakes = Math.floor((Date.now() - startTime) / 1000);
                const updatedTimeLeft = maxTime - timeTakes;

                setTimeLeft(updatedTimeLeft);

                let correctChars = charIndex - mistakes;

                // Calculate WPM
                let wpm = Math.round((charIndex / 5) / (timeTakes / 60)) || 0;
                // Ensure WPM is non-negative
                setWPM(wpm);

                // Calculate accuracy
                let acc = charIndex === 0 ? 0 : Math.round((correctChars / charIndex) * 100) || 0;
                setAccuracy(acc);

                setTimeTaken(timeTakes);

                // Stop timer if timeLeft reaches 0
                if (updatedTimeLeft <= 0) {
                    clearInterval(interval);
                    setIsTyping(false);
                }
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
            setIsTyping(false);
        }

        return () => {
            clearInterval(interval);
        };
    }, [isTyping, timeLeft, startTime]);

    const resetTest = () => {
        setIsTyping(false);
        setCharIndex(0);
        setTimeLeft(maxTime);
        setMistakes(0);
        setWPM(0);
        setAccuracy(0);
        setParagraph(generateParagraph(50));
        setErrorLetters({});
        setCurrentTypeKey("");
        setCorrectWrong([]);
        inputRef.current.focus();
    };

    const handleChange = (e) => {
        const typedChar = e.target.value.slice(-1);
        setCurrentTypeKey(typedChar);

        if (charIndex < paragraph.length && timeLeft > 0) {
            if (!isTyping) {
                setIsTyping(true);
                setStartTime(Date.now());
            }

            if (typedChar !== paragraph[charIndex]) {
                correctWrong[charIndex] = "wrong";
                setMistakes(mistakes + 1);
                if (paragraph[charIndex] !== ' ') {
                    setErrorLetters(prev => ({ //prev to secure always get the latest value
                        ...prev, // keep the all the data here
                        [paragraph[charIndex]]: (prev[paragraph[charIndex]] || 0) + 1
                    }));
                }
            } else {
                correctWrong[charIndex] = "correct";
            }
            setCharIndex(charIndex + 1);

            if (charIndex === paragraph.length && charIndex > 0) {
                setIsTyping(false);
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

    //save test record
    //async (function need to take sometimes to run)but it will not blocking the main program execution
    const saveTestRecord = async () => {
        if (!userLoggedIn) return; // Do nothing if the user is not login

        const record = {
            userId: currentUser.uid,
            testTime: serverTimestamp(),
            wpm: WPM,
            accuracy: accuracy,
            timeTaken: timeTaken,
            totalLettersTyped: charIndex,
            correctLetters: charIndex - mistakes,
            incorrectLetters: mistakes,
            errorLetters
        };

        try {
            await addDoc(collection(db, "TestResults"), record);
            console.log("Typing test record saved successfully.");
        } catch (error) {
            console.error("Error saving typing test record:", error);
        }
    };

    const clearPracticeRecords = async (userId) => {
        const practiceRef = doc(db, "PracticeRecords", userId);

        try {
            // Delete the PracticeRecords document
            await setDoc(practiceRef, {}, { merge: false }); // This overwrites the document with an empty object
            console.log("PracticeRecords cleared successfully.");
        } catch (error) {
            console.error("Error clearing PracticeRecords:", error);
        }
    };

    useEffect(() => {
        if (timeLeft === 0 || (charIndex === totalLetters && charIndex > 0)) {
            setIsTyping(false);
            if (userLoggedIn) {
                saveTestRecord(); // Save the record only if the user is logged in
                clearPracticeRecords(currentUser.uid);
            }
        }
    }, [timeLeft, charIndex]);

    return (
        <div className='max-w-[1240px] w-full h-screen mx-auto text-center flex-col justify-center my-10 px-10' onKeyDown={handleKeyDown} tabIndex={0}>
            <h1 className='text-4xl font-extrabold text-center mb-6 text-gray-800 '>Typing Test</h1>
            <div className='place-self-center max-w-screen-lg mx-5 ml-5 mr-5 p-6 rounded-lg border border-gray-300 bg-white shadow-md'>
                <div className='font-semibold text-2xl flex justify-between items-center mb-5 pb-5 border-b-2 border-gray-600'>
                    {/* total word select 
                        <p className=' mx-auto px-4 text-black'>Select Word Count:
                            <select
                                id="wordCount"
                                className='p-2 border border-gray-300 rounded-md'
                                onChange={(e) => {
                                    setParagraph(generateParagraph(Number(e.target.value)));
                                    resetTest(); // Reset test when word count changes
                                }}
                            >
                                <option value="50">50 Words</option>
                                <option value="100">100 Words</option>
                                <option value="200">200 Words</option>
                            </select>
                        </p> 
                        
                        */}
                    <p className=' mx-auto px-4 text-black'>Time Left: <strong className='px-1'>{timeLeft}s</strong></p>
                    <p className=' mx-auto px-4 text-black'>Mistakes: <strong className='px-1'>{mistakes}</strong></p>
                    <p className=' mx-auto px-4 text-black'>WPM: <strong className='px-1'>{WPM}</strong></p>
                    <p className=' mx-auto px-4 text-black'>Accuracy: <strong className='px-1'>{accuracy}%</strong></p>
                    <button className='bg-[#476730] font-semibold w-[150px] rounded-md mx-auto py-2 text-xl text-white items-center justify-between hover:bg-gray-700 transition-all ' onClick={resetTest}>Try Again</button>
                </div>

                <div className='text-justify text-3xl' onClick={() => inputRef.current.focus()}>
                    <input
                        type="text"
                        className='opacity-0 absolute -z-999 cursor-default'
                        ref={inputRef}
                        onChange={handleChange} />
                    {
                        paragraph.split("").map((char, index) => (
                            <span
                                key={index}
                                className={`text-2xl select-none px-0.5 
                                    ${index === charIndex ? 'border-b-4 border-blue-500' : ''} 
                                    ${correctWrong[index] === 'correct' ? 'bg-green-500' :
                                        correctWrong[index] === 'wrong' ? 'bg-red-500' :
                                            'bg-gray-200'}`}
                                ref={(e) => (charRefs.current[index] = e)}>
                                {char}
                            </span>
                        ))
                    }
                </div>

                {(timeLeft === 0 || (charIndex === totalLetters && charIndex > 0)) && (
                    <div className='fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in'>
                        <div className='bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md'>
                            <h2 className='text-2xl font-extrabold mb-4'>Typing Test Summary</h2>
                            <p className='mb-2'><strong>WPM:</strong> {WPM}</p>
                            <p className='mb-2'><strong>Accuracy:</strong> {accuracy}%</p>
                            <p className='mb-2'><strong>Time Taken:</strong> {timeTaken}s</p>
                            <p className='mb-2'><strong>Total Letters Typed:</strong> {charIndex}</p>
                            <p className='mb-2'><strong>Correct Letters:</strong> {charIndex - mistakes}</p>
                            <p className='mb-2'><strong>Mistake Letters:</strong> {mistakes}</p>
                            {Object.keys(errorLetters).length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-bold">Error Characters:</h3>
                                    <div className="font-semibold grid grid-cols-4 gap-2 mt-2">
                                        {Object.entries(errorLetters).map(([char, count]) => (
                                            <div key={char} className="flex justify-between p-2 bg-gray-100 rounded">
                                                <span>{char}</span>
                                                <span>({count}) error</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button
                                className='font-semibold bg-[#476730] w-[150px] rounded-md mt-4 mx-auto py-2 text-xl text-white items-center justify-between hover:bg-gray-700 transition-all'
                                onClick={resetTest}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Keyboard currentKey={currentTypeKey} />
        </div >
    );
};

export default TypingTest;
