import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupProfile from './pages/SetupProfile';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Chatbot from './components/Chatbot';
import Profile from './pages/Profile';
import Trends from './pages/Trends';

const NotFound = () => <div className="p-4 text-center">404 Not Found</div>;

// Layout with Chatbot
const MainLayout = ({ children }) => (
  <>
    {children}
    <Chatbot />
  </>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // While loading, maybe show nothing or spinner
  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;

  return isAuthenticated ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/setup-profile" element={<ProtectedRoute><SetupProfile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/trends" element={<ProtectedRoute><Trends /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
