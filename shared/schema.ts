import { pgTable, text, serial, integer, boolean, timestamp, json, primaryKey, doublePrecision, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  age: integer("age"),
  gender: text("gender"),
  location: text("location"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  occupation: text("occupation"),
  profilePicture: text("profile_picture"),
  interests: text("interests").array(),
  personalityType: text("personality_type"),
  avatarData: json("avatar_data"),
  subscriptionTier: text("subscription_tier").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  pushToken: text("push_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Match table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId1: integer("user_id_1").notNull(),
  userId2: integer("user_id_2").notNull(),
  status: text("status").notNull(), // pending, matched, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// Message table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Story table
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mediaUrl: text("media_url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Post table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comment table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Like table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follow table
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  date: timestamp("date").notNull(),
  imageUrl: text("image_url"),
  createdBy: integer("created_by").notNull(),
  eventType: text("event_type").notNull(), // dating, social, etc.
  capacity: integer("capacity"),
  isFeatured: boolean("is_featured").default(false),
  isVirtual: boolean("is_virtual").default(false),
  videoCallUrl: text("video_call_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// DateBooking table
export const dateBookings = pgTable("date_bookings", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  note: text("note"),
  status: text("status").notNull(), // pending, accepted, rejected, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// EventAttendee table
export const eventAttendees = pgTable("event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // going, maybe, not going
  createdAt: timestamp("created_at").defaultNow(),
});

// Ice breaker suggestions table
export const iceBreakers = pgTable("ice_breakers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  category: text("category").notNull(), // funny, deep, random, flirty, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Personality quiz questions table
export const personalityQuizQuestions = pgTable("personality_quiz_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: json("options").notNull(), // Array of options
  category: text("category").notNull(), // personality, compatibility, interests, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Personality quiz answers table
export const personalityQuizAnswers = pgTable("personality_quiz_answers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video chat sessions table
export const videoChatSessions = pgTable("video_chat_sessions", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull(),
  user2Id: integer("user2_id").notNull(),
  status: text("status").notNull(), // requested, accepted, declined, completed
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  sessionToken: text("session_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  currency: text("currency").default("USD").notNull(),
  interval: text("interval").notNull(), // month, year, etc.
  features: json("features").notNull(), // Array of features
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Push notification table
export const pushNotifications = pgTable("push_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: json("data"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertDateBookingSchema = createInsertSchema(dateBookings).omit({
  id: true,
  createdAt: true,
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).omit({
  id: true,
  createdAt: true,
});

export const insertIceBreakerSchema = createInsertSchema(iceBreakers).omit({
  id: true,
  createdAt: true,
});

export const insertPersonalityQuizQuestionSchema = createInsertSchema(personalityQuizQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertPersonalityQuizAnswerSchema = createInsertSchema(personalityQuizAnswers).omit({
  id: true,
  createdAt: true,
});

export const insertVideoChatSessionSchema = createInsertSchema(videoChatSessions).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertPushNotificationSchema = createInsertSchema(pushNotifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;

export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertDateBooking = z.infer<typeof insertDateBookingSchema>;
export type DateBooking = typeof dateBookings.$inferSelect;

export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;
export type EventAttendee = typeof eventAttendees.$inferSelect;

export type InsertIceBreaker = z.infer<typeof insertIceBreakerSchema>;
export type IceBreaker = typeof iceBreakers.$inferSelect;

export type InsertPersonalityQuizQuestion = z.infer<typeof insertPersonalityQuizQuestionSchema>;
export type PersonalityQuizQuestion = typeof personalityQuizQuestions.$inferSelect;

export type InsertPersonalityQuizAnswer = z.infer<typeof insertPersonalityQuizAnswerSchema>;
export type PersonalityQuizAnswer = typeof personalityQuizAnswers.$inferSelect;

export type InsertVideoChatSession = z.infer<typeof insertVideoChatSessionSchema>;
export type VideoChatSession = typeof videoChatSessions.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertPushNotification = z.infer<typeof insertPushNotificationSchema>;
export type PushNotification = typeof pushNotifications.$inferSelect;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  stories: many(stories),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  comments: many(comments),
  likes: many(likes),
  followedBy: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
  createdEvents: many(events),
  eventAttendees: many(eventAttendees),
  sentDateRequests: many(dateBookings, { relationName: "requester" }),
  receivedDateRequests: many(dateBookings, { relationName: "recipient" }),
  personalityQuizAnswers: many(personalityQuizAnswers),
  videoChatSessions1: many(videoChatSessions, { relationName: "user1" }),
  videoChatSessions2: many(videoChatSessions, { relationName: "user2" }),
  pushNotifications: many(pushNotifications),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  user1: one(users, {
    fields: [matches.userId1],
    references: [users.id],
  }),
  user2: one(users, {
    fields: [matches.userId2],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

export const storiesRelations = relations(stories, ({ one }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  attendees: many(eventAttendees),
}));

export const dateBookingsRelations = relations(dateBookings, ({ one }) => ({
  requester: one(users, {
    fields: [dateBookings.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  recipient: one(users, {
    fields: [dateBookings.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
}));

export const personalityQuizAnswersRelations = relations(personalityQuizAnswers, ({ one }) => ({
  user: one(users, {
    fields: [personalityQuizAnswers.userId],
    references: [users.id],
  }),
  question: one(personalityQuizQuestions, {
    fields: [personalityQuizAnswers.questionId],
    references: [personalityQuizQuestions.id],
  }),
}));

export const personalityQuizQuestionsRelations = relations(personalityQuizQuestions, ({ many }) => ({
  answers: many(personalityQuizAnswers),
}));

export const videoChatSessionsRelations = relations(videoChatSessions, ({ one }) => ({
  user1: one(users, {
    fields: [videoChatSessions.user1Id],
    references: [users.id],
    relationName: "user1",
  }),
  user2: one(users, {
    fields: [videoChatSessions.user2Id],
    references: [users.id],
    relationName: "user2",
  }),
}));

export const pushNotificationsRelations = relations(pushNotifications, ({ one }) => ({
  user: one(users, {
    fields: [pushNotifications.userId],
    references: [users.id],
  }),
}));

// Validation schemas
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
