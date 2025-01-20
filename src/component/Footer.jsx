import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#375224] text-white py-4 flex justify-between items-center ">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center max-w-[1240px] px-4">
                <Link to="/" >
                    <h1 className="text-xl text-white font-extrabold">TypeType</h1>
                </Link>
                {/* <nav className="flex flex-col md:flex-row space-x-4">
                    <Link to="/" className="hover:text-zinc-500">Home</Link>
                    <Link to="/TypingLesson" className="hover:text-zinc-500">Lesson</Link>
                    <Link to="/TypingPractice" className="hover:text-zinc-500">Practice</Link>
                    <Link to="/TypingTest" className="hover:text-zinc-500">Test</Link>
                    <Link to="/TypingGame" className="hover:text-zinc-500">Game</Link>
                </nav> */}
                <div className="text-center text-sm mt-4 md:mt-0">
                    &copy; {new Date().getFullYear()} TypeType. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;