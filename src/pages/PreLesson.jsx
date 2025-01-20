import React from 'react';
import FingerPlacementGuide from "../component/FingerPlacementGuide";
import { Link } from 'react-router-dom';

const PreLesson = () => {
    return (
        <div className="max-w-[1240px] mx-auto text-center flex flex-col justify-center my-10 px-4">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Pre Typing Lesson</h1>
            <div className="max-w-screen-lg mx-auto p-6 rounded-lg border border-gray-300 bg-white shadow-md space-y-8">
                <h3 className="text-xl md:text-2xl font-semibold mb-4 border-b-2 border-gray-300 pb-2">
                    Before starting the lesson, learn the names of your fingers. The image below shows the names of each finger.
                </h3>
                <img
                    src="/finger-name.png"
                    alt="Diagram showing finger names for typing"
                    className="mx-auto mb-8 w-64 md:w-96 shadow-lg rounded-lg"
                />
                <h3 className="text-xl md:text-2xl font-semibold mb-4 border-b-2 border-gray-300 pb-2">
                    Now, interact with the keyboard below to see which finger is used to type each letter.
                </h3>
                <FingerPlacementGuide />
            </div>
            <Link to='/lesson/1'>
                <button className='font-semibold text-white w-[200px] rounded-md my-6 mx-auto py-3 transition duration-300 ease-in-out bg-[#476730] hover:bg-[#3e5825]'>
                    Next
                </button>
            </Link>
        </div>
    );
};

export default PreLesson;
