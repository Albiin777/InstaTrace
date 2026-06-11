import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import OverviewView from './components/OverviewView';
import DataListView from './components/DataListView';
import CompareView from './components/CompareView';
import { ParsedExport } from './types';
import { parseInstagramZip, generateMockExport } from './utils/parser';
import {
  Users, UserCheck, Heart, UserPlus, Zap, Calendar, RefreshCw,
  Settings, Info, Download, ShieldCheck, X, ChevronRight, Menu, Camera
} from 'lucide-react';

export default function App() {
  const [currentExport, setCurrentExport] = useState<ParsedExport | null>(null);
  const [compareData, setCompareData] = useState<ParsedExport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'followers' | 'following' | 'mutuals' | 'dont-follow-back' | 'fans' | 'recently-followed' | 'compare'>('overview');

  // Mobile drawer state
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Smooth scroll logic on landing page
  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: sectionId === 'upload-card-wrapper' ? 'center' : 'start'
      });
    }
  };

  // Upload and parse first main export ZIP file
  const handleMainFileSelect = async (file: File): Promise<void> => {
    try {
      const parsed = await parseInstagramZip(file);
      if (parsed.followers.length === 0 && parsed.following.length === 0) {
        throw new Error("No connections or relationship details found in this ZIP archive. Make sure you exported connections in JSON format.");
      }
      setCurrentExport(parsed);
      setCompareData(null); // Reset prev compare
      setActiveTab('overview');
    } catch (err: any) {
      throw new Error(err.message || "Failed to process the ZIP archive.");
    }
  };

  // Upload and parse second comparison export ZIP file
  const handleCompareFileSelect = async (file: File): Promise<void> => {
    try {
      const parsed = await parseInstagramZip(file);
      if (parsed.followers.length === 0 && parsed.following.length === 0) {
        throw new Error("No connections or relationship details found on this ZIP archive.");
      }
      setCompareData(parsed);
    } catch (err: any) {
      throw new Error(err.message || "Failed to process the comparison archive.");
    }
  };

  // Instant trigger to load mock datasets (May & June)
  const handleLoadDemoArchive = () => {
    const mayMockData = generateMockExport('may');
    setCurrentExport(mayMockData);
    setCompareData(null); // reset compare
    setActiveTab('overview');
  };

  // Reset everything back to home
  const handleReset = () => {
    setCurrentExport(null);
    setCompareData(null);
    setActiveTab('overview');
    setShowMoreDrawer(false);
  };

  // Trigger click from overview or tab shortcuts
  const handleTriggerUploadPicker = () => {
    // Look for file picker either on navbar or landing and trigger it
    const inputEl = document.getElementById('landing-file-picker') || document.getElementById('compare-file-upload');
    if (inputEl) {
      inputEl.click();
    } else {
      // fallback
      handleReset();
    }
  };

  const currentTabName = () => {
    switch (activeTab) {
      case 'overview': return 'Overview';
      case 'followers': return 'Followers';
      case 'following': return 'Following';
      case 'mutuals': return 'Mutuals';
      case 'dont-follow-back': return "Don't Follow Back";
      case 'fans': return 'Fans';
      case 'recently-followed': return 'Recently Followed';
      case 'compare': return 'Compare';
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] flex flex-col antialiased">

      {/* 1. Header/Navbar */}
      <Navbar
        onUploadClick={handleTriggerUploadPicker}
        hasExport={!!currentExport}
        onReset={handleReset}
        onNavigateSection={handleNavigateSection}
      />

      {/* 2. Main Body rendering */}
      {!currentExport ? (
        <main className="flex-1">
          <LandingPage
            onFileSelect={handleMainFileSelect}
            onLoadDemo={handleLoadDemoArchive}
          />
        </main>
      ) : (

        /* 3. DASHBOARD MAIN VIEWPORT */
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8">

          {/* Header block for current archive name */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] pb-4 gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111827]">
                Dashboard {currentTabName() !== 'Overview' && ` • ${currentTabName()}`}
              </h1>
              <p className="text-xs sm:text-sm text-[#6B7280]">
                Currently auditing <span className="font-semibold text-[#111827]">{currentExport.fileName}</span> (Exported {currentExport.exportedAt})
              </p>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 self-start sm:self-center">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Browsing safely offline</span>
            </div>
          </div>

          {/* Desktop Top Tab Navigation buttons */}
          <div className="hidden lg:block mb-8">
            <nav className="flex space-x-1.5 bg-[#FAFAFA] p-1.5 rounded-2xl border border-[#E5E7EB]">

              {/* Overview */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'overview'
                  ? 'bg-white text-[#111827] shadow'
                  : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                id="tab-overview"
              >
                Overview
              </button>

              {/* Followers */}
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'followers'
                  ? 'bg-white text-[#111827] shadow'
                  : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                id="tab-followers"
              >
                Followers ({currentExport.followers.length})
              </button>

              {/* Following */}
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'following'
                  ? 'bg-white text-[#111827] shadow'
                  : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                id="tab-following"
              >
                Following ({currentExport.following.length})
              </button>

              {/* Mutuals */}
              <button
                onClick={() => setActiveTab('mutuals')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'mutuals'
                  ? 'bg-white text-[#111827] shadow'
                  : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                id="tab-mutuals"
              >
                Mutuals ({currentExport.mutuals.length})
              </button>

              {/* Don't Follow Back */}
              <button
                onClick={() => setActiveTab('dont-follow-back')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'dont-follow-back'
                  ? 'bg-[#DD2A7B]/10 text-rose-950 font-extrabold shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                id="tab-dontfollow"
              >
                Don't Follow Back ({currentExport.dontFollowBack.length})
              </button>

              {/* Fans */}
              <button
                onClick={() => setActiveTab('fans')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'fans'
                  ? 'bg-white text-[#111827] shadow'
                  : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                id="tab-fans"
              >
                Fans ({currentExport.fans.length})
              </button>

              {/* Recently Followed */}
              <button
                onClick={() => setActiveTab('recently-followed')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'recently-followed'
                  ? 'bg-white text-[#111827] shadow'
                  : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                id="tab-recent"
              >
                Recently Followed
              </button>

              {/* Compare */}
              <button
                onClick={() => setActiveTab('compare')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'compare'
                  ? 'bg-white text-[#111827] shadow'
                  : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                id="tab-compare"
              >
                Compare {compareData ? '✓' : ''}
              </button>

            </nav>
          </div>

          {/* Render Active View Tab */}
          <main className="min-h-[50vh]">
            {activeTab === 'overview' && (
              <OverviewView
                data={currentExport}
                onNavigateTab={(tab) => {
                  setActiveTab(tab as any);
                  setShowMoreDrawer(false);
                }}
                onUploadClick={handleTriggerUploadPicker}
              />
            )}

            {activeTab === 'followers' && (
              <DataListView
                type="followers"
                users={currentExport.followers}
              />
            )}

            {activeTab === 'following' && (
              <DataListView
                type="following"
                users={currentExport.following}
              />
            )}

            {activeTab === 'mutuals' && (
              <DataListView
                type="mutuals"
                users={currentExport.mutuals}
              />
            )}

            {activeTab === 'dont-follow-back' && (
              <DataListView
                type="dont-follow-back"
                users={currentExport.dontFollowBack}
              />
            )}

            {activeTab === 'fans' && (
              <DataListView
                type="fans"
                users={currentExport.fans}
              />
            )}

            {activeTab === 'recently-followed' && (
              <DataListView
                type="recently-followed"
                users={currentExport.followers} // Can analyze followers as representative connections
              />
            )}

            {activeTab === 'compare' && (
              <CompareView
                currentExport={currentExport}
                onCompareFileSelect={handleCompareFileSelect}
                compareData={compareData}
                onSetCompareActive={setCompareData}
              />
            )}
          </main>

        </div>
      )}

      {/* 4. MOBILE BOTTOM DOCK NAVIGATION (Strictly matching phone screen wireframe!) */}
      {currentExport && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] shadow-lg px-4 py-2 flex items-center justify-between">

          {/* Overview Tab Button */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              setShowMoreDrawer(false);
            }}
            className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'overview' ? 'text-[#DD2A7B]' : 'text-[#6B7280]'
              } cursor-pointer`}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-0.5 mt-1">Overview</span>
          </button>

          {/* Followers Tab Button */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('followers');
              setShowMoreDrawer(false);
            }}
            className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'followers' ? 'text-[#DD2A7B]' : 'text-[#6B7280]'
              } cursor-pointer`}
          >
            <Heart className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-0.5 mt-1">Followers</span>
          </button>

          {/* Following Tab Button */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('following');
              setShowMoreDrawer(false);
            }}
            className={`flex flex-col items-center flex-1 py-1 ${activeTab === 'following' ? 'text-[#DD2A7B]' : 'text-[#6B7280]'
              } cursor-pointer`}
          >
            <UserCheck className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-0.5 mt-1">Following</span>
          </button>

          {/* "More" Trigger for drawer overlay */}
          <button
            type="button"
            onClick={() => setShowMoreDrawer(true)}
            className={`flex flex-col items-center flex-1 py-1 ${showMoreDrawer || !['overview', 'followers', 'following'].includes(activeTab)
              ? 'text-[#DD2A7B]'
              : 'text-[#6B7280]'
              } cursor-pointer`}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-0.5 mt-1">More</span>
          </button>

        </div>
      )}

      {/* 5. "MORE" BOTTOM DRAWER MODAL OVERLAY FOR MOBILE SCREEN WIREFRAME */}
      {showMoreDrawer && currentExport && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-xs flex items-end animate-fade-in">
          {/* Overlay dismissal clickable area */}
          <div className="absolute inset-0" onClick={() => setShowMoreDrawer(false)} />

          {/* Drawer sheet box */}
          <div className="relative w-full bg-white rounded-t-3xl border-t border-[#E5E7EB] p-6 space-y-6 max-h-[85vh] overflow-y-auto z-10 shadow-2xl animate-slide-up">

            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Connections Tools</h3>
                <p className="text-[11px] text-[#6B7280]">Select subpage connections filter</p>
              </div>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="h-8 w-8 rounded-full bg-[#FAFAFA] flex items-center justify-center border border-[#E5E7EB] text-[#6B7280]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav Grid lists */}
            <div className="space-y-2">

              {/* Mutuals */}
              <button
                onClick={() => {
                  setActiveTab('mutuals');
                  setShowMoreDrawer(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${activeTab === 'mutuals' ? 'bg-orange-50/40 border-orange-200' : 'bg-white border-[#E5E7EB]'
                  }`}
              >
                <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold">
                  <div className="h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <Heart className="h-4 w-4 fill-orange-600" />
                  </div>
                  <div>
                    <span className="block text-[#111827]">Mutuals</span>
                    <span className="text-[10px] text-[#6B7280] font-normal">You follow each other</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-xs font-bold text-[#6B7280]">({currentExport.mutuals.length})</span>
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </div>
              </button>

              {/* Don't Follow Back (Most requested) */}
              <button
                onClick={() => {
                  setActiveTab('dont-follow-back');
                  setShowMoreDrawer(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${activeTab === 'dont-follow-back' ? 'bg-rose-50/50 border-rose-200 shadow-sm' : 'bg-red-50/20 border-red-100'
                  }`}
              >
                <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold">
                  <div className="h-7 w-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                    <UserPlus className="h-4 w-4 rotate-180" />
                  </div>
                  <div>
                    <span className="block text-red-950 font-bold">Don't Follow Back</span>
                    <span className="text-[10px] text-red-700 font-medium">Accounts who don't follow back</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-xs font-bold text-red-700">({currentExport.dontFollowBack.length})</span>
                  <ChevronRight className="h-4 w-4 text-red-400" />
                </div>
              </button>

              {/* Fans */}
              <button
                onClick={() => {
                  setActiveTab('fans');
                  setShowMoreDrawer(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${activeTab === 'fans' ? 'bg-indigo-50/40 border-indigo-200' : 'bg-white border-[#E5E7EB]'
                  }`}
              >
                <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold">
                  <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-650">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[#111827]">Fans</span>
                    <span className="text-[10px] text-[#6B7280] font-normal">They follow, you don't follow</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-xs font-bold text-[#6B7280]">({currentExport.fans.length})</span>
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </div>
              </button>

              {/* Recently Followed */}
              <button
                onClick={() => {
                  setActiveTab('recently-followed');
                  setShowMoreDrawer(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${activeTab === 'recently-followed' ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-[#E5E7EB]'
                  }`}
              >
                <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[#111827]">Recently Followed</span>
                    <span className="text-[10px] text-[#6B7280] font-normal">Auditing latest connection timelines</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </div>
              </button>

              {/* Compare exports */}
              <button
                onClick={() => {
                  setActiveTab('compare');
                  setShowMoreDrawer(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${activeTab === 'compare' ? 'bg-pink-50/40 border-pink-200' : 'bg-white border-[#E5E7EB]'
                  }`}
              >
                <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold">
                  <div className="h-7 w-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[#111827]">Compare Exports</span>
                    <span className="text-[10px] text-[#6B7280] font-normal">Compare against second backup ZIP</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  {compareData && <span className="text-xs text-emerald-600 font-semibold">Loaded</span>}
                  <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                </div>
              </button>

            </div>

            {/* Settings & Info toggle blocks */}
            <div className="border-t border-[#E5E7EB] pt-4 flex items-center justify-between gap-3 text-xs">
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                }}
                className="flex items-center space-x-1.5 text-[#6B7280] hover:text-[#111827] cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                <span>Settings Preferences</span>
              </button>

              <button
                onClick={() => {
                  handleReset();
                }}
                className="text-rose-600 font-semibold cursor-pointer"
              >
                Unload Export
              </button>
            </div>

            {/* Quick settings simulation panel */}
            {showSettings && (
              <div className="p-3 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB] text-[11px] text-[#6B7280] space-y-1.5 animate-fade-in">
                <p className="font-bold text-[#111827]">Settings & Preferences</p>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                  <span>Deduplicate connection identifiers automatically</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#DD2A7B] focus:ring-[#DD2A7B]" />
                  <span>Store session state in browser local cache</span>
                </label>
              </div>
            )}

            <div className="text-center text-[10px] text-[#6B7280]">
              InstaTrace • 100% Secure Local Sandbox
            </div>

          </div>
        </div>
      )}

      {/* 6. GLOBAL FOOTER */}
      <footer className="mt-auto border-t border-[#F2EFE9] bg-[#FDFBF7] text-[#4A3E3D] relative overflow-hidden">
        {/* Soft decorative gradient background blur */}
        <div className="absolute -top-24 -left-20 h-48 w-48 rounded-full bg-[#FF7E5F]/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 h-48 w-48 rounded-full bg-[#FEB47B]/10 blur-2xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">

            {/* Left Column: Brand & Copy */}
            <div className="space-y-6 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-md shadow-pink-100 transition-all hover:rotate-6 hover:scale-105 duration-300">
                  <Camera className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
                    Insta<span className="bg-gradient-to-tr from-[#DD2A7B] via-[#8134AF] to-[#515BD4] bg-clip-text text-transparent">Trace</span>
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xl font-bold leading-snug text-[#2C2520] max-w-xl">
                  A privacy-focused tool for exploring your Instagram connections.
                </p>
                <p className="text-sm leading-relaxed text-[#6B5E5C] max-w-xl">
                  Discover followers, following, mutuals, unfollowers, and account activity from your Instagram export with a clean and intuitive experience.
                </p>
              </div>


            </div>

            {/* Right Column: Card & Legal Disclaimer */}
            <div className="space-y-6 lg:mt-2">
              {/* Unique Philosophy Card */}
              <div className="rounded-3xl border border-[#F2EFE9] bg-white/70 backdrop-blur-xs p-6 shadow-xs hover:shadow-md hover:border-[#FF7E5F]/30 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br from-[#FF7E5F]/5 to-[#FEB47B]/10 blur-xl group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E76F51] mb-2">Our Promise</h3>
                <p className="text-xs font-semibold text-[#4A3E3D] leading-relaxed">
                  "Your data never leaves your device. No cloud storage, no hidden trackers—just immediate connection analysis executed directly inside your web browser."
                </p>
              </div>

              <p className="text-[11px] leading-relaxed text-[#8C7E7C] max-w-lg">
                This project is independent and is not affiliated with, endorsed by, or sponsored by Instagram or Meta Platforms, Inc.
              </p>
            </div>

          </div>

          {/* Bottom attribution row */}
          <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between border-t border-[#F2EFE9] pt-8 mt-12">
            <p className="text-xs text-[#8C7E7C]">
              © {new Date().getFullYear()} InstaTrace. All rights reserved.
            </p>

            <p className="text-xs text-[#6B5E5C] font-medium">
              Created with ❤️ by{' '}
              <a
                href="https://www.albiin.me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text text-transparent hover:opacity-85 transition-opacity"
              >
                Albin
              </a>
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
