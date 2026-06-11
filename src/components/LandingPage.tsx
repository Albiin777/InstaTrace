import React, { useState } from 'react';
import { Camera, ShieldCheck, Upload, Sparkles, Heart, Users, UserPlus, EyeOff, Calendar, RefreshCw, Download, FileJson } from 'lucide-react';
import HowToGuide from './HowToGuide';

interface LandingPageProps {
  onFileSelect: (file: File) => Promise<void>;
  onLoadDemo: () => void;
}

export default function LandingPage({ onFileSelect, onLoadDemo }: LandingPageProps) {
  const [dragActive, setDragActive] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // File picker handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await triggerAnalyze(file);
    }
  };

  const triggerAnalyze = async (file: File) => {
    setLoading(true);
    setErr('');
    try {
      await onFileSelect(file);
    } catch (error: any) {
      console.error(error);
      setErr(error.message || 'Could not parse this ZIP file. Please confirm it is a valid Instagram JSON Export archive.');
    } finally {
      setLoading(false);
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await triggerAnalyze(file);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans" id="landing-page-root">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Background ambient mesh */}
        <div className="absolute top-0 left-1/2 -z-10 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#F58529]/5 via-[#DD2A7B]/5 to-[#8134AF]/5 opacity-60 blur-3xl" />

        <div className="text-center space-y-5 max-w-3xl mx-auto">
          
          {/* Privacy badge */}
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-sm animate-fade-in mx-auto">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% Private! Data never leaves your device</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111827] leading-none" id="hero-title">
            Understand Your <br />
            <span className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text text-transparent">
              Instagram Connections
            </span>
          </h1>

          <p className="text-base sm:text-md text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Upload your Instagram export ZIP file and discover followers, following, mutuals, unfollowers, fans, and account growth metrics. No login credentials required.
          </p>
        </div>

        {/* UPLOAD CARD AREA */}
        <div className="mt-12 max-w-xl mx-auto" id="upload-card-wrapper">
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-2.5 shadow-xl shadow-pink-50/50">
            
            {/* Inner drag drop zone */}
            <form
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`rounded-[22px] border-2 border-dashed p-8 text-center transition-all ${
                dragActive 
                  ? 'border-[#DD2A7B] bg-pink-50/20' 
                  : 'border-[#E5E7EB] bg-[#FAFAFA] hover:border-black/20'
              }`}
            >
              <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
                id="landing-file-picker"
                disabled={loading}
              />

              <div className="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white mx-auto h-12 w-12 rounded-2xl flex items-center justify-center shadow-md shadow-pink-100">
                <Upload className={`h-5 w-5 ${loading ? 'animate-bounce' : ''}`} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#111827]">
                Drag & drop your Instagram Export file
              </h3>
              <p className="mt-1.5 text-xs text-[#6B7280]">
                Or click browse to select the <span className="font-semibold underline">JSON .zip file</span> from your device.
              </p>

              {/* Supported formats meta */}
              <div className="mt-5 inline-flex items-center space-x-1.5 rounded-lg bg-white px-2.5 py-1 border border-[#E5E7EB] text-[11px] font-semibold text-gray-700">
                <FileJson className="h-3.5 w-3.5 text-orange-500" />
                <span>Format: Instagram JSON Export (.zip)</span>
              </div>

              {/* Browse buttons or Loading */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                
                {loading ? (
                  <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#111827]">
                    <span className="h-4 w-4 rounded-full border-2 border-t-transparent border-[#DD2A7B] animate-spin" />
                    <span>Processing ZIP in browser...</span>
                  </div>
                ) : (
                  <>
                    <label
                      htmlFor="landing-file-picker"
                      className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] px-5 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <span>Choose ZIP Archive</span>
                    </label>

                    <button
                      type="button"
                      onClick={onLoadDemo}
                      className="inline-flex items-center space-x-1.5 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-xs font-bold text-[#111827] shadow-sm hover:bg-[#FAFAFA] hover:border-[#111827]/30 transition-all cursor-pointer w-full sm:w-auto justify-center"
                      id="btn-quick-demo"
                    >
                      <Sparkles className="h-4 w-4 text-[#DD2A7B]" />
                      <span>Instantly Try Demo</span>
                    </button>
                  </>
                )}

              </div>

              {err && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 text-xs font-bold text-rose-600 border border-rose-100 flex items-center justify-center gap-2">
                  <span>⚠️ {err}</span>
                </div>
              )}

            </form>

          </div>
        </div>

      </section>

      {/* 2. FEATURES GRID SECTION */}
      <section className="bg-[#FAFAFA] border-y border-[#E5E7EB] py-20 px-4 sm:px-6 lg:px-8" id="features">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DD2A7B] bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
              Feature Arsenal
            </span>
            <h2 className="text-3xl font-extrabold text-[#111827]">
              Full Connectivity Audit Dials
            </h2>
            <p className="text-sm text-[#6B7280] max-w-xl mx-auto">
              Everything happens locally on your computer with instantaneous load layouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="features-list-grid">
            
            {/* Followers Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#DD2A7B]/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#F58529] to-[#DD2A7B] text-white mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Followers</h3>
              <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                Check and search all profiles who follow you. Sort by newest or oldest connections.
              </p>
            </div>

            {/* Following Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#8134AF]/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#DD2A7B] to-[#8134AF] text-white mb-4">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Following</h3>
              <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                Review every account you are currently following. Keep track of your timeline structure.
              </p>
            </div>

            {/* Mutuals Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-orange-400/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#F58529] to-[#DD2A7B] text-white mb-4">
                <Heart className="h-5 w-5 fill-white" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Mutuals</h3>
              <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                Discover accounts that follow you back and share mutual active interactions.
              </p>
            </div>

            {/* Don't Follow Back Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#DD2A7B]/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#F58529] to-[#DD2A7B] text-white mb-4">
                <UserPlus className="h-5 w-5 rotate-180" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Don't Follow Back</h3>
              <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                Find accounts you follow that don't follow you back. Extremely useful for pruning lists.
              </p>
            </div>

            {/* Fans Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#8134AF]/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <EyeOff className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Fans</h3>
              <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                Track accounts who follow you but you haven't followed back yet.
              </p>
            </div>

            {/* Recently Followed Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-amber-400/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Recently Followed</h3>
              <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                Audit newly followed accounts across weeks, days or months with timeline filters.
              </p>
            </div>

            {/* Compare Exports Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-emerald-400/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-650 mb-4">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Compare Exports</h3>
              <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                Compare multiple exported zip histories to locate new followers or unfollowers over time.
              </p>
            </div>

            {/* Export CSV Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-neutral-400/40 transition-all shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 mb-4">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Export CSV</h3>
              <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                Convert your lists to portable CSV documents for spreadsheets or third-party analysis.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. STEP BY STEP GUIDE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="how-it-works">
        <HowToGuide />
      </section>

      {/* 4. PRIVACY SECTION DETAILS */}
      <section id="privacy" className="bg-[#FAFAFA] border-y border-[#E5E7EB] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="h-14 w-14 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-pink-100">
            <ShieldCheck className="h-8 w-8" />
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
            Privacy by Design
          </h2>
          
          <div className="text-sm sm:text-base text-[#6B7280] max-w-2xl mx-auto leading-relaxed space-y-4">
            <p>
              Your Instagram export is processed entirely in your browser. InstaTrace does not upload, store, or access your data at any point.
            </p>
            <p>
              No Instagram login is required, and we never ask for your password. From extracting the ZIP file to generating insights about your followers and following, every step happens locally on your device.
            </p>
          </div>

          <div className="pt-6 border-t border-[#E5E7EB] flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-xs text-[#6B7280] font-mono">
            <span>🛡️ No Database</span>
            <span>🛡️ No Web API logging</span>
            <span>🛡️ Local Storage Only</span>
          </div>
        </div>
      </section>

    </div>
  );
}
