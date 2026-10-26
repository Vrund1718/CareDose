import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import PatientDashboard from './components/PatientDashboard';
import CaregiverDashboard from './components/CaregiverDashboard';
import Toast from './components/Toast';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('caredose_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      setUser(res.user);
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      localStorage.removeItem('caredose_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('caredose_token');
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  const handleOpenAuth = (tab = 'login') => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleQuickDemo = async (email, role) => {
    try {
      showToast('Signing in with demo account...', 'info');
      const data = await api.auth.login({
        email,
        password: 'Password123!'
      });
      if (data.token) {
        localStorage.setItem('caredose_token', data.token);
        setUser(data.user);
        showToast(`Welcome back, ${data.user.name}!`);
      }
    } catch (err) {
      showToast('Demo sign-in failed: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-600">Loading CareDose Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={handleOpenAuth} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
        {!user ? (
          <LandingPage 
            onOpenAuth={handleOpenAuth} 
            onQuickDemo={handleQuickDemo} 
          />
        ) : user.role === 'patient' ? (
          <PatientDashboard user={user} showToast={showToast} />
        ) : (
          <CaregiverDashboard user={user} showToast={showToast} />
        )}
      </main>

      {/* Auth Modal Overlay */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab={authTab}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(userData) => {
            setUser(userData);
            setIsAuthModalOpen(false);
            showToast(`Welcome back, ${userData.name}!`);
          }}
        />
      )}

      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
