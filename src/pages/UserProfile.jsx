import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authProvider";

const UserProfile = () => {
  const navigate = useNavigate();
  const { currentUser, userLoggedIn } = useAuth();
  const hasNavigated = useRef(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email);
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUsername(docSnap.data().userName);
            setLevel(docSnap.data().level);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);


  useEffect(() => {
    if (!userLoggedIn) {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        navigate('/Login');
        setTimeout(() => {
          toast.info("You have to login to continue.", {
            position: "bottom-center",
          });
        }, 1000);
      }
    }
  }, [userLoggedIn, navigate]);

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

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!isMinLength || !hasUppercase || !hasLowercase || !hasSpecialChar) {
      setErrorMessage("Password does not meet the required criteria.");
      return;
    }

    if (newPassword !== newConfirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      toast.success("Password updated successfully!", { position: "top-center" });
      setIsPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setErrorMessage("");
    } catch (error) {
      switch (error.code) {
        case "auth/wrong-password":
          setErrorMessage("Current password is incorrect. Please try again.");
          break;
        default:
          setErrorMessage("Failed to update password. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-[800px] w-full mx-auto my-10 px-10">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">User Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block font-bold text-lg text-gray-600">Username:</label>
          <p className="text-gray-800 text-lg">{username}</p>
        </div>
        <div className="mb-4">
          <label className="block font-bold text-lg text-gray-600">Email:</label>
          <p className="text-gray-800 text-lg">{email}</p>
        </div>
        <div className="mb-4">
          <label className="block font-bold text-lg text-gray-600">Level:</label>
          <p className="text-gray-800 text-lg">{level}</p>
        </div>
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="font-semibold px-4 py-2 transition duration-300 ease-in-out bg-[#476730] hover:bg-[#3e5825] text-white rounded-md"
        >
          Change Password
        </button>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
            <h2 className="text-2xl font-extrabold mb-4">Change Password</h2>
            <form noValidate onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block font-bold text-lg text-gray-600">Current Password:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-lg text-gray-600">New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    validatePassword(e.target.value);
                    setNewPassword(e.target.value);
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>
              <div className="text-md">
                <p className="font-bold text-gray-600">Password Requirement:</p>
                <p className={isMinLength ? "text-green-600" : "text-gray-600 font-semibold"}>
                  • At least 8 characters
                </p>
                <p className={hasUppercase ? "text-green-600" : "text-gray-600 font-semibold"}>
                  • At least one uppercase letter
                </p>
                <p className={hasLowercase ? "text-green-600" : "text-gray-600 font-semibold"}>
                  • At least one lowercase letter
                </p>
                <p className={hasSpecialChar ? "text-green-600" : "text-gray-600 font-semibold"}>
                  • At least one special character
                </p>
              </div>
              <div>
                <label className="block font-bold text-lg text-gray-600">Confirm New Password:</label>
                <input
                  type="password"
                  required
                  value={newConfirmPassword}
                  onChange={(e) => setNewConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {errorMessage && (
                <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setErrorMessage("");
                  }}
                  className="font-semibold px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="font-semibold px-4 py-2 transition duration-300 ease-in-out bg-[#476730] hover:bg-[#3e5825] text-white rounded-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
