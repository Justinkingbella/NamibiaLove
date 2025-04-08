import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import {
  loginSchema,
  registerSchema,
  insertMessageSchema,
  insertPostSchema,
  insertCommentSchema,
  insertLikeSchema,
  insertFollowSchema,
  insertStorySchema,
  insertDateBookingSchema,
  insertEventAttendeeSchema,
  insertEventSchema
} from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY - Stripe payment features will not work');
}

// Initialize Stripe and handle potential type issues with TypeScript
let stripe: Stripe | undefined;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { 
      apiVersion: "2023-10-16" as any 
    });
    console.log("Stripe initialized successfully");
  } else {
    console.warn("No Stripe secret key found");
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error);
}
import { z } from "zod";
import { ZodError } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { formatISO } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Configure session
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "namibialove-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        secure: process.env.NODE_ENV === "production",
        httpOnly: true
      }
    })
  );

  // WebSocket for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active connections with user IDs
  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws) => {
    let userId: number | null = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate') {
          userId = data.userId;
          clients.set(userId, ws);
          console.log(`User ${userId} connected to WebSocket`);
        } else if (data.type === 'message' && userId) {
          // Validate and create the message
          const messageData = insertMessageSchema.parse({
            senderId: userId,
            receiverId: data.receiverId,
            content: data.content,
            read: false
          });
          
          const savedMessage = await storage.createMessage(messageData);
          
          // Send to the recipient if they're online
          const recipientWs = clients.get(data.receiverId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'message',
              message: savedMessage
            }));
          }
          
          // Send confirmation back to the sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: savedMessage
          }));
        } else if (data.type === 'typing' && userId) {
          // Send typing indicator to recipient
          const recipientWs = clients.get(data.receiverId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'typing',
              senderId: userId
            }));
          }
        } else if (data.type === 'read_messages' && userId) {
          // Mark messages as read
          await storage.markMessagesAsRead(data.senderId, userId);
          
          // Notify the original sender that messages were read
          const senderWs = clients.get(data.senderId);
          if (senderWs && senderWs.readyState === WebSocket.OPEN) {
            senderWs.send(JSON.stringify({
              type: 'messages_read',
              readBy: userId
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });
  });

  // Helper for handling validation errors
  const handleValidationError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors
      });
    }
    
    console.error("Server error:", err);
    return res.status(500).json({ message: "Internal server error" });
  };

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create the user (omit confirmPassword)
      const { confirmPassword, ...userToCreate } = userData;
      const newUser = await storage.createUser(userToCreate);
      
      // Set session
      req.session.userId = newUser.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(loginData.username);
      if (!user || user.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // User routes
  app.get('/api/users', requireAuth, async (req, res) => {
    try {
      const users = await storage.listUsers();
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/users/:id', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.patch('/api/users/:id', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow users to update their own profile
      if (req.session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Match routes
  app.post('/api/matches', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const targetUserId = parseInt(req.body.userId);
      
      // Check if match already exists
      const existingMatch = await storage.getMatch(userId, targetUserId);
      
      if (existingMatch) {
        if (existingMatch.userId1 === userId && existingMatch.status === "pending") {
          return res.status(400).json({ message: "You already liked this user" });
        } else if (existingMatch.userId2 === userId && existingMatch.status === "pending") {
          // This is a mutual match
          const updatedMatch = await storage.updateMatchStatus(existingMatch.id, "matched");
          return res.json({ ...updatedMatch, isNewMatch: true });
        } else if (existingMatch.status === "matched") {
          return res.status(400).json({ message: "You are already matched with this user" });
        } else if (existingMatch.status === "rejected") {
          return res.status(400).json({ message: "This match was rejected" });
        }
      }
      
      // Create new pending match
      const newMatch = await storage.createMatch({
        userId1: userId,
        userId2: targetUserId,
        status: "pending"
      });
      
      res.status(201).json(newMatch);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/matches', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const matches = await storage.getMatchesByUser(userId);
      res.json(matches);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.patch('/api/matches/:id', requireAuth, async (req, res) => {
    try {
      const matchId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      const status = req.body.status;
      
      if (!status || !['matched', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedMatch = await storage.updateMatchStatus(matchId, status);
      
      if (!updatedMatch) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      res.json(updatedMatch);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Message routes
  app.get('/api/messages/:userId', requireAuth, async (req, res) => {
    try {
      const currentUserId = req.session.userId as number;
      const otherUserId = parseInt(req.params.userId);
      
      const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      
      // Mark messages from the other user as read
      await storage.markMessagesAsRead(otherUserId, currentUserId);
      
      res.json(messages);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.post('/api/messages', requireAuth, async (req, res) => {
    try {
      const senderId = req.session.userId as number;
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
        read: false
      });
      
      const savedMessage = await storage.createMessage(messageData);
      res.status(201).json(savedMessage);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/conversations', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      const conversations = await storage.getConversations(userId);
      
      // Fetch user details for each conversation
      const conversationsWithUsers = await Promise.all(
        conversations.map(async (conv) => {
          const user = await storage.getUser(conv.userId);
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          
          return {
            user: userWithoutPassword,
            lastMessage: conv.lastMessage
          };
        })
      );
      
      // Filter out any null entries and sort by most recent message
      const validConversations = conversationsWithUsers
        .filter(Boolean)
        .sort((a, b) => 
          new Date(b!.lastMessage.createdAt).getTime() - 
          new Date(a!.lastMessage.createdAt).getTime()
        );
      
      res.json(validConversations);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/messages/unread/count', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Story routes
  app.post('/api/stories', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Set expiry to 24 hours from now
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const storyData = insertStorySchema.parse({
        ...req.body,
        userId,
        expiresAt
      });
      
      const savedStory = await storage.createStory(storyData);
      res.status(201).json(savedStory);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/stories', requireAuth, async (req, res) => {
    try {
      const activeStories = await storage.getActiveStories();
      
      // Group stories by user
      const storiesByUser = new Map<number, any[]>();
      
      for (const story of activeStories) {
        if (!storiesByUser.has(story.userId)) {
          storiesByUser.set(story.userId, []);
        }
        storiesByUser.get(story.userId)!.push(story);
      }
      
      // Fetch user details for each group
      const result = await Promise.all(
        Array.from(storiesByUser.entries()).map(async ([userId, stories]) => {
          const user = await storage.getUser(userId);
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          
          return {
            user: userWithoutPassword,
            stories: stories.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          };
        })
      );
      
      // Filter out any null entries
      const validStoryGroups = result.filter(Boolean);
      
      res.json(validStoryGroups);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/stories/user/:userId', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stories = await storage.getStoriesByUser(userId);
      
      // Filter to only active stories
      const now = new Date();
      const activeStories = stories.filter(story => new Date(story.expiresAt) > now);
      
      res.json(activeStories);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Post routes
  app.post('/api/posts', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      const postData = insertPostSchema.parse({
        ...req.body,
        userId
      });
      
      const savedPost = await storage.createPost(postData);
      res.status(201).json(savedPost);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/posts/feed', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const posts = await storage.getFeedForUser(userId);
      
      // Enhance posts with user, comments, and likes
      const enhancedPosts = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          const comments = await storage.getCommentsByPost(post.id);
          const likes = await storage.getLikesByPost(post.id);
          const userLiked = await storage.checkUserLiked(post.id, userId);
          
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          
          // Enhance comments with user info
          const enhancedComments = await Promise.all(
            comments.map(async (comment) => {
              const commentUser = await storage.getUser(comment.userId);
              if (!commentUser) return null;
              
              const { password, ...commentUserWithoutPassword } = commentUser;
              
              return {
                ...comment,
                user: commentUserWithoutPassword
              };
            })
          );
          
          return {
            ...post,
            user: userWithoutPassword,
            comments: enhancedComments.filter(Boolean),
            likes: likes.length,
            userLiked
          };
        })
      );
      
      // Filter out any null entries
      const validPosts = enhancedPosts.filter(Boolean);
      
      res.json(validPosts);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/posts/user/:userId', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const currentUserId = req.session.userId as number;
      
      const posts = await storage.getPostsByUser(userId);
      
      // Enhance posts with user, comments, and likes
      const enhancedPosts = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          const comments = await storage.getCommentsByPost(post.id);
          const likes = await storage.getLikesByPost(post.id);
          const userLiked = await storage.checkUserLiked(post.id, currentUserId);
          
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          
          return {
            ...post,
            user: userWithoutPassword,
            comments: comments.length,
            likes: likes.length,
            userLiked
          };
        })
      );
      
      // Filter out any null entries
      const validPosts = enhancedPosts.filter(Boolean);
      
      res.json(validPosts);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/posts/:id', requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const user = await storage.getUser(post.userId);
      const comments = await storage.getCommentsByPost(postId);
      const likes = await storage.getLikesByPost(postId);
      const userLiked = await storage.checkUserLiked(postId, userId);
      
      if (!user) {
        return res.status(404).json({ message: "Post user not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      // Enhance comments with user info
      const enhancedComments = await Promise.all(
        comments.map(async (comment) => {
          const commentUser = await storage.getUser(comment.userId);
          if (!commentUser) return null;
          
          const { password, ...commentUserWithoutPassword } = commentUser;
          
          return {
            ...comment,
            user: commentUserWithoutPassword
          };
        })
      );
      
      const enhancedPost = {
        ...post,
        user: userWithoutPassword,
        comments: enhancedComments.filter(Boolean),
        likes: likes.length,
        userLiked
      };
      
      res.json(enhancedPost);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Comment routes
  app.post('/api/comments', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId
      });
      
      const savedComment = await storage.createComment(commentData);
      
      // Get the user info to return with the comment
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      const enhancedComment = {
        ...savedComment,
        user: userWithoutPassword
      };
      
      res.status(201).json(enhancedComment);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/comments/post/:postId', requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      
      const comments = await storage.getCommentsByPost(postId);
      
      // Enhance comments with user info
      const enhancedComments = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          
          return {
            ...comment,
            user: userWithoutPassword
          };
        })
      );
      
      // Filter out any null entries
      const validComments = enhancedComments.filter(Boolean);
      
      res.json(validComments);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Like routes
  app.post('/api/likes', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      const likeData = insertLikeSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if already liked
      const alreadyLiked = await storage.checkUserLiked(likeData.postId, userId);
      
      if (alreadyLiked) {
        // Unlike
        await storage.deleteLike(likeData.postId, userId);
        res.json({ liked: false });
      } else {
        // Like
        await storage.createLike(likeData);
        res.status(201).json({ liked: true });
      }
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Follow routes
  app.post('/api/follows', requireAuth, async (req, res) => {
    try {
      const followerId = req.session.userId as number;
      const followingId = parseInt(req.body.followingId);
      
      // Cannot follow yourself
      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      // Check if already following
      const alreadyFollowing = await storage.checkUserFollows(followerId, followingId);
      
      if (alreadyFollowing) {
        // Unfollow
        await storage.deleteFollow(followerId, followingId);
        res.json({ following: false });
      } else {
        // Follow
        const followData = insertFollowSchema.parse({
          followerId,
          followingId
        });
        
        await storage.createFollow(followData);
        res.status(201).json({ following: true });
      }
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/follows/status/:userId', requireAuth, async (req, res) => {
    try {
      const followerId = req.session.userId as number;
      const followingId = parseInt(req.params.userId);
      
      const isFollowing = await storage.checkUserFollows(followerId, followingId);
      
      res.json({ following: isFollowing });
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/follows/followers/:userId', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const followers = await storage.getFollowers(userId);
      
      // Remove passwords
      const followersWithoutPasswords = followers.map(follower => {
        const { password, ...userWithoutPassword } = follower;
        return userWithoutPassword;
      });
      
      res.json(followersWithoutPasswords);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/follows/following/:userId', requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const following = await storage.getFollowing(userId);
      
      // Remove passwords
      const followingWithoutPasswords = following.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(followingWithoutPasswords);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Stripe payment endpoints
  if (stripe) {
    // One-time payment route
    app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
      try {
        const { planType } = req.body;
        let amount = 999; // Default $9.99
        
        if (planType === 'yearly') {
          amount = 8999; // $89.99 for yearly
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          metadata: {
            userId: req.session.userId?.toString(),
            planType: planType || 'monthly',
            type: 'one-time'
          }
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        console.error('Payment intent error:', error);
        res
          .status(500)
          .json({ message: "Error creating payment intent: " + error.message });
      }
    });

    // Subscription route
    app.post('/api/get-or-create-subscription', requireAuth, async (req, res) => {
      try {
        const userId = req.session.userId!;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // If user already has a stripeCustomerId and stripeSubscriptionId, check subscription status
        if (user.stripeCustomerId && user.stripeSubscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
            
            // If subscription is active, return its info
            if (subscription.status === 'active') {
              return res.json({
                subscriptionId: subscription.id,
                status: subscription.status,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
              });
            }
            
            // If subscription has a pending payment, return its client secret
            if (subscription.latest_invoice?.payment_intent) {
              const paymentIntent = await stripe.paymentIntents.retrieve(
                subscription.latest_invoice.payment_intent as string
              );
              
              return res.json({
                subscriptionId: subscription.id,
                clientSecret: paymentIntent.client_secret,
                status: subscription.status,
              });
            }
          } catch (error) {
            // If the subscription doesn't exist anymore, continue to create a new one
            console.error('Error retrieving subscription:', error);
          }
        }
        
        const { planType } = req.body;
        let priceId;
        
        // In a real application, you would have actual price IDs from Stripe
        // For this demo, we'll use placeholders
        switch(planType) {
          case 'basic':
            priceId = 'price_basic_monthly'; // Replace with your actual price ID
            break;
          case 'premium':
            priceId = 'price_premium_monthly'; // Replace with your actual price ID
            break;
          case 'vip':
            priceId = 'price_vip_monthly'; // Replace with your actual price ID
            break;
          default:
            priceId = 'price_basic_monthly'; // Default price ID
        }

        // If user doesn't have a Stripe customer ID, create one
        let stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.fullName,
            metadata: {
              userId: user.id.toString(),
            }
          });
          
          // Update user with new Stripe customer ID
          stripeCustomerId = customer.id;
          await storage.updateStripeCustomerId(user.id, customer.id);
        }

        // Create a new subscription with a trial period for demo purposes
        // In production, you would use actual price IDs and no automatic trial
        const subscription = await stripe.subscriptions.create({
          customer: stripeCustomerId,
          items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
              },
              unit_amount: planType === 'basic' ? 999 : planType === 'premium' ? 1999 : 2999,
              recurring: {
                interval: 'month',
              },
            },
          }],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
          trial_period_days: 7, // 7-day trial period
          metadata: {
            userId: user.id.toString(),
            planType: planType || 'basic'
          }
        });

        // Update user with subscription ID
        await storage.updateStripeSubscriptionId(user.id, subscription.id);
        
        // Get the client secret from the invoice payment intent
        const invoice = subscription.latest_invoice as any;
        const paymentIntent = invoice.payment_intent as any;
        
        res.json({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent.client_secret,
          trialEnd: new Date(subscription.trial_end! * 1000).toISOString(),
        });
      } catch (error: any) {
        console.error('Subscription error:', error);
        res.status(500).json({ 
          message: "Error creating subscription", 
          error: error.message 
        });
      }
    });

    // Get user subscription status
    app.get('/api/user/subscription', requireAuth, async (req, res) => {
      try {
        const userId = req.session.userId!;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (!user.stripeSubscriptionId) {
          return res.json({ hasSubscription: false });
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          res.json({
            hasSubscription: true,
            status: subscription.status,
            plan: subscription.metadata.planType || 'basic',
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            nextBillingDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
            trialEnd: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString() 
              : null,
          });
        } catch (error) {
          // If subscription can't be retrieved, user doesn't have an active subscription
          return res.json({ hasSubscription: false });
        }
      } catch (error: any) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ 
          message: "Error fetching subscription", 
          error: error.message 
        });
      }
    });

    // Stripe webhook handler to process events
    app.post('/api/webhook', async (req, res) => {
      try {
        const event = req.body; // In production, verify webhook signature
        
        // Handle the event
        switch (event.type) {
          case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Handle successful one-time payment
            if (paymentIntent.metadata?.type === 'one-time' && paymentIntent.metadata?.userId) {
              const userId = parseInt(paymentIntent.metadata.userId);
              if (!isNaN(userId)) {
                // Update user with premium status until a certain date
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 30); // 30 days for monthly
                
                if (paymentIntent.metadata.planType === 'yearly') {
                  expirationDate.setDate(expirationDate.getDate() + 335); // Add the rest of the year
                }
                
                await storage.updatePremiumStatus(userId, true, expirationDate);
              }
            }
            break;
            
          case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            // Handle successful subscription payment
            if (invoice.subscription) {
              const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
              const userId = parseInt(subscription.metadata?.userId);
              
              if (!isNaN(userId)) {
                // Update user with active subscription status
                await storage.updatePremiumStatus(userId, true);
              }
            }
            break;
            
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object;
            const userId = parseInt(subscription.metadata?.userId);
            
            if (!isNaN(userId)) {
              // Update user's subscription status based on the subscription status
              const isActive = subscription.status === 'active' || subscription.status === 'trialing';
              await storage.updatePremiumStatus(userId, isActive);
            }
            break;
            
          default:
            console.log(`Unhandled event type ${event.type}`);
        }
        
        res.json({ received: true });
      } catch (err: any) {
        console.error('Webhook error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
      }
    });
  } else {
    // Stripe not configured - add stub routes for development
    console.warn("Stripe not configured - payment features will be unavailable");
    
    app.post("/api/create-payment-intent", requireAuth, (req, res) => {
      res.status(503).json({ 
        error: true,
        message: "Stripe not configured - payment features unavailable" 
      });
    });
    
    app.post('/api/get-or-create-subscription', requireAuth, (req, res) => {
      res.status(503).json({ 
        error: true,
        message: "Stripe not configured - subscription features unavailable" 
      });
    });
    
    app.get('/api/user/subscription', requireAuth, (req, res) => {
      res.json({ 
        error: true,
        hasSubscription: false, 
        message: "Stripe not configured - subscription features unavailable" 
      });
    });
  }

  // Event routes
  app.get('/api/events', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      const events = await storage.listEvents();
      
      // Enhance events with creator info and attendee count
      const enhancedEvents = await Promise.all(
        events.map(async (event) => {
          const creator = await storage.getUser(event.createdBy);
          const attendees = await storage.getEventAttendees(event.id);
          const userStatus = await storage.getUserEventStatus(event.id, userId);
          
          if (!creator) return null;
          
          const { password, ...creatorWithoutPassword } = creator;
          
          // Filter attendees who are "going"
          const goingAttendees = attendees.filter(att => att.status === "going");
          
          return {
            ...event,
            creator: creatorWithoutPassword,
            attendeeCount: goingAttendees.length,
            userStatus: userStatus || "not_responded"
          };
        })
      );
      
      // Filter out any null entries and only show future events
      const now = new Date();
      const validEvents = enhancedEvents
        .filter(Boolean)
        .filter(event => new Date(event!.date) > now);
      
      res.json(validEvents);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.post('/api/events', requireAuth, async (req, res) => {
    try {
      const createdBy = req.session.userId as number;
      
      // Parse and format the date properly for the database
      const eventData = insertEventSchema.parse({
        ...req.body,
        createdBy,
        date: new Date(req.body.date)
      });
      
      const savedEvent = await storage.createEvent(eventData);
      res.status(201).json(savedEvent);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.post('/api/events/:eventId/attend', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const eventId = parseInt(req.params.eventId);
      const status = req.body.status;
      
      if (!status || !['going', 'maybe', 'not_going'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Check if user already has a status for this event
      const existingStatus = await storage.getUserEventStatus(eventId, userId);
      
      if (existingStatus) {
        // Update existing status
        const updatedAttendee = await storage.updateEventAttendeeStatus(eventId, userId, status);
        res.json(updatedAttendee);
      } else {
        // Create new attendee record
        const attendeeData = insertEventAttendeeSchema.parse({
          eventId,
          userId,
          status
        });
        
        const savedAttendee = await storage.createEventAttendee(attendeeData);
        res.status(201).json(savedAttendee);
      }
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Date booking routes
  app.post('/api/date-bookings', requireAuth, async (req, res) => {
    try {
      const requesterId = req.session.userId as number;
      
      const bookingData = insertDateBookingSchema.parse({
        ...req.body,
        requesterId,
        status: "pending"
      });
      
      const savedBooking = await storage.createDateBooking(bookingData);
      res.status(201).json(savedBooking);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.get('/api/date-bookings', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      const bookings = await storage.getDateBookingsByUser(userId);
      
      // Enhance bookings with user info
      const enhancedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const requester = await storage.getUser(booking.requesterId);
          const recipient = await storage.getUser(booking.recipientId);
          
          if (!requester || !recipient) return null;
          
          const { password: requesterPass, ...requesterWithoutPassword } = requester;
          const { password: recipientPass, ...recipientWithoutPassword } = recipient;
          
          return {
            ...booking,
            requester: requesterWithoutPassword,
            recipient: recipientWithoutPassword
          };
        })
      );
      
      // Filter out any null entries
      const validBookings = enhancedBookings.filter(Boolean);
      
      res.json(validBookings);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.patch('/api/date-bookings/:id', requireAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      const status = req.body.status;
      
      if (!status || !['accepted', 'rejected', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get the booking to check permissions
      const booking = await storage.getDateBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only the recipient can accept/reject, only the requester can cancel
      if ((status === 'accepted' || status === 'rejected') && booking.recipientId !== userId) {
        return res.status(403).json({ message: "Only the recipient can accept or reject" });
      }
      
      if (status === 'cancelled' && booking.requesterId !== userId) {
        return res.status(403).json({ message: "Only the requester can cancel" });
      }
      
      const updatedBooking = await storage.updateDateBookingStatus(bookingId, status);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(updatedBooking);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // We're already using the existing WebSocket implementation above
  // No need to add another event handler

  return httpServer;
}
