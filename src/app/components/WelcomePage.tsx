'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './AuthProviderWrapper';
import { useSettings } from '../context/SettingsContext';
import { useRouter } from 'next/navigation';
import AdminPanel from './AdminPanel';
import SettingsPage from './SettingsPage';

export default function WelcomePage() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    setShowOptions(true);
  };

  const handleNewThoughts = () => {
    router.push('/new-thoughts');
  };

  const handleLibrary = () => {
    router.push('/library');
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleManage = () => {
    setShowAdminPanel(true);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center ${
      settings.backgroundType === 'gradient' ? 'theme-bg-gradient' :
      settings.backgroundType === 'animated' ? 'theme-bg-animated' : 'theme-bg-solid'
    } ${!settings.animationsEnabled ? 'theme-animations-disabled' : ''}`}>
      {/* Animated Background Elements */}
      {settings.particleEffects && (
      <div className={`absolute inset-0 transition-all duration-1000 theme-particles ${showOptions ? 'blur-sm scale-105 opacity-50' : ''}`}>
        {/* Floating Light Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-400/30 rounded-full blur-lg animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-cyan-400/25 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-indigo-400/20 rounded-full blur-xl animate-bounce" style={{animationDuration: '4s', animationDelay: '0.5s'}}></div>
        
        {/* Gradient Rays */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>

        {/* Rotating Light Ring */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 border border-blue-400/20 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
          <div className="absolute inset-4 border border-purple-400/15 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
          <div className="absolute inset-8 border border-cyan-400/10 rounded-full animate-spin" style={{animationDuration: '25s'}}></div>
        </div>

        {/* Sparkle Effects */}
        <div className="absolute top-1/5 left-1/5 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-2/5 right-1/5 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/5 left-2/5 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-2/5 right-2/5 w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
      </div>
      )}

      {/* Header with logout */}
      <header className="absolute top-6 right-6 z-10">
        <div className="flex items-center gap-4 text-white/80">
          <span className="text-sm font-medium">Hello, {user?.email}</span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Welcome Content */}
      <div className={`relative z-10 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${showOptions ? 'blur-sm scale-95 opacity-30' : ''}`}>
        {/* Glowing Welcome Text */}
        <div className="relative">
          <h1 className={`text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent ${settings.animationsEnabled ? 'animate-pulse' : ''}`}>
            {settings.welcomeText}
          </h1>
          
          {/* Text Glow Effect */}
          {settings.glowEffects && (
          <div className={`absolute inset-0 text-8xl md:text-9xl font-bold text-blue-400/20 blur-lg theme-glow ${settings.animationsEnabled ? 'animate-pulse' : ''}`}>
            {settings.welcomeText}
          </div>
          )}
        </div>

        {/* Subtitle */}
        <p className={`mt-8 text-xl md:text-2xl text-white/70 font-light transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {settings.subtitleText}
        </p>

        {/* Animated Divider */}
        <div className={`mt-12 flex justify-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="h-px w-64 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        {/* Floating Action Button */}
        <div className={`mt-12 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button 
            onClick={handleGetStarted}
            className={`group theme-button bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:from-blue-600 hover:to-purple-700 ${
              settings.buttonAnimation === 'hover-grow' ? 'theme-button-hover-grow' :
              settings.buttonAnimation === 'hover-glow' ? 'theme-button-hover-glow' :
              settings.buttonAnimation === 'pulse' ? 'theme-button-pulse' : ''
            }`}>
            <span className="flex items-center gap-2">
              {settings.getStartedButtonText}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Options Panel */}
      {showOptions && (
        <div className="fixed inset-0 z-20 flex items-center justify-center">
          <div className="text-center">
            {/* Options Title */}
            <h2 className={`text-4xl font-bold text-white mb-12 transition-all duration-700 ${showOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Choose Your Path
            </h2>
            
            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-6 items-center justify-center ${user?.isAdmin ? 'sm:flex-wrap' : ''}`}>
              {/* New Thoughts Button */}
              <div className={`transform transition-all duration-700 delay-300 ${showOptions ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}`}>
                <button 
                  onClick={handleNewThoughts}
                  className="group relative px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-blue-800 min-w-[200px]">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-lg">New Thoughts</span>
                    <span className="text-sm opacity-80">Create & Inspire</span>
                  </div>
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>

              {/* Library Button */}
              <div className={`transform transition-all duration-700 delay-500 ${showOptions ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}`}>
                <button 
                  onClick={handleLibrary}
                  className="group relative px-8 py-6 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-purple-800 min-w-[200px]">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-lg">Library</span>
                    <span className="text-sm opacity-80">Browse & Read</span>
                  </div>
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>

              {/* Profile Button */}
              <div className={`transform transition-all duration-700 delay-700 ${showOptions ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}`}>
                <button 
                  onClick={() => router.push('/profile')}
                  className="group relative px-8 py-6 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-green-800 min-w-[200px]">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-lg">Profile</span>
                    <span className="text-sm opacity-80">Edit Account</span>
                  </div>
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>

              {/* Settings Button */}
              <div className={`transform transition-all duration-700 delay-800 ${showOptions ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}`}>
                <button 
                  onClick={handleSettings}
                  className="group relative px-8 py-6 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-cyan-800 min-w-[200px]">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-lg">Settings</span>
                    <span className="text-sm opacity-80">Preferences</span>
                  </div>
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>

              {/* Admin Manage Button */}
              {user?.isAdmin && (
                <div className={`transform transition-all duration-700 delay-1000 ${showOptions ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}`}>
                  <button 
                    onClick={handleManage}
                    className="group relative px-8 py-6 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-red-800 min-w-[200px]">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span className="text-lg">Manage</span>
                      <span className="text-sm opacity-80">Admin Panel</span>
                    </div>
                    <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              )}
            </div>

            {/* Back Button */}
            <div className={`mt-12 transition-all duration-700 delay-900 ${showOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button 
                onClick={() => setShowOptions(false)}
                className="px-6 py-3 text-white/70 border border-white/20 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-300 backdrop-blur-sm"
              >
                ← Back to Welcome
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Ambient Light */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32 bg-gradient-to-t from-purple-600/10 via-blue-500/5 to-transparent blur-2xl"></div>
      
      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
      
      {/* Settings Panel */}
      {showSettings && (
        <SettingsPage onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
