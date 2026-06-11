import React, { useState, useMemo } from 'react';
import { InstagramUser } from '../types';
import { convertToCSV } from '../utils/parser';
import { Search, Download, ExternalLink, ArrowUpDown, ShieldAlert, Heart, EyeOff, Sparkles, Filter, Calendar } from 'lucide-react';

interface DataListViewProps {
  type: 'followers' | 'following' | 'mutuals' | 'dont-follow-back' | 'fans' | 'recently-followed';
  users: InstagramUser[];
  onUploadNew?: () => void;
}

export default function DataListView({ type, users, onUploadNew }: DataListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'latest' | 'oldest' | 'az' | 'za'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const itemsPerPage = 15;

  // Header configs based on dataset key
  const config = useMemo(() => {
    switch (type) {
      case 'followers':
        return {
          title: 'Followers',
          badge: 'You are followed by',
          desc: 'A collection of accounts who follow your profile. You can search, sort, and inspect connections.',
          icon: <Heart className="h-4 w-4 text-emerald-600" />,
          alertBg: 'bg-[#FAFAFA]',
          alertBorder: 'border-[#E5E7EB]',
        };
      case 'following':
        return {
          title: 'Following list',
          badge: 'You follow',
          desc: 'All accounts that you are currently following status. Search and inspect connection timelines.',
          icon: <Sparkles className="h-4 w-4 text-[#8134AF]" />,
          alertBg: 'bg-[#FAFAFA]',
          alertBorder: 'border-[#E5E7EB]',
        };
      case 'mutuals':
        return {
          title: 'Mutual Followers',
          badge: 'You follow each other',
          desc: 'True mutual connections. These profiles follow you, and you also follow them back.',
          icon: <Heart className="h-4 w-4 fill-[#DD2A7B] text-[#DD2A7B]" />,
          alertBg: 'bg-orange-50/20',
          alertBorder: 'border-orange-100',
        };
      case 'dont-follow-back':
        return {
          title: "Don't Follow Back",
          badge: "FLAGGED: Unbalanced follow status",
          desc: "You follow these accounts, but they DO NOT follow you back. This is often the most critical list for cleanup.",
          icon: <ShieldAlert className="h-4 w-4 text-[#DD2A7B]" />,
          alertBg: 'bg-gradient-to-r from-red-50/50 to-pink-50/30',
          alertBorder: 'border-[#DD2A7B]/30 shadow-sm ring-1 ring-[#DD2A7B]/10',
          highlight: true,
        };
      case 'fans':
        return {
          title: 'Fans & Quiet Followings',
          badge: 'They follow you, you don\'t follow back',
          desc: "Accounts that currently follow your content, but you do not follow them in return.",
          icon: <EyeOff className="h-4 w-4 text-indigo-600" />,
          alertBg: 'bg-[#FAFAFA]',
          alertBorder: 'border-[#E5E7EB]',
        };
      case 'recently-followed':
        return {
          title: 'Recently Followed Accounts',
          badge: 'Connection Timeline',
          desc: 'Timeline of accounts you have recently made connections with, sorted by follow date.',
          icon: <Calendar className="h-4 w-4 text-amber-600" />,
          alertBg: 'bg-amber-50/20',
          alertBorder: 'border-amber-100',
        };
    }
  }, [type]);

  // Determine filtering for "Recently Followed" timeframe
  const filteredTimelineUsers = useMemo(() => {
    if (type !== 'recently-followed' || timeFilter === 'all') {
      return users;
    }

    const now = Date.now() / 1000; // unix in seconds
    const SECONDS_IN_DAY = 86400;

    return users.filter(user => {
      const diff = now - user.timestamp;
      if (timeFilter === 'today') {
        return diff <= SECONDS_IN_DAY;
      }
      if (timeFilter === 'week') {
        return diff <= SECONDS_IN_DAY * 7;
      }
      if (timeFilter === 'month') {
        return diff <= SECONDS_IN_DAY * 30;
      }
      return true;
    });
  }, [users, type, timeFilter]);

  // Handle Search input
  const searchedUsers = useMemo(() => {
    const list = type === 'recently-followed' ? filteredTimelineUsers : users;
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(u => u.username.toLowerCase().includes(term));
  }, [type, users, filteredTimelineUsers, searchTerm]);

  // Handle Sorting
  const sortedUsers = useMemo(() => {
    const list = [...searchedUsers];
    switch (sortOption) {
      case 'latest':
        return list.sort((a, b) => b.timestamp - a.timestamp);
      case 'oldest':
        return list.sort((a, b) => a.timestamp - b.timestamp);
      case 'az':
        return list.sort((a, b) => a.username.localeCompare(b.username));
      case 'za':
        return list.sort((a, b) => b.username.localeCompare(a.username));
    }
  }, [searchedUsers, sortOption]);

  // Pagination Math
  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage]);

  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  // Trigger Local CSV Download
  const handleCSVDownload = () => {
    const csvContent = convertToCSV(sortedUsers, config.title);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `instatrace_${type}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset pagination on filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption, timeFilter]);

  return (
    <div id={`${type}-panel`} className="space-y-6">

      {/* List Header description container */}
      <div className={`p-6 rounded-3xl border ${config.alertBorder} ${config.alertBg} transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-[11px] font-bold tracking-tight text-[#111827]">
              {config.icon}
              <span className="ml-1 uppercase text-[10px]">{config.badge}</span>
            </span>
            <div className="flex items-baseline space-x-2.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                {config.title}
              </h2>
              <span className="font-mono text-sm font-semibold text-[#6B7280] bg-white px-2 py-0.5 rounded-full border border-[#E5E7EB]">
                {users.length.toLocaleString()} accounts
              </span>
            </div>
            <p className="text-sm text-[#6B7280]">
              {config.desc}
            </p>
          </div>

          <div className="self-start sm:self-center">
            <button
              onClick={handleCSVDownload}
              disabled={totalItems === 0}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-white border border-[#E5E7EB] px-4 py-2.5 text-xs font-bold text-[#111827] shadow-sm hover:border-[#111827]/30 disabled:opacity-40 hover:bg-[#FAFAFA] transition-all cursor-pointer"
              id={`btn-csv-${type}`}
            >
              <Download className="h-4 w-4" />
              <span>Export CSV ({totalItems})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flagship highlight visual banner for Don't Follow Back */}
      {config.highlight && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 flex items-start gap-3">
          <div className="h-5 w-5 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0 mt-0.5 font-bold text-xs select-none">!</div>
          <div className="text-xs text-rose-900">
            <span className="font-bold">Pro Tip:</span> Users typically use this list to unfollow inactive accounts, business pages, or creators who did not reciprocate. Keep in mind some profiles may be celebrities or curated feeds that generally do not follow back.
          </div>
        </div>
      )}

      {/* Search, Filter & Sort Controls Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search by Instagram username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] placeholder-[#6B7280] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD2A7B]/20 focus:border-[#DD2A7B] transition-all"
            id={`search-${type}`}
          />
        </div>

        {/* Filter and Sort operations */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Timeframe Period Filter (Only for Recently Followed) */}
          {type === 'recently-followed' && (
            <div className="flex items-center space-x-1.5 bg-[#FAFAFA] p-1.5 rounded-xl border border-[#E5E7EB] text-xs">
              <span className="text-[#6B7280] px-1.5 font-medium flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              {(['all', 'today', 'week', 'month'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTimeFilter(opt)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize cursor-pointer transition-colors ${timeFilter === opt
                      ? 'bg-gradient-to-r from-[#F58529] to-[#DD2A7B] text-white shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                >
                  {opt === 'all' ? 'All Time' : opt === 'week' ? 'This Week' : opt === 'month' ? 'This Month' : opt}
                </button>
              ))}
            </div>
          )}

          {/* Sort Select */}
          <div className="flex items-center space-x-1.5 text-xs bg-[#FAFAFA] pl-3 pr-1 py-1.5 rounded-xl border border-[#E5E7EB]">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#6B7280]" />
            <span className="text-[#6B7280] font-medium leading-none">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent font-semibold text-[#111827] focus:outline-none pr-1.5 cursor-pointer text-xs"
              id={`sort-${type}`}
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">Username A → Z</option>
              <option value="za">Username Z → A</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid or Table list representation */}
      {totalItems === 0 ? (
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] py-16 px-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-[#6B7280] mb-3">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#111827]">No accounts found</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-[#6B7280]">
            No records matched user terms or periods. Try clearing searches, adjusting period checkboxes or uploading another backup directory.
          </p>
        </div>
      ) : type === 'recently-followed' ? (

        /* TIMELINE LAYOUT for Recently Followed Page */
        <div className="relative pl-6 border-l border-[#E5E7EB] space-y-5 py-2">
          {paginatedUsers.map((user, idx) => {
            const initial = user.username.slice(0, 2).toUpperCase();
            return (
              <div key={user.username} className="relative flex items-center justify-between group bg-white rounded-2xl border border-[#E5E7EB]/50 hover:bg-[#FAFAFA] p-3.5 transition-all shadow-sm">

                {/* Visual timeline circle dot */}
                <div className="absolute -left-[29px] top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-[#E5E7EB] group-hover:border-[#DD2A7B] transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E5E7EB] group-hover:bg-[#DD2A7B] transition-colors" />
                </div>

                <div className="flex items-center space-x-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-xs font-bold leading-none font-mono shadow-sm">
                    {initial}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] leading-none group-hover:text-[#DD2A7B] transition-colors">
                      {user.username}
                    </h4>
                    <span className="text-[11px] text-[#6B7280] font-mono mt-1 block">
                      Followed on {user.dateString}
                    </span>
                  </div>
                </div>

                <div>
                  <a
                    href={user.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4] hover:opacity-90 active:scale-[0.98] rounded-lg transition-all"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* TABLE LAYOUT for standard matching lists */
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm" id={`table-${type}`}>
              <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">User profile</th>
                  <th className="px-6 py-4 font-bold">Follow Date</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {paginatedUsers.map((user) => {
                  const initial = user.username.slice(0, 2).toUpperCase();
                  return (
                    <tr
                      key={user.username}
                      className={`hover:bg-[#FAFAFA]/55 transition-colors ${type === 'dont-follow-back' ? 'hover:bg-rose-50/10' : ''
                        }`}
                    >
                      {/* Left Block: Avatar & Username */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center space-x-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold font-mono text-xs text-white ${type === 'dont-follow-back'
                              ? 'bg-gradient-to-tr from-[#DD2A7B] via-[#8134AF] to-[#515BD4]'
                              : 'bg-gradient-to-r from-[#F58529] to-[#DD2A7B]'
                            }`}>
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-[#111827] block hover:underline cursor-pointer leading-tight text-sm">
                              {user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Micro connection Dates */}
                      <td className="px-6 py-4.5 text-xs text-[#6B7280] font-mono">
                        {user.dateString}
                      </td>

                      {/* Right Action Trigger */}
                      <td className="px-6 py-4.5 text-right">
                        <a
                          href={user.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${type === 'dont-follow-back'
                              ? 'bg-gradient-to-tr from-[#DD2A7B] via-[#8134AF] to-[#515BD4] text-white hover:opacity-95'
                              : 'bg-white border border-[#E5E7EB] text-[#111827] hover:border-black/30'
                            }`}
                        >
                          <span>Open Instagram</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4 text-xs sm:text-sm">
              <span className="text-[#6B7280] font-medium">
                Showing <span className="font-bold text-[#111827]">{startIdx}</span> to{' '}
                <span className="font-bold text-[#111827]">{endIdx}</span> of{' '}
                <span className="font-extrabold text-[#111827]">{totalItems}</span> accounts
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 font-semibold text-[#111827] hover:bg-[#FAFAFA] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <span className="font-mono px-2 text-[#6B7280]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 font-semibold text-[#111827] hover:bg-[#FAFAFA] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
