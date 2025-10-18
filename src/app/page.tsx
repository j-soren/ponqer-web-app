'use client';

import { useState } from 'react';
import { useAuth } from "./context/AuthContext";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import WelcomePage from "./components/WelcomePage";

export default function Home() {
  const { isAuthenticated, login, signup } = useAuth();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    setAuthError('');
    const result = await login(email, password);
    if (!result.success) {
      setAuthError(result.error || 'Login failed');
    }
  };

  const handleSignup = async (email: string, password: string) => {
    setAuthError('');
    const result = await signup(email, password);
    if (!result.success) {
      setAuthError(result.error || 'Signup failed');
    }
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
        <SignupPage 
          onSignup={handleSignup} 
          onSwitchToLogin={switchToLogin}
          error={authError}
        />
      );
    } else {
      return (
        <LoginPage 
          onLogin={handleLogin}
          onSwitchToSignup={switchToSignup}
          error={authError}
        />
      );
    }
  }

  return <WelcomePage />;
}
