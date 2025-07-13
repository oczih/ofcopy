import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import WalkUser from "@/app/models/usermodel";
import { connectDB } from "@/lib/mongoose";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
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
        existingUser = await WalkUser.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await WalkUser.create({
            email: user.email,
            username: user.name?.replace(/\s+/g, "_").toLowerCase() || `google_user_${providerId}`,
            name: user.name,
            image: user.image,
            oauthProvider: "google",
            oauthId: providerId,
          });
        }

        user.id = existingUser._id.toString();
        user.email = existingUser.email;
        user.membership = existingUser.membership;
      }

      if (provider === "twitter") {
        const twitterId = providerId;
        const fallbackEmail = "";

        existingUser = await WalkUser.findOne({ oauthId: twitterId });

        if (!existingUser) {
          existingUser = await WalkUser.create({
            email: fallbackEmail,
            username: user.name || `twitter_user_${twitterId}`,
            name: user.name,
            image: user.image,
            oauthProvider: "twitter",
            oauthId: twitterId,
          });
        }

        user.id = existingUser._id.toString();
        user.email = existingUser.email;
        user.membership = existingUser.membership;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      console.log("[JWT] Callback triggered with:", { 
        hasUser: !!user, 
        hasAccount: !!account, 
        currentTokenId: token.id,
        currentTokenEmail: token.email 
      });
    
      if (account) {
        token.accessToken = account.access_token;
      }
    
      if (user) {
        // The user object should now have the correct ID from the signIn callback
        token.id = user.id;
        console.log("[JWT] Setting token ID:", token.id, "from user object");
        token.username = user.username;
        token.email = user.email;
        token.membership = user.membership ?? false;
      } else {
        // Preserve existing token data when no user object is provided
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

      const user = await WalkUser.findOne({
        $or: [{ email: token.email }, { oauthId: token.sub }],
      });

      if (user) {
        console.log("[Session] Found user:", user._id.toString(), "Token ID:", token.id);
        session.user.id = user._id.toString();
        session.user.username = user.username;
        session.user.email = user.email;
        session.user.image = user.image;
        session.user.name = user.name;
        session.user.age = user.age;
        session.user.googleId = user.googleId;
        session.user.membership = user.membership;
        session.user.hasAccess = user.hasAccess;
        session.user.lastUsernameChange = user.lastUsernameChange;
        session.user.isUsernameChangeBlocked = user.isUsernameChangeBlocked;
      } else {
        console.log("[Session] No user found in database");
      }
      
      
      session.accessToken = token.accessToken as string;
      
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/subscribe`;
    },
  },
});
