import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import React from 'react';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import TypingLesson from './pages/TypingLesson';
import TypingPractice from './pages/TypingPractice';
import TypingTest from './pages/TypingTest';
import TypingGame from './pages/TypingGame';
import Login from './component/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './component/Register';
import UserProfile from './pages/UserProfile';
import LessonDetail from './component/LessonDetail';
import TestHistory from './pages/TestHistory';
import LearningProgress from './pages/LearningProgress';
import AdminDashboard from './pages/AdminDashboard';
import PreLesson from './pages/PreLesson';

import { AuthProvider } from './contexts/authProvider';
import { ToastContainer } from "react-toastify";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path='/TypingLesson' element={<TypingLesson />} />
      <Route path='/TypingPractice' element={<TypingPractice />} />
      <Route path='/TypingTest' element={<TypingTest />} />
      <Route path='/TypingGame' element={<TypingGame />} />
      <Route path='/Login' element={<Login />} />
      <Route path='/ForgotPassword' element={<ForgotPassword />} />
      <Route path='/Register' element={<Register />} />
      <Route path='/UserProfile' element={<UserProfile />} />
      <Route path='/lesson/:lessonId' element={<LessonDetail />} />
      <Route path='/TestHistory' element={<TestHistory />} />
      <Route path='/LearningProgress' element={<LearningProgress />} />
      <Route path='/AdminDashboard' element={<AdminDashboard />} />
      <Route path='/PreLesson' element={<PreLesson />} />
    </Route>
  )
);

const App = () => {
  return (
    <>
      <AuthProvider>
        <ToastContainer />
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  )
}

export default App
