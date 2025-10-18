'use client';

import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

interface SettingsPageProps {
  onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const { settings, updateSettings, resetSettings, presetThemes, applyPreset } = useSettings();
  const [activeTab, setActiveTab] = useState<'presets' | 'background' | 'text' | 'buttons' | 'effects'>('presets');

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg border-2 border-gray-600 cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-${label.replace(/\s+/g, '-')}`)?.click()}
        >
          <input
            id={`color-${label.replace(/\s+/g, '-')}`}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const TabButton = ({ tab, label, icon }: { tab: typeof activeTab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
        activeTab === tab
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-6xl h-[90vh] flex overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gray-800 border-b border-gray-700 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Theme Settings</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetSettings}
                className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg border border-gray-600 transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex w-full pt-20">
          
          {/* Sidebar */}
          <div className="w-64 bg-gray-850 p-6 border-r border-gray-700">
            <div className="space-y-2">
              <TabButton 
                tab="presets" 
                label="Presets" 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
              />
              <TabButton 
                tab="background" 
                label="Background" 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" /></svg>}
              />
              <TabButton 
                tab="text" 
                label="Text & Content" 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
              />
              <TabButton 
                tab="buttons" 
                label="Buttons & UI" 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>}
              />
              <TabButton 
                tab="effects" 
                label="Effects" 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Theme Presets</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(presetThemes).map(([name, preset]) => (
                    <div key={name} className="relative">
                      <div 
                        className="p-4 rounded-xl border border-gray-600 cursor-pointer transition-all hover:border-blue-500 group"
                        onClick={() => applyPreset(name)}
                        style={{
                          background: `linear-gradient(135deg, ${preset.backgroundColors.primary}, ${preset.backgroundColors.secondary}, ${preset.backgroundColors.accent})`
                        }}
                      >
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                          <h3 className="font-semibold text-white text-lg mb-2">{preset.welcomeText}</h3>
                          <p className="text-white/70 text-sm mb-3">{preset.subtitleText}</p>
                          <button 
                            className={`px-4 py-2 text-white text-sm font-medium transition-transform group-hover:scale-105 ${
                              preset.buttonStyle === 'square' ? 'rounded-md' :
                              preset.buttonStyle === 'pill' ? 'rounded-full' : 'rounded-lg'
                            }`}
                            style={{ 
                              background: `linear-gradient(135deg, ${preset.backgroundColors.secondary}, ${preset.backgroundColors.accent})`
                            }}
                          >
                            {preset.getStartedButtonText}
                          </button>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Background Tab */}
            {activeTab === 'background' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Background Settings</h2>
                
                {/* Background Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Background Type</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'gradient', label: 'Gradient' },
                      { value: 'solid', label: 'Solid Color' },
                      { value: 'animated', label: 'Animated' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateSettings({ backgroundType: value as 'gradient' | 'solid' | 'animated' })}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          settings.backgroundType === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Scheme */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Color Scheme</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'auto', label: 'Auto' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateSettings({ colorScheme: value as 'light' | 'dark' | 'auto' })}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          settings.colorScheme === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Colors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ColorPicker
                    label="Primary Color"
                    value={settings.backgroundColors.primary}
                    onChange={(color) => updateSettings({ 
                      backgroundColors: { ...settings.backgroundColors, primary: color }
                    })}
                  />
                  <ColorPicker
                    label="Secondary Color"
                    value={settings.backgroundColors.secondary}
                    onChange={(color) => updateSettings({ 
                      backgroundColors: { ...settings.backgroundColors, secondary: color }
                    })}
                  />
                  <ColorPicker
                    label="Accent Color"
                    value={settings.backgroundColors.accent}
                    onChange={(color) => updateSettings({ 
                      backgroundColors: { ...settings.backgroundColors, accent: color }
                    })}
                  />
                </div>

                {/* Preview */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Preview</label>
                  <div 
                    className="h-32 rounded-xl border border-gray-600"
                    style={{
                      background: settings.backgroundType === 'solid'
                        ? settings.backgroundColors.primary
                        : `linear-gradient(135deg, ${settings.backgroundColors.primary}, ${settings.backgroundColors.secondary}, ${settings.backgroundColors.accent})`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Text Tab */}
            {activeTab === 'text' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Text & Content</h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Welcome Text</label>
                    <input
                      type="text"
                      value={settings.welcomeText}
                      onChange={(e) => updateSettings({ welcomeText: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Welcome"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle Text</label>
                    <textarea
                      value={settings.subtitleText}
                      onChange={(e) => updateSettings({ subtitleText: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      rows={3}
                      placeholder="You've successfully signed in to your dashboard"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Get Started Button Text</label>
                    <input
                      type="text"
                      value={settings.getStartedButtonText}
                      onChange={(e) => updateSettings({ getStartedButtonText: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Get Started"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Buttons Tab */}
            {activeTab === 'buttons' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Buttons & UI Elements</h2>
                
                {/* Button Style */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Button Style</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'rounded', label: 'Rounded' },
                      { value: 'square', label: 'Square' },
                      { value: 'pill', label: 'Pill' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateSettings({ buttonStyle: value as 'rounded' | 'square' | 'pill' })}
                        className={`px-6 py-3 font-medium transition-all ${
                          value === 'square' ? 'rounded-md' :
                          value === 'pill' ? 'rounded-full' : 'rounded-lg'
                        } ${
                          settings.buttonStyle === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Size */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Button Size</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'sm', label: 'Small' },
                      { value: 'md', label: 'Medium' },
                      { value: 'lg', label: 'Large' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateSettings({ buttonSize: value as 'sm' | 'md' | 'lg' })}
                        className={`font-medium transition-all rounded-lg ${
                          value === 'sm' ? 'px-3 py-2 text-sm' :
                          value === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3'
                        } ${
                          settings.buttonSize === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Animation */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Button Animation</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'none', label: 'None' },
                      { value: 'hover-grow', label: 'Hover Grow' },
                      { value: 'hover-glow', label: 'Hover Glow' },
                      { value: 'pulse', label: 'Pulse' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateSettings({ buttonAnimation: value as 'none' | 'hover-grow' | 'hover-glow' | 'pulse' })}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                          value === 'hover-grow' ? 'hover:scale-105' :
                          value === 'hover-glow' ? 'hover:shadow-lg hover:shadow-blue-500/25' :
                          value === 'pulse' ? 'animate-pulse' : ''
                        } ${
                          settings.buttonAnimation === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Visual Effects</h2>
                
                <div className="space-y-6">
                  {/* Animations Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Enable Animations</h3>
                      <p className="text-sm text-gray-400">Turn on/off all animated elements</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.animationsEnabled ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.animationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Glow Effects Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Glow Effects</h3>
                      <p className="text-sm text-gray-400">Add glowing effects to elements</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ glowEffects: !settings.glowEffects })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.glowEffects ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.glowEffects ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Particle Effects Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Particle Effects</h3>
                      <p className="text-sm text-gray-400">Show floating particles and sparkles</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ particleEffects: !settings.particleEffects })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.particleEffects ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.particleEffects ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}