import React, { useEffect, useState, useRef } from "react";
import LineChart from "../component/LineChart";
import { db } from "../firebase/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/authProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LearningProgress = () => {
    const navigate = useNavigate();
    const { currentUser, userLoggedIn } = useAuth();
    const hasNavigated = useRef(false);
    const [progressData, setProgressData] = useState([]);
    const [lessonData, setLessonData] = useState([]);
    const [timeRange, setTimeRange] = useState({ start: new Date(), end: new Date() });
    const [displayWpm, setDisplayWpm] = useState(true);
    const [displayAccuracy, setDisplayAccuracy] = useState(true);
    const [view, setView] = useState("test"); // 'test' or 'lesson'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgressData = async () => {
            if (!currentUser) return;

            try {
                const userId = currentUser.uid;

                // Fetch test progress data
                const testResultsRef = collection(db, "TestResults");
                const testQuery = query(testResultsRef, where("userId", "==", userId), orderBy("testTime"));
                const testSnapshot = await getDocs(testQuery);

                const testData = testSnapshot.docs.map((doc) => {
                    const data = doc.data();
                    const testTime = new Date(data.testTime.seconds * 1000);

                    const formattedDate = `${String(testTime.getDate()).padStart(2, "0")}/${String(testTime.getMonth() + 1).padStart(2, "0")}/${testTime.getFullYear()}`;

                    return {
                        date: formattedDate,
                        dateObj: testTime,
                        wpm: data.wpm,
                        accuracy: data.accuracy,
                    };
                });

                setProgressData(testData);

                const lessonProgressRef = collection(db, "LessonProgress");
                const userDoc = await getDocs(query(lessonProgressRef, where("__name__", "==", userId)));

                const docData = userDoc.docs[0].data();

                // Process lesson data
                const lessonData = Object.entries(docData)
                    .filter(([key, lesson]) =>
                        key.startsWith("lesson") &&
                        lesson.status === "Complete" && // Only need complete lessons data
                        lesson.dateCompleted
                    )
                    .map(([lessonKey, lesson]) => {
                        const lessonDate = new Date(lesson.dateCompleted.seconds * 1000);

                        const formattedDate = `${String(lessonDate.getDate()).padStart(2, "0")}/${String(lessonDate.getMonth() + 1).padStart(2, "0")}/${lessonDate.getFullYear()}`;

                        return {
                            date: formattedDate,
                            dateObj: lessonDate,
                            wpm: lesson.wpm || 0,
                            accuracy: lesson.accuracy || 0,
                            lesson: lessonKey,
                        };
                    })
                    .sort((a, b) => a.dateObj - b.dateObj);

                setLessonData(lessonData);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!userLoggedIn) {
            if (!hasNavigated.current) {
                hasNavigated.current = true;
                navigate("/Login");
                setTimeout(() => {
                    toast.info("You have to login to continue.", {
                        position: "bottom-center",
                    });
                }, 1000);
            }
        }

        fetchProgressData();
    }, [currentUser]);

    const setPresetTimeRange = (range) => {
        const now = new Date();
        let start;

        switch (range) {
            case "today":
                start = new Date(now.setHours(0, 0, 0, 0));
                break;
            case "week":
                start = new Date(now.setDate(now.getDate() - 7));
                break;
            case "month":
                start = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case "all":
                start = new Date(0); // all data
                break;
            default:
                start = new Date();
        }

        setTimeRange({ start, end: new Date() });
    };

    useEffect(() => {
        setPresetTimeRange("today");
    }, []);

    if (loading) {
        return <div className="text-lg font-semibold text-center mt-10">Loading...</div>;
    }

    return (
        <div className="max-w-[1240px] w-full mx-auto text-center my-10 px-10">
            <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">Learning Progress</h1>

            <div className="flex justify-center mb-6">
                <button
                    className={`font-semibold px-4 py-2 mx-2 rounded-md ${view === "test" ? "bg-[#476730] text-white" : "bg-gray-300 text-gray-800"}`}
                    onClick={() => setView("test")}
                >
                    Test Progress
                </button>
                <button
                    className={`font-semibold px-4 py-2 mx-2 rounded-md ${view === "lesson" ? "bg-[#476730] text-white" : "bg-gray-300 text-gray-800"}`}
                    onClick={() => setView("lesson")}
                >
                    Lesson Progress
                </button>
            </div>

            <div className="flex justify-center mb-6 space-x-4">
                {["today", "week", "month", "all"].map((filter) => (
                    <button
                        key={filter}
                        className={`font-semibold px-4 py-2 rounded-md transition-all duration-300 ease-in-out ${timeRange.start.toDateString() ===
                            new Date(new Date().setDate(new Date().getDate() - (filter === "week" ? 7 : 0))).toDateString() &&
                            filter === "today"
                            ? "bg-[#476730] text-white shadow-md"
                            : filter === "all" && timeRange.start.getTime() === 0
                                ? "bg-[#476730] text-white shadow-md"
                                : "bg-gray-300 text-gray-800 hover:bg-[#476730] hover:text-white"
                            }`}
                        onClick={() => setPresetTimeRange(filter)}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            <div className="flex justify-center mb-6 space-x-4">
                <label>
                    <input
                        type="checkbox"
                        checked={displayWpm}
                        onChange={() => setDisplayWpm(!displayWpm)}
                    />
                    {" "}WPM
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={displayAccuracy}
                        onChange={() => setDisplayAccuracy(!displayAccuracy)}
                    />
                    {" "}Accuracy
                </label>
            </div>

            {view === "test" && progressData.length > 0 && (
                <div className="mb-8">
                    <LineChart
                        data={progressData}
                        timeRange={timeRange}
                        displayWpm={displayWpm}
                        displayAccuracy={displayAccuracy}
                    />
                </div>
            )}

            {view === "lesson" && lessonData.length > 0 && (
                <div className="mb-8">
                    <LineChart
                        data={lessonData}
                        timeRange={timeRange}
                        displayWpm={displayWpm}
                        displayAccuracy={displayAccuracy}
                    />
                </div>
            )}

            {((view === "test" && progressData.length === 0) || (view === "lesson" && lessonData.length === 0)) && (
                <p className="text-center text-gray-600">
                    No {view} progress data available. Take some tests or complete lessons to get started!
                </p>
            )}
        </div>
    );
};

export default LearningProgress;
