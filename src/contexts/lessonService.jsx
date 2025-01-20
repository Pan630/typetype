import { collection, updateDoc, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

const lessonsCollection = collection(db, "Lessons");

export const fetchLessons = async () => {
    try {
        const lessonsSnapshot = await getDocs(lessonsCollection);
        return lessonsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching lessons:", error);
    }
};

export const fetchLessonProgress = async (userId) => {
    try {
        const progressDocRef = doc(db, "LessonProgress", userId);
        const progressSnapshot = await getDoc(progressDocRef);

        if (!progressSnapshot.exists()) {
            // console.warn(`No progress data found for user ID: ${userId}`);
            return null;
        }

        return progressSnapshot.data();
    } catch (error) {
        console.error("Error fetching lesson progress:", error);
        return null;
    }
}

export const updateLessonProgress = async (userId, lessonId, acc, wpm, totalTime, nextLessonId) => {
    const progressCollection = collection(db, "LessonProgress");
    const progressRef = doc(progressCollection, userId);
    // Check got user lesson progress data
    const progressSnapshot = await getDoc(progressRef);

    // No have progress data
    if (!progressSnapshot.exists()) {
        if (acc >= 80) {
            await setDoc(progressRef, {
                [`lesson${lessonId}`]: {
                    status: "Complete",
                    accuracy: acc,
                    wpm: wpm,
                    timeTaken: totalTime,
                    dateCompleted: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                },
                [`lesson${nextLessonId}`]: {
                    status: "In Progress",
                    accuracy: null,
                    wpm: null,
                    timeTaken: null,
                    dateCompleted: null,
                    updatedAt: serverTimestamp(),
                },
                updatedAt: serverTimestamp(),
            });
        }
        else {
            await setDoc(progressRef, {
                [`lesson${lessonId}`]: {
                    status: "In Progress",
                    accuracy: acc,
                    wpm: wpm,
                    timeTaken: totalTime,
                    dateCompleted: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                },
                updatedAt: serverTimestamp(),
            });
        }

    } else { // Got progress data
        // If redo complete lesson
        const data = progressSnapshot.data();
        const lessonProgress = data[`lesson${lessonId}`];
        if (lessonProgress.status === "Complete") {
            if (acc >= 80) {
                await updateDoc(progressRef, {
                    [`lesson${lessonId}`]: {
                        status: "Complete",
                        accuracy: acc,
                        wpm: wpm,
                        timeTaken: totalTime,
                        dateCompleted: lessonProgress.dateCompleted,
                        updatedAt: serverTimestamp(),
                    },
                    updatedAt: serverTimestamp(),
                })
            }
        }
        else {
            await updateDoc(progressRef, {
                [`lesson${lessonId}`]: {
                    status: acc >= 80 ? "Complete" : "In Progress",
                    accuracy: acc,
                    wpm: wpm,
                    timeTaken: totalTime,
                    dateCompleted: acc >= 80 ? serverTimestamp() : null,
                    updatedAt: serverTimestamp(),
                },

                [`lesson${nextLessonId}`]: {
                    status: "In Progress",
                    accuracy: null,
                    wpm: null,
                    timeTaken: null,
                    dateCompleted: null,
                    updatedAt: serverTimestamp(),
                },
                updatedAt: serverTimestamp(),
            });
        }
    }
}