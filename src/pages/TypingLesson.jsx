import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../contexts/authProvider";
import { fetchLessons, fetchLessonProgress } from "../contexts/lessonService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TypingLesson = () => {
    const { currentUser } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [userProgress, setUserProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const hasNavigated = useRef(false);

    useEffect(() => {
        async function fetchData() {
            if (!currentUser) {
                if (!hasNavigated.current) {
                    hasNavigated.current = true;
                    navigate('/Login');
                    toast.info("You have to login to continue.", {
                        position: "bottom-center",
                    });
                }
            };

            try {
                const [lessonsData, progressData] = await Promise.all([
                    fetchLessons(),
                    fetchLessonProgress(currentUser?.uid)
                ]);

                setLessons(lessonsData);
                setUserProgress(progressData || {}); // Default to an empty object
            } catch (error) {
                console.error("Error loading lessons or progress:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [currentUser]);

    // const getLessonStatus = (level, lesson, progress) => {
    //     const lessonId = lesson.id;

    //     if (!progress) {
    //         if (lessonId == 1) {
    //             return {
    //                 status: "In progress",
    //                 className: "cursor-pointer bg-blue-100 border-blue-500 hover:shadow-lg"
    //             };
    //         } else {
    //             return {
    //                 status: "Locked",
    //                 className: "bg-gray-100 border-gray-200 cursor-default"
    //             };
    //         }
    //     }

    //     const inProgressLesson = userProgress[`lesson${lessonId}`];

    //     // For those got lesson progress
    //     if (inProgressLesson?.status === "Complete") {
    //         return {
    //             status: "Complete",
    //             className: "cursor-pointer bg-green-100 border-green-500"
    //         };
    //     }
    //     if (lessonId === 1 || (inProgressLesson && inProgressLesson.status === "In Progress")) {
    //         return {
    //             status: "In progress",
    //             className: "cursor-pointer bg-blue-100 border-blue-500 hover:shadow-lg"
    //         };
    //     }
    //     return {
    //         status: "Locked",
    //         className: "bg-gray-100 border-gray-200 cursor-default"
    //     };
    // };

    const getLessonStatus = (level, lesson, progress) => {
        const lessonId = lesson.id;

        if (!progress) {
            if (lessonId === "1") {
                return {
                    status: "In progress",
                    className: "cursor-pointer bg-blue-100 border-blue-500 hover:shadow-lg"
                };
            } else {
                return {
                    status: "Locked",
                    className: "bg-gray-100 border-gray-200 cursor-default"
                };
            }
        }

        const lessonProgress = userProgress[`lesson${lessonId}`];

        if (lessonProgress?.status === "Complete") {
            return {
                status: "Complete",
                className: "cursor-pointer bg-green-100 border-green-500"
            };
        }

        if (lessonProgress?.status === "Skipped") {
            return {
                status: "Skipped",
                className: "cursor-pointer bg-yellow-100 border-yellow-500 hover:shadow-lg"
            };
        }

        if (lessonId === "1" || (lessonProgress && lessonProgress.status === "In Progress")) {
            return {
                status: "In progress",
                className: "cursor-pointer bg-blue-100 border-blue-500 hover:shadow-lg"
            };
        }

        return {
            status: "Locked",
            className: "bg-gray-100 border-gray-200 cursor-default"
        };
    };

    const handleLessonClick = (status, lesson) => {
        if (status !== "Locked") {
            navigate(`/lesson/${lesson.id}`);
        }
    };

    const renderLessons = () => {
        const groupedLessons = lessons.reduce((groups, lesson) => {
            groups[lesson.level] = groups[lesson.level] || [];
            groups[lesson.level].push(lesson);
            return groups;
        }, {});

        // Define the desired order of levels
        const levelOrder = ["Beginner", "Intermediate", "Advanced"];

        return levelOrder.map((level) => {
            const levelLessons = groupedLessons[level];
            if (!levelLessons) return null; // Skip levels with no lessons

            return (
                <div key={level} className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                        {level} Lessons
                    </h2>
                    {level === "Intermediate" && (
                        <p className='mb-1 font-semibold'>Require WPM: <strong>40+</strong> Accuracy: <strong>90%+</strong></p>
                    )}
                    {level === "Advanced" && (
                        <p className='mb-1 font-semibold'>Require WPM: <strong>60+</strong> Accuracy: <strong>95%+</strong></p>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {levelLessons.map((lesson) => {
                            const progress = userProgress?.[`lesson${lesson.id}`];
                            const { status, className } = getLessonStatus(level, lesson, progress);

                            return (
                                <div
                                    key={lesson.id}
                                    onClick={() => handleLessonClick(status, lesson)}
                                    className={`p-5 rounded-lg shadow-md border transition-shadow duration-300 ${className}`}
                                >
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        Lesson {lesson.id}: {lesson.title}
                                    </h3>
                                    {progress ? (
                                        <p className="text-sm text-gray-600">
                                            Status: {progress.status} | Accuracy: {progress.accuracy}% | WPM: {progress.wpm}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-600">Status: {status}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="max-w-[1240px] w-full mx-auto text-center flex-col justify-center my-10 px-10">
            <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">Typing Lesson</h1>
            <div className="fixed bottom-10 right-60 z-50">
                <button
                    onClick={() => navigate('/SkipLesson')}
                    className="bg-blue-500 hover:bg-blue-600 transition duration-300 px-4 py-2 mx-auto ease-in-out w-auto text-xl text-white rounded-md"
                >
                    Skip Lesson?
                </button>
            </div>
            <div className="place-self-center text-left max-w-screen-lg w-full mx-5 ml-5 mr-5 p-6 rounded-lg border border-gray-300 bg-white shadow-md grid grid-rows-1 gap-4">
                {loading ? (
                    <p className="text-lg font-semibold">Loading...</p>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                                Pre Lesson
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div
                                    className="p-5 rounded-lg shadow-md border bg-white cursor-pointer hover:shadow-lg transition-shadow duration-300"
                                    onClick={() => navigate('/PreLesson')}
                                >
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Pre Lesson</h3>
                                </div>
                            </div>
                        </div>
                        {renderLessons()}
                    </>
                )}
            </div>
        </div>
    );
};

export default TypingLesson;