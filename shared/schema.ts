import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  occupation: text("occupation"),
  profilePicture: text("profile_picture"),
  interests: text("interests").array(),
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
  date: timestamp("date").notNull(),
  imageUrl: text("image_url"),
  createdBy: integer("created_by").notNull(),
  eventType: text("event_type").notNull(), // dating, social, etc.
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
