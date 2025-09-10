import NextAuth, { NextAuthOptions, RequestInternal,  User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import OFUser from "@/app/models/usermodel";
import { connectDB } from "@/lib/mongoose";
import bcrypt from "bcryptjs";
import { geolocation } from "@vercel/functions";
import { headers } from "next/headers";

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
            avatar: user.image,
            oauthProvider: provider,  // "google" or "twitter"
            oauthId: providerId,
            emailVerified: true,
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
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          membership: user.membership ?? false,
          accessToken: account?.access_token ?? null,
          oauthProvider: user.oauthProvider,
        };
      }
      try {
        const geo = geolocation(new Request("http://dummy", { headers: await headers() }));

        const countryToCurrency: Record<string, string> = {
          US: "USD",
          GB: "GBP",
          DE: "EUR",
          IN: "INR",
          JP: "JPY",
        };

        token.geo = {
          country: geo.country ?? "",
          region: geo.region ?? "",
          city: geo.city ?? "",
          latitude: geo.latitude ?? null,
          longitude: geo.longitude ?? null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          currency: geo.country ? countryToCurrency[geo.country] ?? "" : "",
        };
      } catch (e) {
        console.error("Geolocation failed:", e);
      }
      return token;
    },

    async session({ session, token }) {
      if (!token || !session.user) return session;
    
      try {
        await connectDB();
    
        const user = await OFUser.findById(token.id);
    
        let isCreator = false;

        if (user) {
          const creatorModel = await import("@/app/models/creatormodel");
          const creator = await creatorModel.default.findOne({ email: user.email });
          isCreator = !!creator;
    
          // Map safely to session.user
          session.user._id = user._id.toString();
          session.user.username = user.username ?? "";
          session.user.email = user.email ?? "";
          session.user.avatarKey = user.avatarKey ?? "";
          session.user.name = user.name ?? "";
          session.user.membership = user.membership ?? false;
          session.user.hasAccess = user.hasAccess ?? false;
          session.user.lastUsernameChange = user.lastUsernameChange ?? null;
          session.user.isUsernameChangeBlocked = user.isUsernameChangeBlocked ?? false;
          session.user.subscriptions = user.subscriptions ?? [];
          session.user.notifications = user.notifications ?? [];
          session.user.following = user.following ?? [];
          session.user.creator = isCreator;
          session.user.bio = user.bio ?? "";
          session.user.emailVerified = user.emailVerified ?? false;
          session.user.location = user.location ?? "";
          session.user.createdAt = user.createdAt ?? new Date();
          session.user.wallet = user.wallet ?? 0;
          session.user.paymentmethods = user.paymentmethods ?? [];
          session.user.oauthProvider = token.oauthProvider as string;
        }
        try {
          const geo = geolocation(new Request("http://dummy", { headers: await headers() }));
          const reqHeaders = await headers(); // ✅ headers() is synchronous
const ip =
  reqHeaders.get("x-forwarded-for")?.split(",")[0] ||
  reqHeaders.get("x-real-ip") ||
  "unknown";
          const countryToCurrency: Record<string, string> = {
            US: "USD",
            GB: "GBP",
            DE: "EUR",
            IN: "INR",
            JP: "JPY",
          };

          session.user.location = {
            ip,
            country: geo.country ?? "",
            region: geo.region ?? "",
            city: geo.city ?? "",
            latitude: geo.latitude ?? null,
            longitude: geo.longitude ?? null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            utcOffset: -new Date().getTimezoneOffset() / 60, 
            currency: geo.country ? countryToCurrency[geo.country] ?? "" : "",
          };
        } catch (err) {
          console.error("Geolocation failed:", err);
          session.user.location = {
            ip: "unknown",
            country: "",
            region: "",
            city: "",
            latitude: null,
            longitude: null,
            timezone: "",
            currency: "",
          };
        }
        session.accessToken = token.accessToken as string | undefined;
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