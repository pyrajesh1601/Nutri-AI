import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import HealthReport from './pages/HealthReport';
import Exercises from './pages/Exercises';
import ExerciseDetail from './pages/ExerciseDetail';
import Diet from './pages/Diet';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/health-report" element={
            <ProtectedRoute>
              <HealthReport />
            </ProtectedRoute>
          } />

          <Route path="/exercises" element={
            <ProtectedRoute>
              <Exercises />
            </ProtectedRoute>
          } />

          <Route path="/exercises/:id" element={
            <ProtectedRoute>
              <ExerciseDetail />
            </ProtectedRoute>
          } />

          <Route path="/diet" element={
            <ProtectedRoute>
              <Diet />
            </ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />

          <Route path="/community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
