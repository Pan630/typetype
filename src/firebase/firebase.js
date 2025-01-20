// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDlSaebsUfyO1vuF4AimfOvexwlvF72_AE",
    authDomain: "typetype-9186a.firebaseapp.com",
    projectId: "typetype-9186a",
    storageBucket: "typetype-9186a.appspot.com",
    messagingSenderId: "100403097213",
    appId: "1:100403097213:web:2465806b6afd0b7fa44b14",
    measurementId: "G-RK9VJ4T5GK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);