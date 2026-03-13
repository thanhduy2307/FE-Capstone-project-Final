import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/login/index.jsx';
import Unauthorized from './pages/unauthorized/index.jsx';

import AdminLayout from './components/AdminLayout.jsx';
import AdminDashboard from './pages/admin-dashboard/index.jsx';
import AdminTheses from './pages/admin-theses/index.jsx';
import AdminPeriods from './pages/admin-periods/index.jsx';
import AdminLecturers from './pages/admin-lecturers/index.jsx';
import AdminStudents from './pages/admin-students/index.jsx';
import AdminUsers from './pages/admin-users/index.jsx';

import LecturerLayout from './components/LecturerLayout.jsx';
import LecturerTheses from './pages/lecturer-theses/index.jsx';
import LecturerReviews from './pages/lecturer-reviews/index.jsx';

import ModeratorLayout from './components/ModeratorLayout.jsx';
import ModeratorTheses from './pages/moderator-theses/index.jsx';

import StudentLayout from './components/StudentLayout.jsx';
import StudentDashboard from './pages/student-dashboard/index.jsx';
import StudentTheses from './pages/student-theses/index.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Admin Routes - Protected with role restriction */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="theses" element={<AdminTheses />} />
          <Route path="periods" element={<AdminPeriods />} />
          <Route path="lecturers" element={<AdminLecturers />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        
        {/* Lecturer Routes - Protected with role restriction */}
        <Route
          path="/lecturer"
          element={
            <ProtectedRoute allowedRoles={['LECTURER']}>
              <LecturerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="theses" replace />} />
          <Route path="theses" element={<LecturerTheses />} />
          <Route path="reviews" element={<LecturerReviews />} />
        </Route>
        
        {/* Moderator Routes - Protected with role restriction */}
        <Route
          path="/moderator"
          element={
            <ProtectedRoute allowedRoles={['MODERATOR']}>
              <ModeratorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="theses" replace />} />
          <Route path="theses" element={<ModeratorTheses />} />
        </Route>
        
        {/* Student Routes - Protected with role restriction */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="theses" element={<StudentTheses />} />
        </Route>
        
        {/* Catch all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
