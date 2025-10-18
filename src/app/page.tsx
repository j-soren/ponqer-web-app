'use client';

import { useState, useEffect } from 'react';
import { useAuth } from "./components/AuthProviderWrapper";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import WelcomePage from "./components/WelcomePage";

export default function Home() {
  const { isAuthenticated, login, signup } = useAuth();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [, setIsInitializing] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Initialize welcome animation when authenticated
  useEffect(() => {
    if (isAuthenticated && !showWelcome) {
      setTimeout(() => {
        setShowWelcome(true);
      }, 100);
    }
  }, [isAuthenticated, showWelcome]);

  // Initialize app on startup - silent for login/signup pages
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize database silently
        await fetch('/api/init-db', { method: 'POST' });
        setIsInitializing(false);
      } catch {
        console.log('Database initialization handled by server');
        setIsInitializing(false);
      }
    };
    
    // Run initialization once
    initApp();
  }, []); // Empty dependency array to run only once

  const handleLogin = async (email: string, password: string) => {
    setAuthError('');
    const result = await login(email, password);
    if (!result.success) {
      setAuthError(result.error || 'Login failed');
    } else {
      // Add delay for welcome page transition
      setTimeout(() => {
        setShowWelcome(true);
      }, 500);
    }
    return result;
  };

  const handleSignup = async (email: string, password: string) => {
    setAuthError('');
    const result = await signup(email, password);
    if (!result.success) {
      setAuthError(result.error || 'Signup failed');
    } else {
      // Add delay for welcome page transition
      setTimeout(() => {
        setShowWelcome(true);
      }, 500);
    }
    return result;
  };

  const switchToSignup = () => {
    setIsSignupMode(true);
    setAuthError('');
  };

  const switchToLogin = () => {
    setIsSignupMode(false);
    setAuthError('');
  };

  if (!isAuthenticated) {
    if (isSignupMode) {
      return (
        <div className="transition-opacity duration-700 ease-in-out">
          <SignupPage 
            onSignup={handleSignup} 
            onSwitchToLogin={switchToLogin}
            error={authError}
          />
        </div>
      );
    } else {
      return (
        <div className="transition-opacity duration-700 ease-in-out">
          <LoginPage 
            onLogin={handleLogin}
            onSwitchToSignup={switchToSignup}
            error={authError}
          />
        </div>
      );
    }
  }

  return (
    <div className={`transition-all duration-1000 ease-in-out transform ${
      showWelcome ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
    }`}>
      <WelcomePage />
    </div>
  );
}
