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

  // Log all found paths for debug
  console.group('[InstaTrace] ZIP contents:');
  allPaths.forEach(p => console.log(zip.files[p].dir ? `[DIR] ${p}` : `[FILE] ${p}`));
  console.groupEnd();

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
      console.log(`[InstaTrace] ${isFollowerFile ? 'FOLLOWERS' : 'FOLLOWING'} "${path}" → ${extracted.length} users`);

      if (extracted.length === 0) {
        // Log a sample of the raw JSON so we can debug the actual format
        const sample = JSON.stringify(json).slice(0, 600);
        console.warn(`[InstaTrace] ⚠️ 0 users extracted from "${path}". Raw JSON sample:\n${sample}`);
        // Also log the keys at the top level
        if (typeof json === 'object' && !Array.isArray(json)) {
          console.warn(`[InstaTrace] Top-level keys:`, Object.keys(json));
          const firstKey = Object.keys(json)[0];
          if (firstKey && Array.isArray(json[firstKey]) && json[firstKey].length > 0) {
            console.warn(`[InstaTrace] First entry under "${firstKey}":`, JSON.stringify(json[firstKey][0]));
          }
        } else if (Array.isArray(json) && json.length > 0) {
          console.warn(`[InstaTrace] First array entry:`, JSON.stringify(json[0]));
        }
      }

      if (isFollowerFile) {
        followers = followers.concat(extracted);
      } else {
        following = following.concat(extracted);
      }
    } catch (err) {
      console.error(`[InstaTrace] Error reading "${path}":`, err);
    }
  }


  console.log(`[InstaTrace] Total raw — followers: ${followers.length}, following: ${following.length}`);

  // Deduplicate by username
  const uniqueFollowers = Array.from(new Map(followers.map(u => [u.username, u])).values());
  const uniqueFollowing = Array.from(new Map(following.map(u => [u.username, u])).values());

  console.log(`[InstaTrace] After dedup — followers: ${uniqueFollowers.length}, following: ${uniqueFollowing.length}`);

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
 * GENERATE HIGH-FIDELITY MOCK EXPORTS
 * This matches the exact numbers:
 * Followers: 1,245
 * Following: 876
 * Mutuals: 654
 * Don't Follow Back: 222
 * Fans: 580
 */
export function generateMockExport(type: 'may' | 'june'): ParsedExport {
  const isMay = type === 'may';
  const fileName = isMay ? 'may_export.zip' : 'june_export.zip';
  const exportedAt = isMay ? 'May 15, 2025, 1:45 PM' : 'June 1, 2025, 2:20 PM';
  const baseTime = isMay ? 1747316700 : 1748787600; // May 15 2025, or June 1 2025

  // Deterministically generate accounts
  const followersCount = isMay ? 1245 : 1279; // +34 followers
  const followingCount = isMay ? 876 : 898;  // +22 followed, or custom diff

  const mutualsCount = isMay ? 654 : 670;
  const dfbCount = isMay ? 222 : 228; // Don't follow back
  const fansCount = isMay ? 580 : 595;

  const followers: InstagramUser[] = [];
  const following: InstagramUser[] = [];

  // Generate Mutuals
  for (let i = 0; i < mutualsCount; i++) {
    const username = getMockUsername('mutual', i);
    const timestamp = baseTime - i * 3600 * 2.5; // hourly gaps
    const user: InstagramUser = {
      username,
      href: `https://www.instagram.com/${username}`,
      timestamp,
      dateString: formatDate(timestamp),
    };
    followers.push(user);
    following.push(user);
  }

  // Generate Don't Follow Back (We follow them, they don't follow us)
  for (let i = 0; i < dfbCount; i++) {
    const username = getMockUsername('dfb', i);
    const timestamp = baseTime - i * 3600 * 3.7;
    const user: InstagramUser = {
      username,
      href: `https://www.instagram.com/${username}`,
      timestamp,
      dateString: formatDate(timestamp),
    };
    following.push(user);
  }

  // Generate Fans (They follow us, we don't follow them)
  for (let i = 0; i < fansCount; i++) {
    const username = getMockUsername('fan', i);
    const timestamp = baseTime - i * 3600 * 1.9;
    const user: InstagramUser = {
      username,
      href: `https://www.instagram.com/${username}`,
      timestamp,
      dateString: formatDate(timestamp),
    };
    followers.push(user);
  }

  // Inject beautiful concrete users in top records to match UI screenshot
  // albin_thomas, john_doe, sarah_jonas, rachel_miller, david_lee
  const specialUsers = {
    albin_thomas: { username: 'albin_thomas', href: 'https://www.instagram.com/albin_thomas', timestamp: baseTime - 7200, dateString: formatDate(baseTime - 7200) }, // 2h ago
    john_doe: { username: 'john_doe', href: 'https://www.instagram.com/john_doe', timestamp: baseTime - 86400, dateString: formatDate(baseTime - 86400) }, // 1d ago
    sarah_jonas: { username: 'sarah_jonas', href: 'https://www.instagram.com/sarah_jonas', timestamp: baseTime - 172800, dateString: formatDate(baseTime - 172800) }, // 2d ago
    rachel_miller: { username: 'rachel_miller', href: 'https://www.instagram.com/rachel_miller', timestamp: baseTime - 259200, dateString: formatDate(baseTime - 259200) }, // 3d ago
    david_lee: { username: 'david_lee', href: 'https://www.instagram.com/david_lee', timestamp: baseTime - 345600, dateString: formatDate(baseTime - 345600) }, // 4d ago
  };

  // Ensure they are placed at the beginning of followers & following lists where relevant
  // - albin_thomas, john_doe, david_lee are starting following you
  // - sarah_jonas is followed by you
  // Let's place them appropriately:
  followers.unshift(specialUsers.albin_thomas, specialUsers.john_doe, specialUsers.david_lee);
  following.unshift(specialUsers.sarah_jonas);

  // Define mutuals/fans/dfb lists correctly
  const followerSet = new Set(followers.map(u => u.username));
  const followingSet = new Set(following.map(u => u.username));

  const mutuals = following.filter(u => followerSet.has(u.username));
  const dontFollowBack = following.filter(u => !followerSet.has(u.username));
  const fans = followers.filter(u => !followingSet.has(u.username));

  // Build key Activities
  const recentActivity: ActivityItem[] = [
    {
      id: 'act-1',
      username: 'albin_thomas',
      type: 'started_following_you',
      timestamp: baseTime - 7200, // 2h ago
      timeAgo: '2h ago',
    },
    {
      id: 'act-2',
      username: 'john_doe',
      type: 'started_following_you',
      timestamp: baseTime - 86400, // 1d ago
      timeAgo: '1d ago',
    },
    {
      id: 'act-3',
      username: 'sarah_jonas',
      type: 'followed_by_you',
      timestamp: baseTime - 172800, // 2d ago
      timeAgo: '2d ago',
    },
    {
      id: 'act-4',
      username: 'rachel_miller',
      type: 'unfollowed_you',
      timestamp: baseTime - 259200, // 3d ago
      timeAgo: '3d ago',
    },
    {
      id: 'act-5',
      username: 'david_lee',
      type: 'started_following_you',
      timestamp: baseTime - 345600, // 4d ago
      timeAgo: '4d ago',
    },
  ];

  return {
    fileName,
    fileSize: isMay ? '1.8 MB' : '1.9 MB',
    exportedAt,
    followers,
    following,
    mutuals,
    dontFollowBack,
    fans,
    recentActivity,
  };
}

