import JSZip from 'jszip';
import { InstagramUser, ParsedExport, ActivityItem, ComparisonResult } from '../types';

// Helper to format date
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Try to extract a valid Instagram username from any known field combination.
 * Priority: value → href → title
 */
function extractUsername(obj: any): string {
  // 1. Direct value field (followers_1.json always has this)
  if (obj.value && typeof obj.value === 'string' && obj.value.trim()) {
    return obj.value.trim();
  }
  // 2. Parse from href URL (following.json often has empty value but valid href)
  if (obj.href && typeof obj.href === 'string' && obj.href.trim()) {
    const match = obj.href.match(/instagram\.com\/([^/?#\s]+)/);
    if (match && match[1] && !['p', 'explore', 'reel', 'tv', 'accounts'].includes(match[1])) {
      return match[1].replace(/\/$/, '');
    }
  }
  // 3. title field (newer Instagram following.json format uses title as username)
  if (obj.title && typeof obj.title === 'string' && obj.title.trim()) {
    return obj.title.trim();
  }
  return '';
}

/**
 * Push a user entry into the list if username is valid and not seen before.
 */
function pushUser(
  username: string,
  href: string,
  timestamp: number,
  users: InstagramUser[],
  seen: Set<string>
): void {
  const clean = username.trim();
  if (!clean || seen.has(clean)) return;
  seen.add(clean);
  const ts = timestamp > 0 ? timestamp : Math.floor(Date.now() / 1000);
  users.push({
    username: clean,
    href: href && href.trim() ? href.trim() : `https://www.instagram.com/${clean}`,
    timestamp: ts,
    dateString: formatDate(ts),
  });
}

// Deep search JSON for all Instagram-style user entries.
// Handles ALL known Instagram export formats:
//  Format A (followers_1.json): array of {string_list_data: [{href, value, timestamp}]}
//  Format B (following.json old): {relationships_following: [{string_list_data: [{href, value?, timestamp}]}]}
//  Format C (following.json new): {relationships_following: [{title: "username", string_list_data: []}]}
//  Format D (direct): [{href, value, timestamp}]
export function extractUsersFromJson(jsonObj: any): InstagramUser[] {
  const users: InstagramUser[] = [];
  const seen = new Set<string>();

  function processEntry(item: any) {
    if (!item || typeof item !== 'object') return;

    // --- Format A & B: has string_list_data with entries ---
    if (Array.isArray(item.string_list_data) && item.string_list_data.length > 0) {
      for (const listData of item.string_list_data) {
        const username = extractUsername(listData);
        const href = listData.href || '';
        const ts = typeof listData.timestamp === 'number' ? listData.timestamp : 0;
        if (username) pushUser(username, href, ts, users, seen);
      }
      // Also try title as fallback if string_list_data had no usable data
      if (users.length === 0 || !seen.has(item.title)) {
        const titleUser = extractUsername(item); // will check title
        if (titleUser) {
          const ts = Array.isArray(item.string_list_data) && item.string_list_data[0]
            ? (item.string_list_data[0].timestamp || 0)
            : 0;
          pushUser(titleUser, `https://www.instagram.com/${titleUser}`, ts, users, seen);
        }
      }
      return;
    }

    // --- Format C (new following.json): title is username, string_list_data is empty or missing ---
    if (item.title && typeof item.title === 'string' && item.title.trim()) {
      const username = item.title.trim();
      // get timestamp from string_list_data if available, else media_list_data
      let ts = 0;
      if (Array.isArray(item.string_list_data) && item.string_list_data.length > 0) {
        ts = item.string_list_data[0]?.timestamp || 0;
      } else if (Array.isArray(item.media_list_data) && item.media_list_data.length > 0) {
        ts = item.media_list_data[0]?.creation_timestamp || 0;
      }
      pushUser(username, `https://www.instagram.com/${username}`, ts, users, seen);
      return;
    }

    // --- Format D: direct {href, value, timestamp} entry ---
    if (typeof item.href === 'string' || typeof item.value === 'string') {
      const username = extractUsername(item);
      const href = item.href || '';
      const ts = typeof item.timestamp === 'number' ? item.timestamp : 0;
      if (username) pushUser(username, href, ts, users, seen);
    }
  }

  function traverse(node: any, depth = 0) {
    if (!node || depth > 15) return;

    if (Array.isArray(node)) {
      for (const item of node) {
        processEntry(item);
      }
    } else if (typeof node === 'object') {
      // Check if this node itself is a user-like entry (has string_list_data or title)
      if (node.string_list_data !== undefined || node.title !== undefined) {
        processEntry(node);
      } else {
        // Recurse into object values
        for (const key of Object.keys(node)) {
          const val = node[key];
          if (Array.isArray(val)) {
            traverse(val, depth + 1);
          } else if (val && typeof val === 'object') {
            traverse(val, depth + 1);
          }
        }
      }
    }
  }

  traverse(jsonObj);
  return users;
}



// Parse JSZip structure and merge followers_*.json + following.json
export async function parseInstagramZip(file: File): Promise<ParsedExport> {
  const zip = await JSZip.loadAsync(file);
  let followers: InstagramUser[] = [];
  let following: InstagramUser[] = [];

  const allPaths = Object.keys(zip.files);


  for (const path of allPaths) {
    const fileEntry = zip.files[path];
    if (fileEntry.dir) continue;

    // Normalize path to forward slashes and lowercase for reliable matching
    const normalizedPath = path.replace(/\\/g, '/').toLowerCase();

    // Extract base filename (without extension) for pattern matching
    const rawFilename = normalizedPath.split('/').pop() ?? '';
    const filenameNoExt = rawFilename.replace(/\.json$/, '');

    // Must be inside the followers_and_following folder (or similar)
    // Check the full path contains the folder OR just rely on filename patterns
    const inConnectionsFolder = normalizedPath.includes('followers_and_following') ||
                                normalizedPath.includes('connections');

    // Match:
    //   followers_1, followers_2, followers, follower_requests etc. but NOT following*
    const isFollowerFile = (filenameNoExt.startsWith('follower') && !filenameNoExt.startsWith('following'));
    //   following (exact) or following_hashtags etc.
    const isFollowingFile = filenameNoExt === 'following';

    if (!isFollowerFile && !isFollowingFile) continue;

    // Try to read and parse as JSON (handles files with or without .json extension)
    try {
      const text = await fileEntry.async('string');
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        console.warn(`[InstaTrace] Skipping "${path}" — not valid JSON`);
        continue;
      }

      const extracted = extractUsersFromJson(json);

      if (isFollowerFile) {
        followers = followers.concat(extracted);
      } else {
        following = following.concat(extracted);
      }
    } catch (err) {
      console.error(`[InstaTrace] Error reading "${path}":`, err);
    }
  }

  // Deduplicate by username
  const uniqueFollowers = Array.from(new Map(followers.map(u => [u.username, u])).values());
  const uniqueFollowing = Array.from(new Map(following.map(u => [u.username, u])).values());

  // Derive stats
  const followerSet = new Set(uniqueFollowers.map(u => u.username));
  const followingSet = new Set(uniqueFollowing.map(u => u.username));

  // Mutuals: in both follower and following
  const mutuals = uniqueFollowing.filter(u => followerSet.has(u.username));

  // Don't Follow Back: I follow them, they don't follow me
  const dontFollowBack = uniqueFollowing.filter(u => !followerSet.has(u.username));

  // Fans: they follow me, I don't follow them
  const fans = uniqueFollowers.filter(u => !followingSet.has(u.username));

  // Generate activity timeline
  const recentActivity = generateActivities(uniqueFollowers, uniqueFollowing);

  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

  return {
    fileName: file.name,
    fileSize: `${sizeInMB} MB`,
    exportedAt: formatDate(Math.floor(Date.now() / 1000)),
    followers: uniqueFollowers,
    following: uniqueFollowing,
    mutuals,
    dontFollowBack,
    fans,
    recentActivity,
  };
}

// Generate activities based on lists to produce clean activity timeline
function generateActivities(followers: InstagramUser[], following: InstagramUser[]): ActivityItem[] {
  const activities: ActivityItem[] = [];
  
  // Sort by date descending
  const sortedFollowers = [...followers].sort((a, b) => b.timestamp - a.timestamp);
  const sortedFollowing = [...following].sort((a, b) => b.timestamp - a.timestamp);

  // Take top followers
  sortedFollowers.slice(0, 5).forEach((u, index) => {
    activities.push({
      id: `act-follower-${index}`,
      username: u.username,
      type: 'started_following_you',
      timestamp: u.timestamp,
      timeAgo: index === 0 ? '2h ago' : index === 1 ? '1d ago' : `${index + 2}d ago`,
    });
  });

  // Take top following
  sortedFollowing.slice(0, 3).forEach((u, index) => {
    activities.push({
      id: `act-following-${index}`,
      username: u.username,
      type: 'followed_by_you',
      timestamp: u.timestamp,
      timeAgo: `${index + 2}d ago`,
    });
  });

  // Sort final activity list
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
}

// Helper to convert data to CSV
export function convertToCSV(users: InstagramUser[], title: string): string {
  const headers = ['Username', 'Profile URL', 'Follow Timestamp', 'Follow Date'];
  const rows = users.map(u => [
    u.username,
    u.href,
    u.timestamp,
    u.dateString,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
}

/**
 * Small handcrafted dummy datasets — two snapshots to demo all features.
 *
 * May snapshot (15 accounts):
 *   Followers : 10  |  Following : 8
 *   Mutuals   : 6   |  Don't Follow Back : 2  |  Fans : 4
 *
 * June snapshot (15 accounts, slight changes to power the Compare view):
 *   Followers : 11  |  Following : 9
 *   New follower: nova_pixel  |  Lost follower: pixel_craft
 *   New following: sunny_dev  |  Unfollowed: bright_lens
 */

// Helper: build an InstagramUser in one line
function u(username: string, daysAgo: number, baseTime: number): InstagramUser {
  const ts = baseTime - daysAgo * 86400;
  return { username, href: `https://www.instagram.com/${username}`, timestamp: ts, dateString: formatDate(ts) };
}

export function generateMockExport(type: 'may' | 'june'): ParsedExport {
  const isMay = type === 'may';
  const fileName   = isMay ? 'may_export.zip'  : 'june_export.zip';
  const exportedAt = isMay ? 'May 15, 2025, 1:45 PM' : 'Jun 1, 2025, 2:20 PM';
  const base       = isMay ? 1747316700 : 1748787600;

  // ── Followers ──────────────────────────────────────────────────
  // Mutuals (follow each other) — 6 shared accounts
  const mutualUsers = [
    u('cosmic_jay',    1, base),
    u('loop_theory',   3, base),
    u('wave_studio',   5, base),
    u('dusk_frames',   7, base),
    u('neon_arc',     10, base),
    u('byte_bloom',   14, base),
  ];

  // Fans (they follow you, you don't follow them) — 4 accounts
  const fanUsers = isMay
    ? [
        u('pixel_craft',  2, base),
        u('solar_grid',   6, base),
        u('blur_motion',  9, base),
        u('echo_valley', 13, base),
      ]
    : [
        // pixel_craft left; nova_pixel joined
        u('solar_grid',   6, base),
        u('blur_motion',  9, base),
        u('echo_valley', 13, base),
        u('nova_pixel',   1, base),
      ];

  // ── Following ──────────────────────────────────────────────────
  // Don't Follow Back (you follow them, they don't follow you) — 2 accounts
  const dfbUsers = isMay
    ? [
        u('bright_lens',  4, base),
        u('grid_tales',  11, base),
      ]
    : [
        // bright_lens unfollowed; sunny_dev followed
        u('grid_tales',  11, base),
        u('sunny_dev',    2, base),
      ];

  const followers = [...mutualUsers, ...fanUsers];
  const following = [...mutualUsers, ...dfbUsers];

  const followerSet  = new Set(followers.map(x => x.username));
  const followingSet = new Set(following.map(x => x.username));

  const mutuals       = following.filter(x => followerSet.has(x.username));
  const dontFollowBack = following.filter(x => !followerSet.has(x.username));
  const fans          = followers.filter(x => !followingSet.has(x.username));

  // ── Recent Activity ────────────────────────────────────────────
  const recentActivity: ActivityItem[] = [
    { id: 'a1', username: 'cosmic_jay',   type: 'started_following_you', timestamp: base - 86400,      timeAgo: '1d ago' },
    { id: 'a2', username: 'nova_pixel',   type: 'started_following_you', timestamp: base - 86400 * 2,  timeAgo: '2d ago' },
    { id: 'a3', username: 'sunny_dev',    type: 'followed_by_you',       timestamp: base - 86400 * 3,  timeAgo: '3d ago' },
    { id: 'a4', username: 'loop_theory',  type: 'started_following_you', timestamp: base - 86400 * 4,  timeAgo: '4d ago' },
    { id: 'a5', username: 'bright_lens',  type: 'unfollowed_you',        timestamp: base - 86400 * 5,  timeAgo: '5d ago' },
    { id: 'a6', username: 'wave_studio',  type: 'followed_by_you',       timestamp: base - 86400 * 7,  timeAgo: '7d ago' },
  ];

  return {
    fileName,
    fileSize: isMay ? '0.1 MB' : '0.1 MB',
    exportedAt,
    followers,
    following,
    mutuals,
    dontFollowBack,
    fans,
    recentActivity,
  };
}

// Generate comparison result between two exports
export function getComparison(exportA: ParsedExport, exportB: ParsedExport): ComparisonResult {
  const setA_followers = new Set(exportA.followers.map(u => u.username));
  const setB_followers = new Set(exportB.followers.map(u => u.username));
  const setA_following = new Set(exportA.following.map(u => u.username));
  const setB_following = new Set(exportB.following.map(u => u.username));

  return {
    fileA: { name: exportA.fileName, date: exportA.exportedAt },
    fileB: { name: exportB.fileName, date: exportB.exportedAt },
    newFollowers:  exportB.followers.filter(u => !setA_followers.has(u.username)),
    lostFollowers: exportA.followers.filter(u => !setB_followers.has(u.username)),
    newFollowing:  exportB.following.filter(u => !setA_following.has(u.username)),
    unfollowed:    exportA.following.filter(u => !setB_following.has(u.username)),
  };
}


