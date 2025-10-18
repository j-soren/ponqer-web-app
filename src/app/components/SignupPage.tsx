'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SignupPageProps {
  onSignup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSwitchToLogin: () => void;
  error?: string;
}

export default function SignupPage({ onSignup, onSwitchToLogin, error: externalError }: SignupPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Progress animation effect
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    // Simulate realistic loading progress
    const intervals: NodeJS.Timeout[] = [];
    
    // Fast initial progress (0-40% in 300ms)
    const fastInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 40) {
          clearInterval(fastInterval);
          return prev;
        }
        return prev + 3;
      });
    }, 20);
    intervals.push(fastInterval);

    // Medium progress (40-80% in 500ms) - during actual API call
    setTimeout(() => {
      const mediumInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 80) {
            clearInterval(mediumInterval);
            return prev;
          }
          return prev + 2;
        });
      }, 25);
      intervals.push(mediumInterval);
    }, 300);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [isLoading]);

  const completeProgress = (success: boolean) => {
    setProgress(100);
    if (success) {
      setLoadingMessage('Account created! Redirecting...');
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setLoadingMessage('');
      }, 800);
    } else {
      setLoadingMessage('Account creation failed');
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setLoadingMessage('');
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Creating your account...');
    
    // Call the actual signup function
    const result = await onSignup(email, password);
    
    // Complete the progress based on result
    completeProgress(result.success);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-500">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/ponqer-logo.png"
                alt="ponqer.com logo"
                width={240}
                height={50}
                priority
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Join us to get started
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || externalError) && (
              <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error || externalError}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
            
            {/* Inline Loader - appears below button */}
            <div className={`transition-all duration-500 overflow-hidden ${isLoading ? 'max-h-24 opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
              {/* Loading Message */}
              <div className="text-center mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {loadingMessage}
                </p>
              </div>
              
              {/* Progress Bar Container */}
              <div className="relative mb-3">
                {/* Background track */}
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  {/* Progress bar */}
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine"></div>
                  </div>
                </div>
                
                {/* Progress glow */}
                <div 
                  className="absolute top-0 left-0 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full opacity-30 blur-sm transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Progress Percentage and Status Dots */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="tabular-nums font-mono">
                  {Math.floor(progress)}%
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          progress > (i + 1) * 25 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <span className="ml-2">Setting up account</span>
                </div>
              </div>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Sign in here
              </button>
            </p>
          </div>

        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shine {
          animation: shine 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}