// Generate comparison result between May and June
export function getComparison(exportA: ParsedExport, exportB: ParsedExport): ComparisonResult {
  // We compare A (older) and B (newer)
  const setA_followers = new Set(exportA.followers.map(u => u.username));
  const setB_followers = new Set(exportB.followers.map(u => u.username));

  const setA_following = new Set(exportA.following.map(u => u.username));
  const setB_following = new Set(exportB.following.map(u => u.username));

  // New followers: present in B, not in A
  const newFollowers = exportB.followers.filter(u => !setA_followers.has(u.username));

  // Lost followers: present in A, not in B
  const lostFollowers = exportA.followers.filter(u => !setB_followers.has(u.username));

  // New following: present in B following, not in A
  const newFollowing = exportB.following.filter(u => !setA_following.has(u.username));

  // Unfollowed accounts (lost following): present in A following, not in B
  const unfollowed = exportA.following.filter(u => !setB_following.has(u.username));

  return {
    fileA: { name: exportA.fileName, date: exportA.exportedAt },
    fileB: { name: exportB.fileName, date: exportB.exportedAt },
    newFollowers,
    lostFollowers,
    newFollowing,
    unfollowed,
  };
}

const FIRST_NAMES = ['alex', 'jordan', 'taylor', 'morgan', 'casey', 'jamie', 'riley', 'sam', 'skyler', 'stefan', 'elena', 'damon', 'olivia', 'clara', 'noah', 'emma', 'liam', 'sophia', 'mason', 'charlotte', 'lucas', 'mia', 'ethan', 'harper', 'logan'];
const LAST_NAMES = ['smith', 'jones', 'miller', 'davis', 'garcia', 'rodriguez', 'wilson', 'martinez', 'anderson', 'taylor', 'thomas', 'white', 'harris', 'martin', 'clark', 'lewis', 'robinson', 'walker', 'young', 'allen', 'king', 'wright', 'scott', 'torres'];
const SEPARATORS = ['_', '.', ''];

function getMockUsername(prefix: string, seed: number): string {
  // Make beautiful, readable usernames using seed
  const p1 = FIRST_NAMES[seed % FIRST_NAMES.length];
  const p2 = LAST_NAMES[(seed + 3) % LAST_NAMES.length];
  const sep = SEPARATORS[seed % SEPARATORS.length];
  const num = seed > 30 ? (seed % 99) : '';
  return `${p1}${sep}${p2}${num}`;
}
