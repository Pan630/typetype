// all page layout
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../component/Navbar';
import Footer from '../component/Footer';

const MainLayout = () => {
    return (
        <>
            <Navbar />
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </>
    );
};

export default MainLayout;