import NextAuth, { NextAuthOptions, RequestInternal, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import OFUser from "@/app/models/usermodel";
import { connectDB } from "@/lib/mongoose";
import bcrypt from "bcryptjs";

async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername.toLowerCase().replace(/\s+/g, "_");
  let count = 0;
  while (await OFUser.findOne({ username })) {
    count++;
    console.log(`Trying username: ${username}_${count}`);
    username = `${baseUsername.toLowerCase().replace(/\s+/g, "_")}_${count}`;
  }
  return username;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _req: Pick<RequestInternal, "headers" | "body" | "query" | "method">
      ): Promise<User | null> {

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
    
        try {
          await connectDB();
          console.log("Logging in with:", credentials.email);
          const user = await OFUser.findOne({
            email: credentials.email,
            oauthProvider: "credentials"
          }).select("+password");
          console.log("Found user:", user);
          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }
     
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    
          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }
    
          // Return properly typed User object
          const fullUser = user.toObject();
          fullUser._id = user._id.toString();
          return fullUser as User
        } catch (error) {
          console.error("Credentials auth error:", error);
          throw error;
        }
      }
    })
    
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("Sign in callback triggered:", { user, account });
      console.log("Environment check - GOOGLE_CLIENT_ID:", !!process.env.GOOGLE_CLIENT_ID);
      console.log("Environment check - MONGO_URI:", !!process.env.MONGO_URI);
      
      try {
        await connectDB();
      } catch (error) {
        console.error("Database connection error in signIn:", error);
        return false;
      }

      const provider = account?.provider;
      const providerId = account?.providerAccountId;

      let existingUser;

      if (provider === "google") {
        existingUser = await OFUser.findOne({ email: user.email });

        if (!existingUser) {
          const usernameBase = user.name || `google_user_${providerId}`;
          const uniqueUsername = await generateUniqueUsername(usernameBase);
          existingUser = await OFUser.create({
            email: user.email,
            username: uniqueUsername,
            name: user.name,
            avatar: user.image,
            oauthProvider: "google",
            oauthId: providerId,
            emailVerified: true, // OAuth emails are pre-verified
          });
        }

        user._id = existingUser._id.toString();
        user.email = existingUser.email;
        // Type assertion to add custom properties
        user.membership = existingUser.membership;
      }

      if (provider === "twitter") {
        const twitterId = providerId;
        const fallbackEmail = "";

        existingUser = await OFUser.findOne({ oauthId: twitterId });

        if (!existingUser) {
          const usernameBase = user.name || `twitter_user_${twitterId}`;
          const uniqueUsername = await generateUniqueUsername(usernameBase);
          existingUser = await OFUser.create({
            email: fallbackEmail,
            username: uniqueUsername,
            name: user.name,
            avatar: user.avatarKey,
            oauthProvider: "twitter",
            oauthId: twitterId,
            emailVerified: true, // OAuth emails are pre-verified
          });
        }

        user._id = existingUser._id.toString();
        user.email = existingUser.email;
        // Type assertion to add custom properties
        (user as User).membership = existingUser.membership;
      }

      if (provider === "credentials") {
        // For credentials, the user verification is already handled in authorize()
        // Just ensure we have the user data
        if (!user._id) {
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        // Completely replace old token values
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          membership: user.membership ?? false,
          accessToken: account?.access_token ?? null,
        };
      }
      // Keep token as is only if it's valid
      return token;
    },

    async session({ session, token }) {
      console.log("[Session] Callback triggered with token:", token);
    
      if (!token || !session.user) return session;
    
      try {
        await connectDB();
    
        // Always fetch by ID, ignore email/sub for safety
        const user = await OFUser.findById(token.id);
    
        let isCreator = false;
        if (user) {
          const creator = await (await import("@/app/models/creatormodel")).default.findOne({ email: user.email });
          isCreator = !!creator;
    
          session.user._id = user._id.toString();
          session.user.username = user.username;
          session.user.email = user.email;
          session.user.avatarKey = user.avatarKey;
          session.user.name = user.name;
          session.user.membership = user.membership;
          session.user.hasAccess = user.hasAccess;
          session.user.lastUsernameChange = user.lastUsernameChange;
          session.user.isUsernameChangeBlocked = user.isUsernameChangeBlocked;
          session.user.subscriptions = user.subscriptions || [];
          session.user.notifications = user.notifications || [];
          session.user.following = user.following || [];
          session.user.creator = isCreator;
          session.user.bio = user.bio;
          session.user.emailVerified = user.emailVerified;
          session.user.location = user.location;
          session.user.createdAt = user.createdAt;
          session.user.wallet = user.wallet;
          session.user.paymentmethods = user.paymentmethods;
        }
    
        (session as Session).accessToken = token.accessToken as string;
        return session;
      } catch (err) {
        console.error("[Session] Error fetching user:", err);
        return session;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/discover`;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);