import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../firebase/firebase";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);

        try {
            await sendPasswordResetEmail(auth, email);
            navigate("/Login");

            setTimeout(() => {
                toast.info("Check your email for password reset instructions.", {
                    position: "top-center",
                });
            }, 1000);

            setEmail(""); // Clear email field after success
        } catch (error) {
            toast.error(error.message, {
                position: "bottom-center",
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-[800px] w-full h-screen mx-auto flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg max-w-[400px] w-full p-6">
                <h1 className="text-gray-800 font-bold text-center text-3xl mb-6">
                    Forgot Password?
                </h1>
                <p className="text-sm text-gray-600 text-center mb-6">
                    Enter your email address below, and we'll send you instructions to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-600 font-bold mb-1">
                            Email Address:
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSending}
                        className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors duration-300 ${isSending
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#476730] hover:bg-[#3e5825]"
                            }`}
                    >
                        {isSending ? "Sending..." : "Reset Password"}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <Link
                        to="/Login"
                        className="px-4 py-2 text-white bg-gray-600 font-medium rounded-lg hover:bg-gray-700 transition-colors duration-300"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
