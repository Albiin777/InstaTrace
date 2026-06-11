import React from 'react';
import { Camera, Upload, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onUploadClick: () => void;
  hasExport: boolean;
  onReset: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export default function Navbar({ onUploadClick, hasExport, onReset, onNavigateSection }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-none items-center justify-between px-4 sm:px-5 lg:px-10">
        
        {/* Logo */}
        <div 
          onClick={onReset} 
          className="flex cursor-pointer items-center space-x-2.5 transition-transform hover:scale-[1.02]"
          id="navbar-logo"
        >
          <img src="/logo.png" alt="InstaTrace" className="h-10 w-10 rounded-xl object-cover shadow-md shadow-pink-100" />
          <span className="text-2xl sm:xl font-bold tracking-tight text-[#111827]">
            Insta<span className="bg-gradient-to-tr from-[#DD2A7B] via-[#8134AF] to-[#515BD4] bg-clip-text text-transparent">Trace</span>
          </span>
        </div>

        {/* Right-side navigation and CTAs */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {!hasExport ? (
            <>
              <nav className="hidden items-center space-x-5 text-sm font-medium text-[#6B7280] md:flex lg:space-x-7">
                <button 
                  onClick={() => onNavigateSection?.('features')} 
                  className="hover:text-[#111827] hover:underline hover:underline-offset-4 decoration-[#DD2A7B] decoration-2 transition-colors cursor-pointer"
                  id="nav-link-features"
                >
                  Features
                </button>
                <button 
                  onClick={() => onNavigateSection?.('how-it-works')} 
                  className="hover:text-[#111827] hover:underline hover:underline-offset-4 decoration-[#F58529] decoration-2 transition-colors cursor-pointer"
                  id="nav-link-howto"
                >
                  How It Works
                </button>
              </nav>

              <button
                type="button"
                onClick={() => onNavigateSection?.('upload-card-wrapper')}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] px-3.5 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer sm:px-4"
                id="btn-upload-nav"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden leading-none sm:inline">Upload ZIP</span>
                <span className="sm:hidden leading-none">Upload</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-medium text-[#6B7280] shadow-sm hover:bg-[#FAFAFA] transition-all cursor-pointer"
                id="btn-reset-dashboard"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Back Home</span>
              </button>
              
              <button
                type="button"
                onClick={onUploadClick}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer animate-shimmer"
                id="btn-upload-new"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload New</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
