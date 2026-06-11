export interface InstagramUser {
  username: string;
  href: string;
  timestamp: number; // Unix timestamp
  dateString: string; // Formatted date: "May 15, 2025, 1:45 PM"
}

export interface ParsedExport {
  fileName: string;
  fileSize: string;
  exportedAt: string; // Date string or fallback
  followers: InstagramUser[];
  following: InstagramUser[];
  mutuals: InstagramUser[];
  dontFollowBack: InstagramUser[]; // Following but not in followers
  fans: InstagramUser[]; // Followers but not in following
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  username: string;
  type: 'started_following_you' | 'followed_by_you' | 'unfollowed_you' | 'followed';
  timestamp: number;
  timeAgo: string;
}

export interface ComparisonResult {
  fileA: { name: string; date: string };
  fileB: { name: string; date: string };
  newFollowers: InstagramUser[];
  lostFollowers: InstagramUser[];
  newFollowing: InstagramUser[];
  unfollowed: InstagramUser[];
}
