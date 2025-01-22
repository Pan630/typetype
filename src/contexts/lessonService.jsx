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

    // Fetch user progress document
    const progressSnapshot = await getDoc(progressRef);

    let accuracyThreshold = 80;
    let wpmThreshold = 0;

    if (lessonId >= 7 && lessonId <= 9) {
        accuracyThreshold = 90;
        wpmThreshold = 40;
    } else if (lessonId >= 10 && lessonId <= 12) {
        accuracyThreshold = 95;
        wpmThreshold = 60;
    }

    const isComplete = acc >= accuracyThreshold && wpm >= wpmThreshold;

    // If not have progress data
    if (!progressSnapshot.exists()) {
        if (isComplete) {
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
        } else {
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
    } else {
        // Already got progress data
        const data = progressSnapshot.data();
        const lessonProgress = data[`lesson${lessonId}`];

        // redo lesson
        if (lessonProgress?.status === "Complete") {
            await updateDoc(progressRef, {
                [`lesson${lessonId}`]: {
                    ...lessonProgress,
                    accuracy: acc,
                    wpm: wpm,
                    timeTaken: totalTime,
                    updatedAt: serverTimestamp(),
                },
                updatedAt: serverTimestamp(),
            });
        } else {
            const updateData = {
                [`lesson${lessonId}`]: {
                    status: isComplete ? "Complete" : "In Progress",
                    accuracy: acc,
                    wpm: wpm,
                    timeTaken: totalTime,
                    dateCompleted: isComplete ? serverTimestamp() : null,
                    updatedAt: serverTimestamp(),
                },
                updatedAt: serverTimestamp(),
            };

            if (isComplete) {
                updateData[`lesson${nextLessonId}`] = {
                    status: "In Progress",
                    accuracy: null,
                    wpm: null,
                    timeTaken: null,
                    dateCompleted: null,
                    updatedAt: serverTimestamp(),
                };
            }

            await updateDoc(progressRef, updateData);
        }
    }
    const usersCollection = collection(db, "Users");
    const userRef = doc(usersCollection, userId);

    // Update user level
    if (lessonId === 10 && acc >= 95 && wpm >= 60) {
        if (userData.level !== "Advanced") {
            await setDoc(userRef, {
                level: "Advanced",
            }, { merge: true });
        }
    } else if (lessonId === 7 && acc >= 90 && wpm >= 40) {
        if (userData.level !== "Intermediate") {
            await setDoc(userRef, {
                level: "Intermediate",
            }, { merge: true });
        }
    }
};