import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/authProvider";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TestHistory = () => {
    const navigate = useNavigate();
    const { currentUser, userLoggedIn } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedResult, setSelectedResult] = useState(null);
    const resultsPerPage = 10;

    const hasNavigated = useRef(false);

    const getDateRange = (filter) => {
        const now = new Date();
        switch (filter) {
            case "today":
                return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() };
            case "week":
                return { start: new Date(now.setDate(now.getDate() - 7)), end: new Date() };
            case "month":
                return { start: new Date(now.setMonth(now.getMonth() - 1)), end: new Date() };
            case "all":
            default:
                return null;
        }
    };

    const fetchResults = async (collectionName, setResultData) => {
        if (currentUser && userLoggedIn) {
            try {
                const resultsRef = collection(db, collectionName);
                const range = getDateRange(timeFilter);
                const constraints = [
                    where("userId", "==", currentUser.uid),
                    orderBy("testTime", "desc"),
                ];
                if (range) {
                    constraints.push(
                        where("testTime", ">=", Timestamp.fromDate(range.start)),
                        where("testTime", "<=", Timestamp.fromDate(range.end))
                    );
                }

                const q = query(resultsRef, ...constraints);
                const querySnapshot = await getDocs(q);
                const resultsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setResultData(resultsData);
            } catch (error) {
                console.error(`Error fetching data:`, error);
            }
        } else {
            console.log("No user is logged in.");
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchResults("TestResults", setResults).finally(() => setLoading(false));

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
    }, [timeFilter, currentUser, userLoggedIn]);



    const startIndex = (currentPage - 1) * resultsPerPage;
    const paginatedResults = results.slice(startIndex, startIndex + resultsPerPage);
    const totalPages = Math.ceil(results.length / resultsPerPage);

    return (
        <div className="max-w-[1240px] w-full mx-auto text-center my-10 px-10">
            <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Typing Test Records</h1>
            <div className="flex justify-center mb-6 space-x-4">
                {["all", "today", "week", "month"].map((filter) => (
                    <button
                        key={filter}
                        className={`font-semibold px-4 py-2 rounded-md transition-all duration-300 ease-in-out ${timeFilter === filter ? "bg-[#476730] text-white" : "bg-gray-300 hover:bg-[#476730] hover:text-white"}`}
                        onClick={() => setTimeFilter(filter)}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-lg font-semibold text-center mt-10">Loading...</div>
            ) : results.length > 0 ? (
                <div>
                    <table className="table-auto w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2">Completed At</th>
                                <th className="border px-4 py-2">WPM</th>
                                <th className="border px-4 py-2">Accuracy</th>
                                <th className="border px-4 py-2">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedResults.map((result) => (
                                <tr key={result.id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2">
                                        {new Date(result.testTime.seconds * 1000).toLocaleString()}
                                    </td>
                                    <td className="border px-4 py-2">{result.wpm}</td>
                                    <td className="border px-4 py-2">{result.accuracy}%</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            className="font-semibold px-4 py-2 bg-[#476730] text-white rounded-md hover:bg-[#3e5825]"
                                            onClick={() => setSelectedResult(result)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-center mt-4 space-x-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="font-semibold px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2">{`Page ${currentPage} of ${totalPages}`}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            className="font-semibold px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>

                    {selectedResult && (
                        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                            <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
                                <h2 className="text-2xl font-extrabold mb-4">Test Details</h2>
                                <p className='text-lg py-2'><strong>Completed At:</strong> {new Date(selectedResult.testTime.seconds * 1000).toLocaleString()}</p>
                                <p className="py-2"><strong>WPM:</strong> {selectedResult.wpm}</p>
                                <p className="py-2"><strong>Accuracy:</strong> {selectedResult.accuracy}%</p>
                                <p className="py-2"><strong>Time Taken:</strong> {selectedResult.timeTaken}s</p>
                                <p className="py-2"><strong>Total Letters Typed:</strong> {selectedResult.totalLettersTyped}</p>
                                <p className="py-2"><strong>Correct Letters:</strong> {selectedResult.correctLetters}</p>
                                <p className="py-2"><strong>Incorrect Letters:</strong> {selectedResult.incorrectLetters}</p>

                                {Object.keys(selectedResult.errorLetters || {}).length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="font-bold mb-2">Error Characters:</h3>
                                        <div className="font-semibold grid grid-cols-4 gap-2">
                                            {Object.entries(selectedResult.errorLetters).map(([char, count]) => (
                                                <div key={char} className="flex justify-between p-2 bg-gray-200 rounded-md">
                                                    <span>{char}</span>
                                                    <span>({count}) error</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="font-semibold mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    onClick={() => setSelectedResult(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="mt-6">No test records found. Please take a typing test!</p>
            )}
        </div>
    );
};

export default TestHistory;
