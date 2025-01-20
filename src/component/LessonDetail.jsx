import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/authProvider";
import { fetchLessons, updateLessonProgress } from "../contexts/lessonService";
import { Link, useNavigate } from "react-router-dom";
import Keyboard from "./Keyboard";

const LessonDetail = () => {
    const { lessonId } = useParams();
    const nextLessonId = parseInt(lessonId) + 1;
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [paragraph, setParagraph] = useState(null);
    const [charIndex, setCharIndex] = useState(0); // locate the place to type
    const [mistakes, setMistakes] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [timeTaken, setTimeTaken] = useState(0);
    const [WPM, setWPM] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [correctWrong, setCorrectWrong] = useState([]);
    const [isLessonComplete, setIsLessonComplete] = useState(false);
    const [totalLetters, setTotalLetters] = useState(0);
    const inputRef = useRef(null);
    const charRefs = useRef([]);
    const [currentTypeKey, setCurrentTypeKey] = useState("");
    const [lessonLevel, setLessonLevel] = useState("");

    useEffect(() => {
        async function fetchData() {
            const lessons = await fetchLessons();
            const selectedLesson = lessons.find((lesson) => lesson.id === lessonId);
            setParagraph(selectedLesson.content);
            setTotalLetters(selectedLesson.content.length);
            setLessonLevel(selectedLesson.level);
            // setLoading(false);
        }
        fetchData();
        inputRef.current.focus();
    }, [lessonId]);

    useEffect(() => {
        setCorrectWrong([]);
    }, [paragraph]);

    const handleChange = (e) => {
        const characters = charRefs.current;
        let currentChar = charRefs.current[charIndex];
        let typedChar = e.target.value.slice(-1);
        setCurrentTypeKey(typedChar);

        if (!isTyping) {
            setIsTyping(true);
            setStartTime(Date.now());
        }

        if (charIndex < characters.length) {
            if (typedChar === currentChar.textContent) {
                setCharIndex(charIndex + 1);
                correctWrong[charIndex] = "correct";
            } else {
                setCharIndex(charIndex + 1);
                setMistakes(mistakes + 1);
                correctWrong[charIndex] = "wrong";
            }
            if (charIndex === characters.length - 1) {
                endLesson();
            }
        }
    };

    const endLesson = () => {
        setIsTyping(false);
        const { totalTime, wpm, accuracy } = calculateMetrics(charIndex, mistakes, startTime);
        setTimeTaken(totalTime);
        setWPM(wpm);
        setAccuracy(accuracy);
        setIsLessonComplete(true);
        updateLessonProgress(currentUser.uid, lessonId, accuracy, wpm, totalTime, nextLessonId)
    };

    const calculateMetrics = (charsTyped, mistakes, startTime) => {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        const correctChars = charsTyped - mistakes;
        const wpm = Math.max(Math.round((charsTyped / 5) / (totalTime / 60)), 0);
        const accuracy = charsTyped === 0 ? 0 : Math.round((correctChars / charsTyped) * 100);
        return { totalTime, wpm, accuracy };
    };

    const handleRedo = () => {
        setCharIndex(0);
        setMistakes(0);
        setTimeTaken(0);
        setWPM(0);
        setAccuracy(0);
        setIsLessonComplete(false);
        setCorrectWrong([]);
        inputRef.current.focus();
    };
    const handleNext = () => {
        navigate(`/lesson/${nextLessonId}`);
        setCharIndex(0);
        setMistakes(0);
        setTimeTaken(0);
        setWPM(0);
        setAccuracy(0);
        setIsLessonComplete(false);
        setCorrectWrong([]);
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
    return (
        <div className='max-w-[1240px] w-full h-screen mx-auto text-center flex-col justify-center my-10 px-10' onKeyDown={handleKeyDown} tabIndex={0}>
            <h1 className='text-4xl font-extrabold text-center mb-6 text-gray-800'>Typing Lesson {lessonId}</h1>
            <div className='place-self-center max-w-screen-lg mx-5 ml-5 mr-5 p-6 rounded-lg border border-gray-300 bg-white shadow-md space-y-4'>
                <div className="text-justify" onClick={() => inputRef.current.focus()}>
                    <input
                        type="text"
                        className="opacity-0 absolute -z-999 cursor-default"
                        ref={inputRef}
                        onChange={handleChange}
                    />
                    {paragraph ? (
                        paragraph.split("").map((char, index) => (
                            <span
                                key={index}
                                className={`text-2xl px-1 select-none 
                            ${index === charIndex ? "border-b-4 border-blue-500" : "text-gray-800"} 
                            ${correctWrong[index] === "correct" ? "bg-green-500" : ""} 
                            ${correctWrong[index] === "wrong" ? "bg-red-500" : ""}`}

                                ref={(e) => (charRefs.current[index] = e)}
                            >
                                {char}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-500">Loading lesson content...</p>
                    )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(charIndex / totalLetters) * 100}%` }}
                    ></div>
                </div>

                {isLessonComplete && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Lesson Summary</h2>
                            <p className='mb-2'><strong>Time Taken:</strong> {timeTaken}s</p>
                            <p className='mb-2'><strong>WPM:</strong> {WPM}</p>
                            <p className='mb-2'><strong>Accuracy:</strong> {accuracy}%</p>
                            <p className='mb-2'><strong>Mistake Letters:</strong> {mistakes}</p>
                            <div className="mt-4 flex justify-between items-center">
                                <Link
                                    to={'/TypingLesson'}
                                    className="px-4 py-2 mx-auto transition duration-300 ease-in-out bg-[#476730] hover:bg-[#3e5825] w-auto text-xl text-white rounded-md"
                                >
                                    Back to Lesson
                                </Link>
                                {accuracy >= 80 ? (
                                    <button
                                        className="px-4 py-2 mx-auto transition duration-300 ease-in-out bg-[#476730] hover:bg-[#3e5825] w-[150px] text-xl text-white rounded-md"
                                        onClick={handleNext}
                                    >
                                        Continue
                                    </button>
                                ) : (
                                    <button
                                        className="px-4 py-2 mx-auto transition duration-300 ease-in-out bg-[#AFCFA3] hover:bg-[#D1DEA9] w-[150px] text-xl text-black rounded-md"
                                        onClick={handleRedo}
                                    >
                                        Retry
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Keyboard currentKey={currentTypeKey} />
        </div >
    );
};

export default LessonDetail;