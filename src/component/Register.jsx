import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuth } from '../contexts/authProvider';

const Register = () => {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    // const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userLoggedIn) {
            navigate("/");
        }
    });

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Password validation states
    const [isMinLength, setIsMinLength] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false);

    // Update validation states as the user types
    const validatePassword = (value) => {
        setIsMinLength(value.length >= 8);
        setHasUppercase(/[A-Z]/.test(value));
        setHasLowercase(/[a-z]/.test(value));
        setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(value));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSignUp(true);
        if (!isMinLength || !hasUppercase || !hasLowercase || !hasSpecialChar) {
            setErrorMessage("Password does not meet the required criteria.");
            setIsSignUp(false);
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            setIsSignUp(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "Users", user.uid), {
                email: user.email,
                userName: username,
                createdAt: serverTimestamp()
            });

            toast.success("User Registered Successfully!", {
                position: "top-center",
            });
            navigate("/");
        } catch (error) {
            switch (error.code) {
                case "auth/invalid-email":
                    setErrorMessage("Invalid email address. Please check and try again.");
                    break;
                default:
                    setErrorMessage("Register failed. Please try again later.");
            }
        }
        finally {
            setIsSignUp(false);
        }
    };

    return (
        <div className="max-w-[800px] w-full h-screen mx-auto flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg max-w-[400px] w-full p-6">
                <h1 className="text-gray-800 font-bold text-center text-3xl mb-6">Register</h1>
                <form noValidate onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-600 font-bold mb-1">Username:</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 font-bold mb-1">Email Address:</label>
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 font-bold mb-1">Password:</label>
                        <input
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                validatePassword(e.target.value);
                            }}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>

                    <div className="text-sm">
                        <p className={isMinLength ? "text-green-600" : "text-gray-600"}>
                            • At least 8 characters
                        </p>
                        <p className={hasUppercase ? "text-green-600" : "text-gray-600"}>
                            • At least one uppercase letter
                        </p>
                        <p className={hasLowercase ? "text-green-600" : "text-gray-600"}>
                            • At least one lowercase letter
                        </p>
                        <p className={hasSpecialChar ? "text-green-600" : "text-gray-600"}>
                            • At least one special character
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 font-bold mb-1">Confirm Password:</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>

                    {errorMessage && (
                        <p className="text-red-600 text-sm font-medium text-center">{errorMessage}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSignUp}
                        className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors duration-300 ${isSignUp
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#476730] hover:bg-[#3e5825]"
                            }`}
                    >
                        {isSignUp ? "Signing Up..." : "Sign up"}
                    </button>

                    <span className="flex justify-start mt-6 text-gray-600">
                        Already have an account?
                        <Link to="/Login">
                            <span className="ml-2 text-blue-500 hover:underline">Login</span>
                        </Link>
                    </span>
                </form>
            </div>
        </div>
    );
};

export default Register;
