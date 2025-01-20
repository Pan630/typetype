import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authProvider';
import { auth, db } from '../firebase/firebase'; // Import Firebase Auth
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const Navbar = () => {
  const [nav, setNav] = useState(true);
  const { currentUser, userLoggedIn, role } = useAuth(); // Access user state from context
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  const handleNav = () => {
    setNav(!nav); // This is to toggle the nav menu
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser && userLoggedIn) {
        const docRef = doc(db, "Users", currentUser.uid);
        const docInfo = await getDoc(docRef);
        if (docInfo.exists()) {
          setUserDetails(docInfo.data());
        } else {
          console.log("user is not logged in.");
        }
      } else {
        console.log("No user is logged in.");
      }
    };
    fetchUserData();
  }, [currentUser, userLoggedIn]);

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Log out the user
      toast.success("Successfully logged out!", {
        position: "top-center",
      });
      navigate('/Login');
    } catch (error) {
      toast.error("Error logging out", {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-black'>
      {role === "admin" ? (
        <>
          <Link to='/AdminDashboard'><h1 className='text-3xl text-black font-extrabold'>TypeType</h1></Link>
          <nav className='hidden md:flex'>
            <Link to="/AdminDashboard"><p className='font-semibold rounded-md py-3 px-4 text-xl hover:text-zinc-500 active:bg-[#476730] active:text-white'>Dashboard</p></Link>
          </nav>
        </>
      ) : (
        <>
          <Link to='/'><h1 className='text-3xl text-black font-extrabold'>TypeType</h1></Link>
          <nav className='hidden md:flex'>
            <Link to="/"><p className='font-semibold rounded-md py-3 px-4 text-xl hover:text-zinc-500 active:bg-[#476730] active:text-white'>Home</p></Link>
            <Link to="/TypingLesson"><p className='font-semibold rounded-md py-3 px-4 text-xl hover:text-zinc-500 active:bg-[#476730] active:text-white'>Lesson</p></Link>
            <Link to="/TypingPractice"><p className='font-semibold rounded-md py-3 px-4 text-xl hover:text-zinc-500 active:bg-[#476730] active:text-white'>Practice</p></Link>
            <Link to="/TypingTest"><p className='font-semibold rounded-md py-3 px-4 text-xl hover:text-zinc-500 active:bg-[#476730] active:text-white'>Test</p></Link>
            <Link to="/TypingGame"><p className='font-semibold rounded-md py-3 px-4 text-xl hover:text-zinc-500 active:bg-[#476730] active:text-white'>Game</p></Link>
          </nav>
        </>
      )}

      <div>
        {userLoggedIn ? (
          userDetails ? (
            <div className='hidden md:flex'>
              {role === "admin" ? (
                <button className="font-semibold text-white w-[150px] rounded-md mx-auto py-3 transition duration-300 ease-in-out bg-[#476730] hover:bg-red-500"
                  onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                // Regular user buttons
                <div className="group relative cursor-pointer bg-[#476730] rounded-md min-w-[180px] mx-auto">
                  <Link
                    to="/UserProfile"
                    className="flex items-center justify-between space-x-5 px-4 text-white">
                    <p className="menu-hover text-base text-white py-2 font-semibold">
                      My Profile
                    </p>
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-6 w-6 text-white hover:text-gray-300 transition duration-300 ease-in-out"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </Link>
                  <div
                    className="invisible absolute z-50 flex w-full flex-col bg-gray-100 py-1 text-gray-800 shadow-xl group-hover:visible">
                    <Link
                      to="/TestHistory"
                      className="block border-b border-gray-100 p-2 rounded-md font-semibold text-gray-500 transition duration-150 ease-out hover:ease-in hover:text-white md:mx-2 hover:bg-[#476730]">
                      Test Records
                    </Link>
                    <Link
                      to="/LearningProgress"
                      className="block border-b border-gray-100 p-2 rounded-md font-semibold text-gray-500 transition duration-150 ease-out hover:ease-in hover:text-white md:mx-2 hover:bg-[#476730]">
                      Learning Progress
                    </Link>
                    <p className="block border-b border-gray-100 p-2 rounded-md font-semibold text-gray-500 transition duration-150 ease-out hover:ease-in hover:text-white md:mx-2 hover:bg-red-500"
                      onClick={handleLogout}>
                      Logout
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Loading state
            <p className='text-lg font-semibold text-center'>Loading...</p>
          )
        ) : (
          <Link to="/Login">
            <button className='hidden md:flex justify-center font-semibold text-white w-[150px] rounded-md mx-auto py-2 transition duration-300 ease-in-out bg-[#476730] hover:bg-[#3e5825]'>
              Sign Up / Login
            </button>
          </Link>
        )}
      </div>

      <div onClick={handleNav} className='block md:hidden'>
        {!nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}

        <div className={!nav ? 'z-50 fixed left-0 top-0 w-[60%] border-r border-r-gray-900 h-full bg-[#E3E3DC] ease-in-out duration-500' : 'fixed left-[-100%]'}>
          <h1 className='text-3xl font-extrabold text-black m-4'>TypeType</h1>
          <ul className='pt-24 uppercase p-4'>
            {role === "admin" ? (
              <>
                <Link to='/AdminDashboard'>
                  <li className='font-semibold p-4 border-b border-gray-600'>
                    Admin Dashboard
                  </li>
                </Link>
              </>
            ) : (
              <>
                <Link to="/">
                  <li className='font-semibold p-4 border-b border-gray-600'>Home</li>
                </Link>
                <Link to="/TypingLesson">
                  <li className='font-semibold p-4 border-b border-gray-600'>Lesson</li>
                </Link>
                <Link to="/TypingPractice">
                  <li className='font-semibold p-4 border-b border-gray-600'>Practice</li>
                </Link>
                <Link to="/TypingTest">
                  <li className='font-semibold p-4 border-b border-gray-600'>Test</li>
                </Link>
                <Link to="/TypingGame">
                  <li className='font-semibold p-4 border-b border-gray-600'>Game</li>
                </Link>
              </>
            )}

            {/* Authentication Links */}
            {userLoggedIn ? (
              <>
                <Link to="/UserProfile">
                  <li className='font-semibold p-4 border-b border-gray-600'>My Profile</li>
                </Link>
                <Link to="/TestHistory">
                  <li className='font-semibold p-4 border-b border-gray-600'>Test Records</li>
                </Link>
                <Link to="/LearningProgress">
                  <li className='font-semibold p-4 border-b border-gray-600'>Learning Progress</li>
                </Link>
                <li
                  onClick={handleLogout}
                  className='font-semibold p-4 cursor-pointer text-red-500 hover:text-red-700'
                >
                  Logout
                </li>
              </>

            ) : (
              <Link to="/Login">
                <li className='font-semibold p-4 cursor-pointer hover:text-gray-700'>
                  Sign Up / Login
                </li>
              </Link>
            )}
          </ul>
        </div>
      </div>

    </div >
  );
}

export default Navbar;