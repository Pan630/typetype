import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/authProvider";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);

    const navigate = useNavigate();
    const { userLoggedIn, role, loading } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form submission
        setIsSigningIn(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, "Users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userRole = userData.role;

                if (userRole === "admin") {
                    navigate("/AdminDashboard");
                    toast.success("Admin logged in successfully!", { position: "top-center" });
                } else {
                    navigate("/");
                    toast.success("User logged in successfully!", { position: "top-center" });
                }
            } else {
                setErrorMessage("User data not found.");
            }
        } catch (error) {
            // console.error("Error during login:", error); // Check Error
            switch (error.code) {
                case "auth/invalid-email":
                    setErrorMessage("Invalid email address. Please check and try again.");
                    break;
                case "auth/user-not-found":
                    setErrorMessage("No account found with this email. Please sign up first.");
                    break;
                case "auth/wrong-password":
                    setErrorMessage("Incorrect password. Please try again.");
                    break;
                default:
                    setErrorMessage("Login failed. Please try again later.");
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    useEffect(() => {
        if (userLoggedIn) {
            if (role === "admin") {
                navigate("/AdminDashboard");
            } else {
                navigate("/");
            }
        }
    }, [role, userLoggedIn, navigate]);

    return (
        <div className="max-w-[800px] w-full h-screen mx-auto flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg max-w-[400px] w-full p-6">
                <h1 className="text-gray-800 font-bold text-center text-3xl mb-6">Login</h1>
                <form noValidate onSubmit={handleLogin} className="space-y-5">
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
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                        <Link
                            to="/ForgotPassword"
                            className="flex justify-end text-sm text-blue-600 font-semibold mt-1">
                            Forgot Password?
                        </Link>
                    </div>


                    {errorMessage && (
                        <p className="text-red-600 text-sm font-medium text-center">{errorMessage}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || isSigningIn}
                        className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors duration-300 ${loading || isSigningIn
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#476730] hover:bg-[#3e5825]"
                            }`}
                    >
                        {isSigningIn ? "Signing In..." : "Submit"}
                    </button>
                </form>
                <span className="flex justify-start mt-6 text-gray-600">
                    Don't have an account?
                    <Link to="/Register">
                        <span className="ml-2 text-blue-500 hover:underline">Sign Up</span>
                    </Link>
                </span>
            </div>
        </div>
    );
};

export default Login;
