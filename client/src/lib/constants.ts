// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: number) => `/api/users/${id}`,
    UPDATE: (id: number) => `/api/users/${id}`,
  },
  MATCHES: {
    CREATE: '/api/matches',
    LIST: '/api/matches',
    UPDATE: (id: number) => `/api/matches/${id}`,
  },
  MESSAGES: {
    CREATE: '/api/messages',
    GET_WITH_USER: (userId: number) => `/api/messages/${userId}`,
    GET_CONVERSATIONS: '/api/conversations',
    GET_UNREAD_COUNT: '/api/messages/unread/count',
  },
  STORIES: {
    CREATE: '/api/stories',
    LIST: '/api/stories',
    GET_BY_USER: (userId: number) => `/api/stories/user/${userId}`,
  },
  POSTS: {
    CREATE: '/api/posts',
    FEED: '/api/posts/feed',
    GET_BY_USER: (userId: number) => `/api/posts/user/${userId}`,
    DETAIL: (id: number) => `/api/posts/${id}`,
  },
  COMMENTS: {
    CREATE: '/api/comments',
    GET_BY_POST: (postId: number) => `/api/comments/post/${postId}`,
  },
  LIKES: {
    TOGGLE: '/api/likes',
  },
  FOLLOWS: {
    TOGGLE: '/api/follows',
    CHECK_STATUS: (userId: number) => `/api/follows/status/${userId}`,
    GET_FOLLOWERS: (userId: number) => `/api/follows/followers/${userId}`,
    GET_FOLLOWING: (userId: number) => `/api/follows/following/${userId}`,
  },
  EVENTS: {
    LIST: '/api/events',
    CREATE: '/api/events',
    ATTEND: (eventId: number) => `/api/events/${eventId}/attend`,
  },
  DATE_BOOKINGS: {
    CREATE: '/api/date-bookings',
    LIST: '/api/date-bookings',
    UPDATE: (id: number) => `/api/date-bookings/${id}`,
  },
};

// Sample data and placeholder images
export const PLACEHOLDER_IMAGES = {
  PROFILE: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  LANDSCAPE: 'https://images.unsplash.com/photo-1518399681705-1c1a55e5e883?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bmFtaWJpYXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
  EVENT: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHNvY2lhbCUyMGdhdGhlcmluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
};

// Namibian cities
export const NAMIBIA_CITIES = [
  'Windhoek',
  'Swakopmund',
  'Walvis Bay',
  'Otjiwarongo',
  'Oshakati',
  'Rundu',
  'Katima Mulilo',
  'Keetmanshoop',
  'Mariental',
  'Gobabis',
  'Okahandja',
  'Outjo',
  'Tsumeb',
  'Opuwo',
  'Rehoboth',
];

// Interest tags
export const INTEREST_TAGS = [
  'Photography',
  'Travel',
  'Hiking',
  'Music',
  'Art',
  'Cooking',
  'Dance',
  'Reading',
  'Movies',
  'Sports',
  'Fitness',
  'Technology',
  'Fashion',
  'Gaming',
  'Wildlife',
  'Nature',
  'Beach',
  'Camping',
  'Fishing',
  'History',
  'Culture',
];

// Occupations
export const OCCUPATIONS = [
  'Software Developer',
  'Teacher',
  'Doctor',
  'Nurse',
  'Engineer',
  'Artist',
  'Photographer',
  'Chef',
  'Writer',
  'Musician',
  'Entrepreneur',
  'Student',
  'Tour Guide',
  'Architect',
  'Designer',
  'Marketing Specialist',
  'Accountant',
  'Wildlife Biologist',
  'Hotel Manager',
  'Lawyer',
];

// Event types
export const EVENT_TYPES = [
  'Dating',
  'Social',
  'Adventure',
  'Cultural',
  'Educational',
  'Food & Drink',
  'Music & Dance',
  'Sports',
];

// Application Constants
export const APP_NAME = 'NamibiaLove';
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_BIO_LENGTH = 150;
export const MAX_POST_LENGTH = 500;
export const MAX_COMMENT_LENGTH = 200;
export const STORY_DURATION = 5000; // 5 seconds per story
