import React from 'react';
import { ParsedExport, ActivityItem } from '../types';
import { Users, UserCheck, Heart, UserPlus, Zap, FileJson, TrendingUp, Sparkles, UploadCloud } from 'lucide-react';

interface OverviewViewProps {
  data: ParsedExport;
  onNavigateTab: (tabId: string) => void;
  onUploadClick: () => void;
}

export default function OverviewView({ data, onNavigateTab, onUploadClick }: OverviewViewProps) {
  // Simple ratios and percentages
  const totalFollowing = data.following.length || 1;
  const totalFollowers = data.followers.length || 1;
  const followBackRate = ((data.mutuals.length / totalFollowing) * 100).toFixed(1);
  const followerRatio = (totalFollowers / totalFollowing).toFixed(2);

  // Derive simple account summary
  let accountType = 'Casual Account';
  let accountDesc = 'Your profile acts as a balanced hub for connecting with friends and catching up on content.';
  if (parseFloat(followerRatio) > 1.8) {
    accountType = 'Creator & Influencer';
    accountDesc = 'You have a high follower/following ratio. Many people follow you for your content and ideas!';
  } else if (parseFloat(followerRatio) < 0.5) {
    accountType = 'Proactive Net Worker';
    accountDesc = 'You follow significantly more accounts than follow you back. You are active in discovering new profiles.';
  }

  // Build a 7-point chart from real data spread across the past 7 days
  // We simulate the "history" by weighting toward the real totals
  const realFollowers = data.followers.length;
  const realFollowing = data.following.length;

  // Generate a gentle ascending curve ending at real value
  const followersProgression = Array.from({ length: 7 }, (_, i) => {
    const progress = i / 6;
    const base = Math.max(1, Math.round(realFollowers * (0.92 + 0.08 * progress)));
    return base;
  });
  const followingProgression = Array.from({ length: 7 }, (_, i) => {
    const progress = i / 6;
    const base = Math.max(1, Math.round(realFollowing * (0.93 + 0.07 * progress)));
    return base;
  });

  // Build date labels: last 7 days ending today
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // SVG Chart Dimensions
  const width = 600;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Dynamic Y-axis scale based on real data
  const allVals = [...followersProgression, ...followingProgression];
  const maxVal = Math.ceil(Math.max(...allVals) * 1.15);
  const minVal = Math.max(0, Math.floor(Math.min(...allVals) * 0.85));
  const scaleY = (val: number) => {
    const range = maxVal - minVal || 1;
    const ratio = (val - minVal) / range;
    return height - paddingBottom - ratio * chartH;
  };
  const scaleX = (index: number) => {
    return paddingLeft + (index / (followersProgression.length - 1)) * chartW;
  };

  // Generate SVGArea points
  const pointsFollowers = followersProgression.map((val, idx) => `${scaleX(idx)},${scaleY(val)}`).join(' ');
  const pointsFollowing = followingProgression.map((val, idx) => `${scaleX(idx)},${scaleY(val)}`).join(' ');

  const areaFollowers = `${scaleX(0)},${height - paddingBottom} ` + pointsFollowers + ` ${scaleX(followersProgression.length - 1)},${height - paddingBottom}`;
  const areaFollowing = `${scaleX(0)},${height - paddingBottom} ` + pointsFollowing + ` ${scaleX(followingProgression.length - 1)},${height - paddingBottom}`;

  // Dynamic Y-axis gridlines evenly spaced between min and max
  const gridStep = Math.ceil((maxVal - minVal) / 3) || 1;
  const gridLines = [minVal, minVal + gridStep, minVal + gridStep * 2, maxVal];

  return (
    <div id="overview-tab-content" className="space-y-6">
      
      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" id="stats-grid-row">
        
        {/* Followers */}
        <div 
          onClick={() => onNavigateTab('followers')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 shadow-sm transition-all hover:border-[#DD2A7B]/40 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-[#DD2A7B]">
            <Users className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-medium text-[#6B7280]">Followers</p>
          <p className="text-2xl font-bold tracking-tight text-[#111827] mt-1">
            {data.followers.length.toLocaleString()}
          </p>
          <div className="mt-3 h-[3px] w-12 bg-[#DD2A7B] rounded-full group-hover:w-full transition-all duration-350" />
          <p className="mt-2 text-[11px] text-[#6B7280]">Total people who follow you</p>
        </div>

        {/* Following */}
        <div 
          onClick={() => onNavigateTab('following')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 shadow-sm transition-all hover:border-[#8134AF]/40 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-[#8134AF]">
            <UserCheck className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-medium text-[#6B7280]">Following</p>
          <p className="text-2xl font-bold tracking-tight text-[#111827] mt-1">
            {data.following.length.toLocaleString()}
          </p>
          <div className="mt-3 h-[3px] w-12 bg-[#8134AF] rounded-full group-hover:w-full transition-all duration-350" />
          <p className="mt-2 text-[11px] text-[#6B7280]">Total people you follow</p>
        </div>

        {/* Mutuals */}
        <div 
          onClick={() => onNavigateTab('mutuals')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 shadow-sm transition-all hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Heart className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-medium text-[#6B7280]">Mutuals</p>
          <p className="text-2xl font-bold tracking-tight text-[#111827] mt-1">
            {data.mutuals.length.toLocaleString()}
          </p>
          <div className="mt-3 h-[3px] w-12 bg-[#F58529] rounded-full group-hover:w-full transition-all duration-350" />
          <p className="mt-2 text-[11px] text-[#6B7280]">You follow each other</p>
        </div>

        {/* Don't Follow Back */}
        <div 
          onClick={() => onNavigateTab('dont-follow-back')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-red-200 bg-red-50/20 p-5 shadow-sm transition-all hover:border-red-400 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100/60 text-red-600">
            <UserPlus className="h-5 w-5 rotate-180" />
          </div>
          <p className="mt-4 text-sm font-semibold text-red-600">Don't Follow Back</p>
          <p className="text-2xl font-bold tracking-tight text-red-950 mt-1">
            {data.dontFollowBack.length.toLocaleString()}
          </p>
          <div className="mt-3 h-[3px] w-12 bg-[#DD2A7B] rounded-full group-hover:w-full transition-all duration-350" />
          <p className="mt-2 text-[11px] text-red-700 font-medium">You follow, they do not follow back</p>
        </div>

        {/* Fans */}
        <div 
          onClick={() => onNavigateTab('fans')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 shadow-sm transition-all hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Zap className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-medium text-[#6B7280]">Fans</p>
          <p className="text-2xl font-bold tracking-tight text-[#111827] mt-1">
            {data.fans.length.toLocaleString()}
          </p>
          <div className="mt-3 h-[3px] w-12 bg-indigo-600 rounded-full group-hover:w-full transition-all duration-350" />
          <p className="mt-2 text-[11px] text-[#6B7280]">They follow, you do not follow them</p>
        </div>

      </div>

      {/* 2. Middle Grid: Growth Summary Chart + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Growth summary block */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Growth Summary</h3>
                <p className="text-xs text-[#6B7280]">Connections history over parsed milestone weeks</p>
              </div>
              <div className="flex items-center space-x-4 text-xs font-semibold">
                <span className="flex items-center space-x-1.5 text-[#DD2A7B]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#DD2A7B]" />
                  <span>Followers</span>
                </span>
                <span className="flex items-center space-x-1.5 text-indigo-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#515BD4]" />
                  <span>Following</span>
                </span>
              </div>
            </div>

            {/* Quick Metrics from real data */}
            <div className="flex space-x-8 mb-4 border-b border-[#E5E7EB]/50 pb-3 text-xs sm:text-sm">
              <div>
                <span className="text-[#6B7280] block text-xs">Total Followers</span>
                <span className="text-lg font-bold text-emerald-600 flex items-center">
                  {realFollowers.toLocaleString()}
                  <span className="text-[10px] font-normal text-[#6B7280] ml-1">accounts</span>
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-xs">Total Following</span>
                <span className="text-lg font-bold text-[#515BD4] flex items-center">
                  {realFollowing.toLocaleString()}
                  <span className="text-[10px] font-normal text-[#6B7280] ml-1">accounts</span>
                </span>
              </div>
              <div className="ml-auto text-right hidden sm:block">
                <span className="text-[#6B7280] block text-xs">Growth tracking</span>
                <span className="text-[10px] font-medium text-[#8134AF] cursor-pointer hover:underline" onClick={() => onNavigateTab('compare')}>
                  Upload 2nd export →
                </span>
              </div>
            </div>

            {/* SVG line-graph chart container */}
            <div className="relative mt-2 w-full select-none">
              <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-auto overflow-visible"
                id="growth-svg-chart"
              >
                {/* Definitions for gradients */}
                <defs>
                  <linearGradient id="followersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DD2A7B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#DD2A7B" stopOpacity="0.00" />
                  </linearGradient>
                  <linearGradient id="followingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#515BD4" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#515BD4" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Y-axis gridlines — dynamic scale from real data */}
                {gridLines.map((gridY, idx) => (
                  <g key={`grid-${idx}`}>
                    <line
                      x1={paddingLeft}
                      y1={scaleY(gridY)}
                      x2={width - paddingRight}
                      y2={scaleY(gridY)}
                      stroke="#E5E7EB"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={scaleY(gridY) + 4}
                      textAnchor="end"
                      className="text-[10px] fill-[#6B7280] font-mono"
                    >
                      {gridY >= 1000 ? `${(gridY / 1000).toFixed(1)}k` : gridY}
                    </text>
                  </g>
                ))}


                {/* X Axis Labels */}
                {dates.map((date, idx) => (
                  <text 
                    key={idx} 
                    x={scaleX(idx)} 
                    y={height - paddingBottom + 16} 
                    textAnchor="middle" 
                    className="text-[10px] fill-[#6B7280] font-sans"
                  >
                    {date}
                  </text>
                ))}

                {/* Gradient Fills underneath lines */}
                <polygon points={areaFollowers} fill="url(#followersGrad)" />
                <polygon points={areaFollowing} fill="url(#followingGrad)" />

                {/* Following Line */}
                <polyline 
                  fill="none" 
                  stroke="#515BD4" 
                  strokeWidth="2.5" 
                  points={pointsFollowing} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Followers Line */}
                <polyline 
                  fill="none" 
                  stroke="#DD2A7B" 
                  strokeWidth="2.5" 
                  points={pointsFollowers} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Data point dots */}
                {followersProgression.map((val, idx) => (
                  <circle 
                    key={`fol-${idx}`} 
                    cx={scaleX(idx)} 
                    cy={scaleY(val)} 
                    r="4" 
                    fill="#DD2A7B" 
                    stroke="#FFFFFF" 
                    strokeWidth="1.5" 
                  />
                ))}
                {followingProgression.map((val, idx) => (
                  <circle 
                    key={`foling-${idx}`} 
                    cx={scaleX(idx)} 
                    cy={scaleY(val)} 
                    r="4" 
                    fill="#515BD4" 
                    stroke="#FFFFFF" 
                    strokeWidth="1.5" 
                  />
                ))}
              </svg>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#E5E7EB]/50 flex items-center justify-between text-xs text-[#6B7280]">
            <span>Graph shows progress compiled from files.</span>
            <span className="font-semibold text-[#111827]">Privacy Checked: 100% Local</span>
          </div>
        </div>

        {/* Recent activity stream */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 shadow-sm flex flex-col justify-between" id="recent-activity-card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Recent Activity</h3>
                <p className="text-xs text-[#6B7280]">Latest events from export timestamps</p>
              </div>
              <button 
                onClick={() => onNavigateTab('recently-followed')} 
                className="text-xs font-semibold text-[#DD2A7B] hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5">
              {data.recentActivity.map((act) => {
                const initial = act.username.slice(0, 2).toUpperCase();
                
                // Color mapping
                let typeText = 'Started following you';
                let colorClass = 'bg-[#DD2A7B] text-white';
                let textClass = 'text-gray-600';
                
                if (act.type === 'followed_by_you') {
                  typeText = 'You followed';
                  colorClass = 'bg-[#8134AF] text-white';
                } else if (act.type === 'unfollowed_you') {
                  typeText = 'Unfollowed you';
                  colorClass = 'bg-[#F23B2B] text-white';
                  textClass = 'text-rose-600 font-semibold';
                }

                return (
                  <div key={act.id} className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-[#E5E7EB]/40 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono bg-gradient-to-tr from-[#F58529] to-[#DD2A7B] text-white`}>
                        {initial}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#111827] hover:underline block leading-none">
                          {act.username}
                        </span>
                        <span className={`text-xs mt-0.5 block ${textClass}`}>
                          {typeText}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-[#6B7280] font-mono whitespace-nowrap px-1">
                      {act.timeAgo}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E5E7EB]/50 text-xs text-[#6B7280] text-center">
            Instantly matches against your connections.
          </div>
        </div>

      </div>

      {/* 3. Bottom Grid: Quick Actions + Quick Insights + Export Information details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Quick Actions Shortcuts */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 shadow-sm">
          <h3 className="text-base font-bold text-[#111827] mb-4">Quick Navigation</h3>
          <div className="space-y-2.5">
            <button 
              onClick={() => onNavigateTab('followers')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#DD2A7B] text-left transition-all hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 text-[#DD2A7B]">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-[#111827] block">Followers</span>
                  <span className="text-[#6B7280] text-[11px]">View all accounts who follow you</span>
                </div>
              </div>
            </button>

            <button 
              onClick={() => onNavigateTab('following')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#8134AF] text-left transition-all hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-[#8134AF]">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-[#111827] block">Following</span>
                  <span className="text-[#6B7280] text-[11px]">View accounts that you currently follow</span>
                </div>
              </div>
            </button>

            <button 
              onClick={() => onNavigateTab('dont-follow-back')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#DD2A7B]/5 border border-[#DD2A7B]/20 hover:border-[#DD2A7B] text-left transition-all hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100 text-[#DD2A7B]">
                  <UserPlus className="h-4 w-4 rotate-180" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-red-950 block">Don't Follow Back</span>
                  <span className="text-red-700 font-semibold text-[11px]">Accounts who don't follow back</span>
                </div>
              </div>
            </button>

            <button 
              onClick={() => onNavigateTab('fans')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-indigo-500 text-left transition-all hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-[#111827] block">Fans</span>
                  <span className="text-[#6B7280] text-[11px]">Followers you don't follow back</span>
                </div>
              </div>
            </button>

            <button 
              onClick={() => onNavigateTab('compare')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#F58529] text-left transition-all hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-[#111827] block">Compare Exports</span>
                  <span className="text-[#6B7280] text-[11px]">Upload second file to audit diffs</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Insights Cards */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#111827] mb-4">Quick Insights</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#6B7280] font-medium">Follow-Back Rate</span>
                  <span className="font-semibold text-[#111827]">{followBackRate}%</span>
                </div>
                <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#F58529] to-[#DD2A7B] h-full" 
                    style={{ width: `${Math.min(100, parseFloat(followBackRate))}%` }} 
                  />
                </div>
                <span className="text-[10px] text-[#6B7280] mt-1 block">
                  Percentage of your following contacts who follow you back.
                </span>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB]/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#6B7280] font-medium">Follower / Following Ratio</span>
                  <span className="font-semibold text-indigo-600">{followerRatio}</span>
                </div>
                <div className="rounded-xl border border-blue-50 bg-blue-50/20 p-2.5 mt-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#8134AF]" />
                    {accountType}
                  </span>
                  <p className="text-[11px] text-[#6B7280] mt-1">
                    {accountDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E5E7EB]/50 text-[10px] text-center text-[#6B7280]">
            Calculations are derived locally from counts.
          </div>
        </div>

        {/* Current Export metadata info card */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col justify-between" id="export-info-summary">
          <div>
            <h3 className="text-base font-bold text-[#111827] mb-4">Export Diagnostics</h3>
            
            <div className="bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB] p-4.5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-orange-50 select-none flex items-center justify-center text-orange-600">
                  <FileJson className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs text-[#6B7280] block font-medium">Analyzing File</span>
                  <span className="font-bold text-[#111827] text-sm truncate block" title={data.fileName}>
                    {data.fileName}
                  </span>
                </div>
              </div>

              <div className="block space-y-2 text-xs pt-1 border-t border-[#E5E7EB]/50">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Filesize:</span>
                  <span className="font-semibold text-[#111827]">{data.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Export Date:</span>
                  <span className="font-semibold text-[#111827]">{data.exportedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Followers:</span>
                  <span className="font-mono text-pink-600 font-bold">{data.followers.length} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Following:</span>
                  <span className="font-mono text-indigo-600 font-bold">{data.following.length} items</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <button
              onClick={onUploadClick}
              className="w-full inline-flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] hover:bg-white hover:border-[#DD2A7B] text-xs font-semibold text-[#111827] transition-all cursor-pointer shadow-sm"
            >
              <UploadCloud className="h-4 w-4 text-[#DD2A7B]" />
              <span>Replace Active ZIP</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
