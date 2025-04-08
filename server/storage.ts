import {
  users, User, InsertUser,
  matches, Match, InsertMatch,
  messages, Message, InsertMessage,
  stories, Story, InsertStory,
  posts, Post, InsertPost,
  comments, Comment, InsertComment,
  likes, Like, InsertLike,
  follows, Follow, InsertFollow,
  events, Event, InsertEvent,
  dateBookings, DateBooking, InsertDateBooking,
  eventAttendees, EventAttendee, InsertEventAttendee
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, count, gt, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User | undefined>;
  updateStripeSubscriptionId(id: number, stripeSubscriptionId: string): Promise<User | undefined>;
  updatePremiumStatus(id: number, isPremium: boolean, expiresAt?: Date): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  
  // Match methods
  createMatch(match: InsertMatch): Promise<Match>;
  getMatch(userId1: number, userId2: number): Promise<Match | undefined>;
  updateMatchStatus(id: number, status: string): Promise<Match | undefined>;
  getMatchesByUser(userId: number): Promise<Match[]>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  markMessagesAsRead(senderId: number, receiverId: number): Promise<void>;
  getUnreadMessageCount(userId: number): Promise<number>;
  getConversations(userId: number): Promise<{ userId: number, lastMessage: Message }[]>;
  
  // Story methods
  createStory(story: InsertStory): Promise<Story>;
  getStoriesByUser(userId: number): Promise<Story[]>;
  getActiveStories(): Promise<Story[]>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getPostsByUser(userId: number): Promise<Post[]>;
  getFeedForUser(userId: number): Promise<Post[]>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  
  // Like methods
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(postId: number, userId: number): Promise<void>;
  getLikesByPost(postId: number): Promise<Like[]>;
  checkUserLiked(postId: number, userId: number): Promise<boolean>;
  
  // Follow methods
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  checkUserFollows(followerId: number, followingId: number): Promise<boolean>;
  
  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  listEvents(): Promise<Event[]>;
  getEventsByUser(userId: number): Promise<Event[]>;
  
  // DateBooking methods
  createDateBooking(booking: InsertDateBooking): Promise<DateBooking>;
  getDateBooking(id: number): Promise<DateBooking | undefined>;
  updateDateBookingStatus(id: number, status: string): Promise<DateBooking | undefined>;
  getDateBookingsByUser(userId: number): Promise<DateBooking[]>;
  
  // EventAttendee methods
  createEventAttendee(attendee: InsertEventAttendee): Promise<EventAttendee>;
  updateEventAttendeeStatus(eventId: number, userId: number, status: string): Promise<EventAttendee | undefined>;
  getEventAttendees(eventId: number): Promise<EventAttendee[]>;
  getUserEventStatus(eventId: number, userId: number): Promise<string | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matches: Map<number, Match>;
  private messages: Map<number, Message>;
  private stories: Map<number, Story>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private follows: Map<number, Follow>;
  private events: Map<number, Event>;
  private dateBookings: Map<number, DateBooking>;
  private eventAttendees: Map<number, EventAttendee>;
  
  private userIdCounter: number;
  private matchIdCounter: number;
  private messageIdCounter: number;
  private storyIdCounter: number;
  private postIdCounter: number;
  private commentIdCounter: number;
  private likeIdCounter: number;
  private followIdCounter: number;
  private eventIdCounter: number;
  private dateBookingIdCounter: number;
  private eventAttendeeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.messages = new Map();
    this.stories = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.events = new Map();
    this.dateBookings = new Map();
    this.eventAttendees = new Map();
    
    this.userIdCounter = 1;
    this.matchIdCounter = 1;
    this.messageIdCounter = 1;
    this.storyIdCounter = 1;
    this.postIdCounter = 1;
    this.commentIdCounter = 1;
    this.likeIdCounter = 1;
    this.followIdCounter = 1;
    this.eventIdCounter = 1;
    this.dateBookingIdCounter = 1;
    this.eventAttendeeIdCounter = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Add sample users
    const demoUsers: InsertUser[] = [
      {
        username: "amara_photographer",
        password: "password123",
        email: "amara@example.com",
        fullName: "Amara Diallo",
        bio: "Photographer capturing Namibia's beautiful landscapes",
        age: 26,
        gender: "female",
        location: "Windhoek",
        occupation: "Photographer",
        profilePicture: "https://images.unsplash.com/photo-1579693409121-13c206c6bd30",
        interests: ["photography", "travel", "hiking"]
      },
      {
        username: "thomas_jackson",
        password: "password123",
        email: "thomas@example.com",
        fullName: "Thomas Jackson",
        bio: "Explorer and adventure enthusiast",
        age: 28,
        gender: "male",
        location: "Swakopmund",
        occupation: "Tour Guide",
        profilePicture: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
        interests: ["travel", "desert exploration", "wildlife"]
      },
      {
        username: "maria_lopez",
        password: "password123",
        email: "maria@example.com",
        fullName: "Maria Lopez",
        bio: "Food lover and cultural enthusiast",
        age: 25,
        gender: "female",
        location: "Windhoek",
        occupation: "Chef",
        profilePicture: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
        interests: ["cooking", "food", "culture"]
      },
      {
        username: "nina_williams",
        password: "password123",
        email: "nina@example.com",
        fullName: "Nina Williams",
        bio: "Art lover and creative soul",
        age: 24,
        gender: "female",
        location: "Windhoek",
        occupation: "Artist",
        profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        interests: ["art", "creativity", "music"]
      },
      {
        username: "david_miller",
        password: "password123",
        email: "david@example.com",
        fullName: "David Miller",
        bio: "Tech enthusiast and nature lover",
        age: 29,
        gender: "male",
        location: "Windhoek",
        occupation: "Software Developer",
        profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        interests: ["technology", "hiking", "photography"]
      },
      {
        username: "sarah_johnson",
        password: "password123",
        email: "sarah@example.com",
        fullName: "Sarah Johnson",
        bio: "Wildlife enthusiast and conservationist",
        age: 27,
        gender: "female",
        location: "Walvis Bay",
        occupation: "Wildlife Biologist",
        profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        interests: ["wildlife", "conservation", "nature"]
      }
    ];

    demoUsers.forEach(user => this.createUser(user));

    // Create sample posts
    this.createPost({
      userId: 2, // Thomas
      content: "Just had an amazing time visiting the Namib Desert! Truly one of the most beautiful places in Namibia 🏜️ #NamibiaBeauty",
      mediaUrl: "https://images.unsplash.com/photo-1518399681705-1c1a55e5e883"
    });

    this.createPost({
      userId: 4, // Nina
      content: "Just had the most romantic date ever! Thanks @DavidM for showing me this beautiful spot in Windhoek ❤️ #DateNight #NamibiaLove",
      mediaUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70"
    });

    // Create sample events
    this.createEvent({
      title: "Sunset Beach Party",
      description: "Join us for a fun evening at the beach with music, food, and great company!",
      location: "Swakopmund Beach",
      date: new Date("2023-08-28T18:00:00Z"),
      imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
      createdBy: 1,
      eventType: "Dating"
    });

    this.createEvent({
      title: "Coffee Meet & Greet",
      description: "A casual gathering for coffee lovers to meet new people and enjoy great conversations.",
      location: "Craft Café, Windhoek",
      date: new Date("2023-08-29T10:00:00Z"),
      imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d",
      createdBy: 3,
      eventType: "Social"
    });

    // Create sample matches
    this.createMatch({
      userId1: 1,
      userId2: 2,
      status: "matched"
    });

    this.createMatch({
      userId1: 4,
      userId2: 5,
      status: "matched"
    });

    // Create sample messages
    this.createMessage({
      senderId: 3,
      receiverId: 6,
      content: "Hi there! I saw that we matched. I really enjoyed your photos from the Namib Desert!",
      read: true
    });

    this.createMessage({
      senderId: 6,
      receiverId: 3,
      content: "Hey Maria! Thanks for reaching out. Yes, it was an amazing experience. Have you ever been there?",
      read: true
    });

    this.createMessage({
      senderId: 3,
      receiverId: 6,
      content: "Not yet, but it's definitely on my bucket list! I've been living in Windhoek for about 2 years now, but haven't explored much outside the city.",
      read: true
    });

    this.createMessage({
      senderId: 6,
      receiverId: 3,
      content: "Well, maybe we could plan a trip there sometime? I'd be happy to show you around!",
      read: true
    });

    this.createMessage({
      senderId: 3,
      receiverId: 6,
      content: "That sounds great! I'd love that. When would be a good time for you?",
      read: false
    });

    // Create sample stories
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.createStory({
      userId: 3,
      mediaUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      caption: "Enjoying the sunset in Windhoek",
      expiresAt: tomorrow
    });

    this.createStory({
      userId: 2,
      mediaUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
      caption: "Exploring the dunes",
      expiresAt: tomorrow
    });

    // Create sample comments
    this.createComment({
      postId: 1,
      userId: 3,
      content: "So beautiful! I would love to visit there someday! ❤️"
    });

    this.createComment({
      postId: 2,
      userId: 5,
      content: "Had the best time with you! Can't wait for our next date 😍"
    });

    // Create sample likes
    this.createLike({
      postId: 1,
      userId: 3
    });

    this.createLike({
      postId: 1,
      userId: 4
    });

    this.createLike({
      postId: 2,
      userId: 1
    });

    this.createLike({
      postId: 2,
      userId: 5
    });

    // Create sample follows
    this.createFollow({
      followerId: 1,
      followingId: 2
    });

    this.createFollow({
      followerId: 3,
      followingId: 6
    });

    this.createFollow({
      followerId: 4,
      followingId: 5
    });

    // Create sample date bookings
    this.createDateBooking({
      requesterId: 4,
      recipientId: 5,
      date: new Date("2023-08-30T19:00:00Z"),
      location: "Craft Café, Windhoek",
      note: "Looking forward to meeting you and exploring the city together!",
      status: "accepted"
    });

    // Create sample event attendees
    this.createEventAttendee({
      eventId: 1,
      userId: 1,
      status: "going"
    });

    this.createEventAttendee({
      eventId: 1,
      userId: 2,
      status: "going"
    });

    this.createEventAttendee({
      eventId: 1,
      userId: 3,
      status: "going"
    });

    this.createEventAttendee({
      eventId: 2,
      userId: 3,
      status: "going"
    });

    this.createEventAttendee({
      eventId: 2,
      userId: 2,
      status: "going"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Match methods
  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.matchIdCounter++;
    const newMatch: Match = { ...match, id, createdAt: new Date() };
    this.matches.set(id, newMatch);
    return newMatch;
  }

  async getMatch(userId1: number, userId2: number): Promise<Match | undefined> {
    return Array.from(this.matches.values()).find(
      (match) => 
        (match.userId1 === userId1 && match.userId2 === userId2) || 
        (match.userId1 === userId2 && match.userId2 === userId1)
    );
  }

  async updateMatchStatus(id: number, status: string): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;

    const updatedMatch: Match = { ...match, status };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  async getMatchesByUser(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.userId1 === userId || match.userId2 === userId
    );
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = { ...message, id, createdAt: new Date() };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) => 
          (message.senderId === user1Id && message.receiverId === user2Id) || 
          (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    Array.from(this.messages.values())
      .filter(message => message.senderId === senderId && message.receiverId === receiverId && !message.read)
      .forEach(message => {
        const updatedMessage = { ...message, read: true };
        this.messages.set(message.id, updatedMessage);
      });
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messages.values())
      .filter(message => message.receiverId === userId && !message.read)
      .length;
  }

  async getConversations(userId: number): Promise<{ userId: number, lastMessage: Message }[]> {
    const userMessages = Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId);
    
    // Get unique conversation partners
    const conversationPartners = new Set<number>();
    userMessages.forEach(message => {
      if (message.senderId === userId) {
        conversationPartners.add(message.receiverId);
      } else {
        conversationPartners.add(message.senderId);
      }
    });
    
    // Get the last message for each conversation
    return Array.from(conversationPartners).map(partnerId => {
      const conversationMessages = userMessages
        .filter(message => 
          (message.senderId === userId && message.receiverId === partnerId) || 
          (message.senderId === partnerId && message.receiverId === userId)
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return {
        userId: partnerId,
        lastMessage: conversationMessages[0]
      };
    });
  }

  // Story methods
  async createStory(story: InsertStory): Promise<Story> {
    const id = this.storyIdCounter++;
    const newStory: Story = { ...story, id, createdAt: new Date() };
    this.stories.set(id, newStory);
    return newStory;
  }

  async getStoriesByUser(userId: number): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getActiveStories(): Promise<Story[]> {
    const now = new Date();
    return Array.from(this.stories.values())
      .filter(story => story.expiresAt > now)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Post methods
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const newPost: Post = { ...post, id, createdAt: new Date() };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFeedForUser(userId: number): Promise<Post[]> {
    // Get the users that the current user follows
    const following = await this.getFollowing(userId);
    const followingIds = following.map(user => user.id);
    
    // Get posts from the followed users and the user's own posts
    return Array.from(this.posts.values())
      .filter(post => followingIds.includes(post.userId) || post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const newComment: Comment = { ...comment, id, createdAt: new Date() };
    this.comments.set(id, newComment);
    return newComment;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Like methods
  async createLike(like: InsertLike): Promise<Like> {
    // Check if like already exists
    const existingLike = await this.checkUserLiked(like.postId, like.userId);
    if (existingLike) {
      throw new Error("User has already liked this post");
    }
    
    const id = this.likeIdCounter++;
    const newLike: Like = { ...like, id, createdAt: new Date() };
    this.likes.set(id, newLike);
    return newLike;
  }

  async deleteLike(postId: number, userId: number): Promise<void> {
    const likeToDelete = Array.from(this.likes.values())
      .find(like => like.postId === postId && like.userId === userId);
    
    if (likeToDelete) {
      this.likes.delete(likeToDelete.id);
    }
  }

  async getLikesByPost(postId: number): Promise<Like[]> {
    return Array.from(this.likes.values())
      .filter(like => like.postId === postId);
  }

  async checkUserLiked(postId: number, userId: number): Promise<boolean> {
    return Array.from(this.likes.values())
      .some(like => like.postId === postId && like.userId === userId);
  }

  // Follow methods
  async createFollow(follow: InsertFollow): Promise<Follow> {
    // Check if follow already exists
    const existingFollow = await this.checkUserFollows(follow.followerId, follow.followingId);
    if (existingFollow) {
      throw new Error("User is already following this account");
    }
    
    const id = this.followIdCounter++;
    const newFollow: Follow = { ...follow, id, createdAt: new Date() };
    this.follows.set(id, newFollow);
    return newFollow;
  }

  async deleteFollow(followerId: number, followingId: number): Promise<void> {
    const followToDelete = Array.from(this.follows.values())
      .find(follow => follow.followerId === followerId && follow.followingId === followingId);
    
    if (followToDelete) {
      this.follows.delete(followToDelete.id);
    }
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(follow => follow.followingId === userId)
      .map(follow => follow.followerId);
    
    return Promise.all(followerIds.map(id => this.getUser(id))).then(
      users => users.filter(Boolean) as User[]
    );
  }

  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId)
      .map(follow => follow.followingId);
    
    return Promise.all(followingIds.map(id => this.getUser(id))).then(
      users => users.filter(Boolean) as User[]
    );
  }

  async checkUserFollows(followerId: number, followingId: number): Promise<boolean> {
    return Array.from(this.follows.values())
      .some(follow => follow.followerId === followerId && follow.followingId === followingId);
  }

  // Event methods
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const newEvent: Event = { ...event, id, createdAt: new Date() };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async listEvents(): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getEventsByUser(userId: number): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.createdBy === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // DateBooking methods
  async createDateBooking(booking: InsertDateBooking): Promise<DateBooking> {
    const id = this.dateBookingIdCounter++;
    const newDateBooking: DateBooking = { ...booking, id, createdAt: new Date() };
    this.dateBookings.set(id, newDateBooking);
    return newDateBooking;
  }

  async getDateBooking(id: number): Promise<DateBooking | undefined> {
    return this.dateBookings.get(id);
  }

  async updateDateBookingStatus(id: number, status: string): Promise<DateBooking | undefined> {
    const booking = this.dateBookings.get(id);
    if (!booking) return undefined;

    const updatedBooking: DateBooking = { ...booking, status };
    this.dateBookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getDateBookingsByUser(userId: number): Promise<DateBooking[]> {
    return Array.from(this.dateBookings.values())
      .filter(booking => booking.requesterId === userId || booking.recipientId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // EventAttendee methods
  async createEventAttendee(attendee: InsertEventAttendee): Promise<EventAttendee> {
    const id = this.eventAttendeeIdCounter++;
    const newEventAttendee: EventAttendee = { ...attendee, id, createdAt: new Date() };
    this.eventAttendees.set(id, newEventAttendee);
    return newEventAttendee;
  }

  async updateEventAttendeeStatus(eventId: number, userId: number, status: string): Promise<EventAttendee | undefined> {
    const attendee = Array.from(this.eventAttendees.values())
      .find(att => att.eventId === eventId && att.userId === userId);
    
    if (!attendee) return undefined;

    const updatedAttendee: EventAttendee = { ...attendee, status };
    this.eventAttendees.set(attendee.id, updatedAttendee);
    return updatedAttendee;
  }

  async getEventAttendees(eventId: number): Promise<EventAttendee[]> {
    return Array.from(this.eventAttendees.values())
      .filter(attendee => attendee.eventId === eventId);
  }

  async getUserEventStatus(eventId: number, userId: number): Promise<string | undefined> {
    const attendee = Array.from(this.eventAttendees.values())
      .find(att => att.eventId === eventId && att.userId === userId);
    
    return attendee?.status;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  async updateStripeSubscriptionId(id: number, stripeSubscriptionId: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ stripeSubscriptionId })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  async updatePremiumStatus(id: number, isPremium: boolean, expiresAt?: Date): Promise<User | undefined> {
    const updateData: { isPremium: boolean, premiumExpiresAt?: Date } = { isPremium };
    
    if (expiresAt) {
      updateData.premiumExpiresAt = expiresAt;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // Match methods
  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db.insert(matches).values(match).returning();
    return newMatch;
  }

  async getMatch(userId1: number, userId2: number): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.userId1, userId1), eq(matches.userId2, userId2)),
          and(eq(matches.userId1, userId2), eq(matches.userId2, userId1))
        )
      );
    return match || undefined;
  }

  async updateMatchStatus(id: number, status: string): Promise<Match | undefined> {
    const [updatedMatch] = await db
      .update(matches)
      .set({ status })
      .where(eq(matches.id, id))
      .returning();
    return updatedMatch || undefined;
  }

  async getMatchesByUser(userId: number): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(
        or(
          eq(matches.userId1, userId),
          eq(matches.userId2, userId)
        )
      );
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId),
          eq(messages.read, false)
        )
      );
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.read, false)
        )
      );
    return result?.count || 0;
  }

  async getConversations(userId: number): Promise<{ userId: number, lastMessage: Message }[]> {
    // Get distinct conversation partners
    const partners = await db
      .selectDistinct({
        partnerId: sql<number>`
          CASE 
            WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId}
            ELSE ${messages.senderId}
          END
        `
      })
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      );

    // For each partner, get the most recent message
    const conversations = await Promise.all(
      partners.map(async ({ partnerId }) => {
        const [lastMessage] = await db
          .select()
          .from(messages)
          .where(
            or(
              and(eq(messages.senderId, userId), eq(messages.receiverId, partnerId)),
              and(eq(messages.senderId, partnerId), eq(messages.receiverId, userId))
            )
          )
          .orderBy(desc(messages.createdAt))
          .limit(1);
        
        const [partner] = await db
          .select()
          .from(users)
          .where(eq(users.id, partnerId));
        
        return {
          userId: partnerId,
          user: partner,
          lastMessage
        };
      })
    );
    
    // Sort by most recent message
    return conversations
      .filter(conv => conv.lastMessage) // Ensure we have a lastMessage
      .sort((a, b) => 
        new Date(b.lastMessage.createdAt).getTime() - 
        new Date(a.lastMessage.createdAt).getTime()
      );
  }
  
  // Story methods
  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    return newStory;
  }

  async getStoriesByUser(userId: number): Promise<Story[]> {
    return await db
      .select()
      .from(stories)
      .where(eq(stories.userId, userId))
      .orderBy(desc(stories.createdAt));
  }

  async getActiveStories(): Promise<Story[]> {
    const now = new Date();
    
    // Get all stories where expiresAt is in the future
    const activeStories = await db
      .select({
        story: stories,
        user: users
      })
      .from(stories)
      .innerJoin(users, eq(stories.userId, users.id))
      .where(gt(stories.expiresAt, now))
      .orderBy(desc(stories.createdAt));
    
    // Format the result
    return activeStories.map(({ story, user }) => ({
      ...story,
      user
    }));
  }
  
  // Post methods
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));
    return post || undefined;
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getFeedForUser(userId: number): Promise<Post[]> {
    // Get IDs of users that the current user follows
    const following = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    
    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId); // Include the user's own posts
    
    // If followingIds is empty, just use userId to avoid SQL errors
    if (followingIds.length === 0) {
      followingIds.push(userId);
    }
    
    // Get posts from the followed users and the user's own posts
    const result = await db
      .select()
      .from(posts)
      .where(inArray(posts.userId, followingIds))
      .orderBy(desc(posts.createdAt));
      
    return result;
  }
  
  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);
  }
  
  // Like methods
  async createLike(like: InsertLike): Promise<Like> {
    const [newLike] = await db.insert(likes).values(like).returning();
    return newLike;
  }

  async deleteLike(postId: number, userId: number): Promise<void> {
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, userId)
        )
      );
  }

  async getLikesByPost(postId: number): Promise<Like[]> {
    return await db
      .select()
      .from(likes)
      .where(eq(likes.postId, postId));
  }

  async checkUserLiked(postId: number, userId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, userId)
        )
      );
    return !!like;
  }
  
  // Follow methods
  async createFollow(follow: InsertFollow): Promise<Follow> {
    const [newFollow] = await db.insert(follows).values(follow).returning();
    return newFollow;
  }

  async deleteFollow(followerId: number, followingId: number): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  }

  async getFollowers(userId: number): Promise<User[]> {
    const followers = await db
      .select({
        follower: users
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
    
    return followers.map(f => f.follower);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const following = await db
      .select({
        following: users
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
    
    return following.map(f => f.following);
  }

  async checkUserFollows(followerId: number, followingId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    return !!follow;
  }
  
  // Event methods
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event || undefined;
  }

  async listEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .orderBy(events.date);
  }

  async getEventsByUser(userId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.createdBy, userId))
      .orderBy(events.date);
  }
  
  // DateBooking methods
  async createDateBooking(booking: InsertDateBooking): Promise<DateBooking> {
    const [newDateBooking] = await db.insert(dateBookings).values(booking).returning();
    return newDateBooking;
  }

  async getDateBooking(id: number): Promise<DateBooking | undefined> {
    const [dateBooking] = await db
      .select()
      .from(dateBookings)
      .where(eq(dateBookings.id, id));
    return dateBooking || undefined;
  }

  async updateDateBookingStatus(id: number, status: string): Promise<DateBooking | undefined> {
    const [updatedBooking] = await db
      .update(dateBookings)
      .set({ status })
      .where(eq(dateBookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async getDateBookingsByUser(userId: number): Promise<DateBooking[]> {
    return await db
      .select()
      .from(dateBookings)
      .where(
        or(
          eq(dateBookings.requesterId, userId),
          eq(dateBookings.recipientId, userId)
        )
      )
      .orderBy(desc(dateBookings.createdAt));
  }
  
  // EventAttendee methods
  async createEventAttendee(attendee: InsertEventAttendee): Promise<EventAttendee> {
    const [newEventAttendee] = await db.insert(eventAttendees).values(attendee).returning();
    return newEventAttendee;
  }

  async updateEventAttendeeStatus(eventId: number, userId: number, status: string): Promise<EventAttendee | undefined> {
    const [updatedAttendee] = await db
      .update(eventAttendees)
      .set({ status })
      .where(
        and(
          eq(eventAttendees.eventId, eventId),
          eq(eventAttendees.userId, userId)
        )
      )
      .returning();
    return updatedAttendee || undefined;
  }

  async getEventAttendees(eventId: number): Promise<EventAttendee[]> {
    return await db
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, eventId));
  }

  async getUserEventStatus(eventId: number, userId: number): Promise<string | undefined> {
    const [attendee] = await db
      .select()
      .from(eventAttendees)
      .where(
        and(
          eq(eventAttendees.eventId, eventId),
          eq(eventAttendees.userId, userId)
        )
      );
    return attendee?.status;
  }
}

// Comment out the MemStorage instance and use DatabaseStorage instead
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
