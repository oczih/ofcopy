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
    
          const user = await OFUser.findOne({
            email: credentials.email,
            oauthProvider: "credentials"
          }).select("+password");
          console.log("usseri", user)
          console.log("Fetched user password hash:", user?.password);
          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }
    
          if (!user.emailVerified) {
            throw new Error("Please verify your email before signing in. Check your inbox for the verification link.");
          }
    
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    
          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }
    
          // Return properly typed User object
          const fullUser = user.toObject();
          fullUser.id = user._id.toString();
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

        user.id = existingUser._id.toString();
        user.email = existingUser.email;
        // Type assertion to add custom properties
        (user as User).membership = existingUser.membership;
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

        user.id = existingUser._id.toString();
        user.email = existingUser.email;
        // Type assertion to add custom properties
        (user as User).membership = existingUser.membership;
      }

      if (provider === "credentials") {
        // For credentials, the user verification is already handled in authorize()
        // Just ensure we have the user data
        if (!user.id) {
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
    
      if (account) {
        token.accessToken = account.access_token;
      }
    
      if (user) {
        token.id = user.id;
        console.log("[JWT] Setting token ID:", token.id, "from user object");
        token.username = (user as User).username;
        token.email = user.email;
        token.membership = (user as User).membership ?? false;
      } else {
        console.log("[JWT] No user object, preserving existing token ID:", token.id);
      }
    
      return token;
    },

    async session({ session, token }) {
      console.log("[Session] Callback triggered with token:", { 
        hasEmail: !!token?.email, 
        hasSub: !!token?.sub, 
        tokenId: token?.id,
        tokenEmail: token?.email 
      });
      
      if (!token?.email && !token?.sub) {
        console.log("[Session] No email or sub in token, returning session as is");
        return session;
      }

      try {
        await connectDB();
      } catch (error) {
        console.error("Database connection error in session:", error);
        return session;
      }

      console.log("[Session] Looking for user with token.email:", token.email, "token.sub:", token.sub, "token.id:", token.id);

      const user = await OFUser.findOne({
        $or: [
          { email: token.email }, 
          { oauthId: token.sub },
          { _id: token.id } // Also search by ID for credentials users
        ],
      });
      // Check if user is a creator
      let isCreator = false;
      if (user) {
        const creator = await (await import("@/app/models/creatormodel")).default.findOne({ email: user.email });
        isCreator = !!creator;
      }

      if (user) {
        console.log("[Session] Found user:", user._id.toString(), "Token ID:", token.id);
      
        // Type assertion to add custom properties to session
        session.user.id = user._id.toString();
        session.user.username = user.username;
        session.user.email = user.email;
        session.user.avatarKey = user.avatarKey;
        session.user.name = user.name;
        session.user.age = user.age;
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
      } else {
        console.log("[Session] No user found in database");
      }
      
      (session as Session).accessToken = token.accessToken as string;
      
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/discover`;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);