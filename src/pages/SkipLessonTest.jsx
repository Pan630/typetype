import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from "../contexts/authProvider";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from '../firebase/firebase';
import { generate } from 'random-words';
import { toast } from "react-toastify";
import { IoMdArrowRoundBack } from "react-icons/io";
import Keyboard from '../component/Keyboard';
import { Link, useNavigate } from 'react-router-dom';

const SkipLessonTest = () => {
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

    const navigate = useNavigate();
    const maxTime = 60;
    const [timeLeft, setTimeLeft] = useState(maxTime);
    const [startTime, setStartTime] = useState(null);
    const [timeTaken, setTimeTaken] = useState(0);
    const [mistakes, setMistakes] = useState(0); //count mistakes
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
        const generatedParagraph = generate(wordCount).join(" ");
        setTotalLetters(generatedParagraph.length);
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

    const saveSkipRecord = async () => {
        if (!currentUser) return;

        try {
            const userDocRef = doc(db, "Users", currentUser.uid);
            const lessonProgressRef = doc(db, "LessonProgress", currentUser.uid);

            let updatedLevel = userDetails.level;
            let lessonUpdates = {};
            let updatedAt = serverTimestamp();

            if (accuracy >= 95 && WPM >= 60) {
                updatedLevel = "Advanced";
                lessonUpdates = {
                    lesson1: { status: "Skipped", updatedAt },
                    lesson2: { status: "Skipped", updatedAt },
                    lesson3: { status: "Skipped", updatedAt },
                    lesson4: { status: "Skipped", updatedAt },
                    lesson5: { status: "Skipped", updatedAt },
                    lesson6: { status: "Skipped", updatedAt },
                    lesson7: { status: "Skipped", updatedAt },
                    lesson8: { status: "Skipped", updatedAt },
                    lesson9: { status: "Skipped", updatedAt },
                    lesson10: { status: "In Progress", updatedAt }
                };
            } else if (accuracy >= 90 && WPM >= 40) {
                updatedLevel = "Intermediate";
                lessonUpdates = {
                    lesson1: { status: "Skipped", updatedAt },
                    lesson2: { status: "Skipped", updatedAt },
                    lesson3: { status: "Skipped", updatedAt },
                    lesson4: { status: "Skipped", updatedAt },
                    lesson5: { status: "Skipped", updatedAt },
                    lesson6: { status: "Skipped", updatedAt },
                    lesson7: { status: "In Progress", updatedAt }
                };
            }

            await setDoc(
                userDocRef,
                {
                    level: updatedLevel,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );

            await setDoc(
                lessonProgressRef,
                {
                    ...lessonUpdates,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );
            toast.success("Skip lesson successfully!", {
                position: "bottom-center",
            });
        } catch (error) {
            console.error("Error saving test record:", error);
        }
    };


    useEffect(() => {
        if (timeLeft === 0 || (charIndex === totalLetters && charIndex > 0)) {
            setIsTyping(false);
            if (userLoggedIn) {
                saveSkipRecord(); // Save the record only if the user is logged in

            }
        }
    }, [timeLeft, charIndex]);

    return (
        <div className='max-w-[1240px] w-full mx-auto text-center flex-col justify-center my-10 px-10' onKeyDown={handleKeyDown} tabIndex={0}>
            <h1 className='text-4xl font-extrabold text-center mb-6 text-gray-800 '>Typing Test</h1>
            <div className='place-self-center max-w-screen-lg mx-5 ml-5 mr-5 p-6 rounded-lg border border-gray-300 bg-white shadow-md'>
                <div className='font-semibold text-2xl flex justify-between items-center mb-5 pb-5 border-b-2 border-gray-600'>
                    <button
                        className="flex items-center justify-center bg-[#476730] w-[50px] h-[50px] rounded-full text-white hover:bg-gray-700 transition-all"
                        onClick={() => navigate("/TypingLesson")}
                    >
                        <IoMdArrowRoundBack className="text-2xl" />
                    </button>
                    <p className=' mx-auto px-4 text-black'>Time Left: <strong className='px-1'>{timeLeft}s</strong></p>
                    <p className=' mx-auto px-4 text-black'>WPM: <strong className='px-1'>{WPM}</strong></p>
                    <p className=' mx-auto px-4 text-black'>Accuracy: <strong className='px-1'>{accuracy}%</strong></p>
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
                            <h2 className='text-2xl font-extrabold mb-4'>Skip Lesson Test Summary</h2>
                            <p className='mb-2'><strong>WPM:</strong> {WPM}</p>
                            <p className='mb-2'><strong>Accuracy:</strong> {accuracy}%</p>
                            <p className='mb-2'><strong>Time Taken:</strong> {timeTaken}s</p>
                            <Link
                                to={'/TypingLesson'}
                                className='font-semibold bg-[#476730] w-[150px] rounded-md mt-4 mx-auto py-2 px-4 text-xl text-white items-center justify-between hover:bg-gray-700 transition-all'
                            >
                                Back to Lesson
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            <Keyboard currentKey={currentTypeKey} />
        </div >
    );
};

export default SkipLessonTest;
