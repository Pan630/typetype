import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authProvider';
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import FingerPlacementGuide from "../component/FingerPlacementGuide";

const Hero = () => {
    const { currentUser, userLoggedIn } = useAuth();
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser && userLoggedIn) {
                const docRef = doc(db, "Users", currentUser.uid);
                const docInfo = await getDoc(docRef);
                if (docInfo.exists()) {
                    setUserDetails(docInfo.data());
                } else {
                    console.log("user is not logged in");
                }
            } else {
                console.log("No user is logged in.");
            }
        };
        fetchUserData();
    }, [currentUser, userLoggedIn]);

    return (
        <div>
            <div className='max-w-[1240px] w-full mx-auto text-center flex-col justify-center px-6 my-10 md:px-12'>
                <h1 className='text-black md:text-7xl sm:text-6xl text-4xl font-extrabold py-6 leading-tight'>
                    Unlock Your Typing Potential!
                </h1>
                <Link to='/TypingTest'>
                    <button className='font-semibold text-white w-[200px] rounded-md my-6 mx-auto py-3 transition duration-300 ease-in-out bg-[#476730] hover:bg-[#3e5825]'>
                        Let&apos;s Start Type
                    </button>
                </Link>
                <div className="mt-8">
                    <FingerPlacementGuide />
                </div>
            </div>
        </div>
    )
}

export default Hero;

