import React, { useState, useMemo } from 'react';
import { ParsedExport, ComparisonResult, InstagramUser } from '../types';
import { getComparison, generateMockExport } from '../utils/parser';
import { RefreshCw, FileSymlink, Sparkles, AlertCircle, ArrowRight, UserCheck, PlusCircle, MinusCircle, Search, ExternalLink } from 'lucide-react';

interface CompareViewProps {
  currentExport: ParsedExport;      // This will act as File A (older document)
  onCompareFileSelect: (file: File) => Promise<void>;
  compareData: ParsedExport | null; // This represents File B (newer document)
  onSetCompareActive: (data: ParsedExport) => void;
}

export default function CompareView({ currentExport, onCompareFileSelect, compareData, onSetCompareActive }: CompareViewProps) {
  const [comparing, setComparing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedSubTab, setSelectedSubTab] = useState<'newFollowers' | 'lostFollowers' | 'newFollowing' | 'unfollowed'>('newFollowers');
  const [searchQuery, setSearchQuery] = useState('');

  // Local drag state
  const [dragActive, setDragActive] = useState(false);

  // Computations
  const comparisonResult = useMemo(() => {
    if (!compareData) return null;
    return getComparison(currentExport, compareData);
  }, [currentExport, compareData]);

  // Load interactive mock June data
  const handleLoadMockJune = () => {
    setComparing(true);
    setErrorText('');
    setTimeout(() => {
      try {
        const mockJune = generateMockExport('june');
        onSetCompareActive(mockJune);
      } catch (err) {
        setErrorText('Failed to simulate comparison file.');
      } finally {
        setComparing(false);
      }
    }, 450);
  };

  // Process selected file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await triggerAnalyze(file);
    }
  };

  const triggerAnalyze = async (file: File) => {
    setComparing(true);
    setErrorText('');
    try {
      await onCompareFileSelect(file);
    } catch (err: any) {
      setErrorText(err.message || 'The selected archive could not be parsed. Make sure it is a valid ZIP with connections/ folder.');
    } finally {
      setComparing(false);
    }
  };

  // Drag over handlers
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

  // Filter current active list based on searchQuery
  const activeTabUsers = useMemo(() => {
    if (!comparisonResult) return [];
    return comparisonResult[selectedSubTab] || [];
  }, [comparisonResult, selectedSubTab]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return activeTabUsers;
    const q = searchQuery.toLowerCase();
    return activeTabUsers.filter(u => u.username.toLowerCase().includes(q));
  }, [activeTabUsers, searchQuery]);

  return (
    <div id="compare-tab-view" className="space-y-6">
      
      {/* 1. If NO COMPARISON target is selected yet */}
      {!compareData ? (
        <div className="mx-auto max-w-2xl text-center py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 mx-auto mb-4">
            <RefreshCw className={`h-6 w-6 ${comparing ? 'animate-spin' : ''}`} />
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Compare Connections Changes
          </h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Analyze trends and audit modifications by uploading a second export file. InstaTrace compares them to detect new followings, lost connections, and unfollowers.
          </p>

          {/* Quick Demo Assist */}
          <div className="mt-6 p-4 rounded-2xl border border-blue-100 bg-blue-50/20 text-xs text-blue-800 flex items-center justify-between gap-3 text-left">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4.5 w-4.5 text-[#DD2A7B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">No second file?</span> Simulating a mock subsequent archive (e.g. from June) enables immediate testing of comparisons, with counts matching +34 and -12 connections.
              </div>
            </div>
            <button
              onClick={handleLoadMockJune}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-2 shrink-0 rounded-xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4] text-white font-semibold text-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
              id="btn-simulate-june"
            >
              <span>Load June File</span>
            </button>
          </div>

          {/* Drag & Drop zone for File B */}
          <form 
            onDragEnter={handleDrag} 
            onDragOver={handleDrag} 
            onDragLeave={handleDrag} 
            onDrop={handleDrop}
            className={`mt-8 rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
              dragActive 
                ? 'border-[#DD2A7B] bg-gradient-to-r from-pink-50/10 to-orange-50/10 scale-[1.01]' 
                : 'border-[#E5E7EB] bg-[#FAFAFA] hover:border-black/20'
            }`}
          >
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
              id="compare-file-upload"
            />
            
            <FileSymlink className="mx-auto h-10 w-10 text-[#6B7280] mb-3" />
            <span className="block text-sm font-bold text-[#111827]">
              Upload second Instagram Export ZIP
            </span>
            <span className="block text-xs text-[#6B7280] mt-1.5">
              Must be a connection-only backup .zip to compare against {currentExport.fileName}
            </span>

            <div className="mt-5">
              <label
                htmlFor="compare-file-upload"
                className="inline-flex items-center space-x-1.5 rounded-xl bg-[#111827] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <span>Browse File ZIP</span>
              </label>
            </div>

            {errorText && (
              <div className="mt-4 text-xs font-bold text-rose-600 flex items-center justify-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errorText}</span>
              </div>
            )}
          </form>
        </div>
      ) : (
        
        /* 2. When COMPARISON dataset is active */
        <div className="space-y-6" id="compare-results-dashboard">
          
          {/* Diagnostic top header showing file transitions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB]">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#111827]">
              <span className="bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 font-mono shadow-sm">
                File A: {currentExport.fileName} (Older)
              </span>
              <ArrowRight className="h-4 w-4 text-[#6B7280]" />
              <span className="bg-gradient-to-r from-[#F58529]/10 to-[#DD2A7B]/10 border border-[#DD2A7B]/20 text-rose-950 px-3 py-1.5 rounded-xl text-xs font-bold font-mono shadow-sm">
                File B: {compareData.fileName} (Newer)
              </span>
            </div>

            <button
              onClick={() => onSetCompareActive(null as any)}
              className="mt-3 md:mt-0 inline-flex items-center space-x-1 border border-[#E5E7EB] bg-white text-xs font-semibold px-3 py-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:border-[#111827]/10 transition-all cursor-pointer shadow-sm"
              id="btn-clear-compare"
            >
              <span>Clear comparison</span>
            </button>
          </div>

          {/* KPI Change Diffs layout Row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            
            {/* New Followers */}
            <div 
              onClick={() => setSelectedSubTab('newFollowers')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedSubTab === 'newFollowers' 
                  ? 'border-emerald-500 bg-emerald-50/25 ring-2 ring-emerald-500/10 shadow' 
                  : 'border-[#E5E7EB] bg-[#FAFAFA] hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-2 text-emerald-700">
                <PlusCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-tight">New Followers</span>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-emerald-800 mt-2">
                +{comparisonResult?.newFollowers.length || 0}
              </p>
              <span className="text-[10px] text-[#6B7280] block mt-1.5">Acquired contacts since File A</span>
            </div>

            {/* Lost Followers */}
            <div 
              onClick={() => setSelectedSubTab('lostFollowers')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedSubTab === 'lostFollowers' 
                  ? 'border-rose-500 bg-rose-50/25 ring-2 ring-rose-500/10 shadow' 
                  : 'border-[#E5E7EB] bg-[#FAFAFA] hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-2 text-rose-700">
                <MinusCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-tight">Lost Followers</span>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-rose-600 mt-2">
                -{comparisonResult?.lostFollowers.length || 0}
              </p>
              <span className="text-[10px] text-[#6B7280] block mt-1.5">Unfollowed you since File A</span>
            </div>

            {/* New Following */}
            <div 
              onClick={() => setSelectedSubTab('newFollowing')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedSubTab === 'newFollowing' 
                  ? 'border-indigo-500 bg-indigo-50/25 ring-2 ring-indigo-500/10 shadow' 
                  : 'border-[#E5E7EB] bg-[#FAFAFA] hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-2 text-indigo-700">
                <PlusCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-tight">New Following</span>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-indigo-800 mt-2">
                +{comparisonResult?.newFollowing.length || 0}
              </p>
              <span className="text-[10px] text-[#6B7280] block mt-1.5">Profiles you followed since File A</span>
            </div>

            {/* Unfollowed (Our lost following) */}
            <div 
              onClick={() => setSelectedSubTab('unfollowed')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedSubTab === 'unfollowed' 
                  ? 'border-amber-500 bg-amber-50/25 ring-2 ring-amber-500/10 shadow' 
                  : 'border-[#E5E7EB] bg-[#FAFAFA] hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-2 text-amber-700">
                <MinusCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-tight">Unfollowed</span>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-amber-700 mt-2">
                -{comparisonResult?.unfollowed.length || 0}
              </p>
              <span className="text-[10px] text-[#6B7280] block mt-1.5">Profiles you unfollowed since File A</span>
            </div>

          </div>

          {/* Subtab user checklist table */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
            
            {/* Search + Title bar */}
            <div className="p-4 bg-[#FAFAFA] border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <span className="font-bold text-sm text-[#111827] flex items-center">
                {selectedSubTab === 'newFollowers' && 'New Followers List'}
                {selectedSubTab === 'lostFollowers' && 'Lost Followers List'}
                {selectedSubTab === 'newFollowing' && 'New Following List'}
                {selectedSubTab === 'unfollowed' && 'Unfollowed Accounts List'}
                <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded-full bg-white border font-semibold text-[#6B7280]">
                  {filteredUsers.length} matches
                </span>
              </span>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E5E7EB] bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A7B]"
                  id="compare-search"
                />
              </div>
            </div>

            {/* List representation */}
            {filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-[#6B7280] text-xs">
                No users found matching search terms.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB] max-h-96 overflow-y-auto">
                {filteredUsers.map((user) => {
                  const initial = user.username.slice(0, 2).toUpperCase();
                  return (
                    <div 
                      key={user.username} 
                      className="flex items-center justify-between p-3.5 hover:bg-[#FAFAFA]/40 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 font-bold font-mono text-xs text-[#DD2A7B]">
                          {initial}
                        </div>
                        <span className="text-sm font-bold text-[#111827]">{user.username}</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-[11px] text-[#6B7280] font-mono">{user.dateString}</span>
                        <a
                          href={user.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-0.5 text-xs font-bold text-[#DD2A7B] hover:underline"
                        >
                          <span>Profile</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
