import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const AdminDashboard = () => {
    const [totalUsers, setTotalUsers] = useState(0);
    const [growthData, setGrowthData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, "Users");
                const querySnapshot = await getDocs(usersCollection);

                const users = [];
                querySnapshot.forEach((doc) => {
                    users.push(doc.data());
                });

                setTotalUsers(users.length);

                const trends = {};
                users.forEach((user) => {
                    const date = new Date(user.createdAt.seconds * 1000);
                    const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    trends[month] = (trends[month] || 0) + 1;
                });

                const formattedData = Object.entries(trends).sort(([a], [b]) => new Date(a) - new Date(b));
                setGrowthData(formattedData);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);
    const growthChartData = {
        labels: growthData.map(([month]) => month),
        datasets: [
            {
                label: "New Users",
                data: growthData.map(([, count]) => count),
                backgroundColor: "rgba(71,103,48,0.5)",
                borderColor: "rgba(71,103,48)",
                borderWidth: 2,
            },
        ],
    };
    return (
        <div className="max-w-[1240px] w-full h-screen mx-auto text-center flex-col justify-center my-10 px-10">
            <h1 className='text-4xl font-extrabold text-center mb-6 text-gray-800 '>Admin Dashboard</h1>
            {loading ? (
                <div className="text-lg font-semibold text-center mt-10">Loading...</div>
            ) : (
                <div className="space-y-6">

                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-700">Total Users</h2>
                        <p className="text-4xl font-extrabold text-[#476730]  mt-2">{totalUsers}</p>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">User Growth Trends</h2>
                        <Line data={growthChartData} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard;
