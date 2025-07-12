import { Auth } from "@auth/core";
import Google from "@auth/core/providers/google";
import Twitter from "@auth/core/providers/twitter";
import OFUser from "@/app/models/usermodel";
import { connectDB } from "@/lib/mongoose";
import type { User as NextAuthUser, Account, Profile } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  } as { strategy: 'jwt'; maxAge: number; updateAge: number },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn(params: { user: NextAuthUser; account?: Account | null; profile?: Profile; email?: { verificationRequest?: boolean }; credentials?: Record<string, unknown> }) {
      const { user, account } = params;
      await connectDB();

      const provider = account?.provider;
      const providerId = account?.providerAccountId;

      let existingUser;

      if (provider === "google") {
        existingUser = await OFUser.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await OFUser.create({
            email: user.email,
            username: user.name?.replace(/\s+/g, "_").toLowerCase() || `google_user_${providerId}`,
            name: user.name,
            image: user.image,
            oauthProvider: "google",
            oauthId: providerId,
          });
        }

        user.email = existingUser.email;
        user.membership = existingUser.membership;
      }

      if (provider === "twitter") {
        const twitterId = providerId;
        const fallbackEmail = "";

        existingUser = await OFUser.findOne({ oauthId: twitterId });

        if (!existingUser) {
          existingUser = await OFUser.create({
            email: fallbackEmail,
            username: user.name || `twitter_user_${twitterId}`,
            name: user.name,
            image: user.image,
            oauthProvider: "twitter",
            oauthId: twitterId,
          });
        }

        user.email = existingUser.email;
        user.membership = existingUser.membership;
      }

      return true;
    },

    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.membership = user.membership ?? false;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (!token?.email && !token?.sub) return session;

      await connectDB();

      const user = await OFUser.findOne({
        $or: [{ email: token.email }, { oauthId: token.sub }],
      });

      if (user) {
        session.user.id = user._id.toString();
        session.user.username = user.username;
        session.user.email = user.email;
        session.user.image = user.image;
        session.user.name = user.name;
        session.user.age = user.age;
        session.user.weight = user.weight;
        session.user.height = user.height;
        session.user.gender = user.gender;
        session.user.activityLevel = user.activityLevel;
        session.user.goal = user.goal;
        session.user.goalWeight = user.goalWeight;
        session.user.googleId = user.googleId;
        session.user.pace = user.pace;
        session.user.membership = user.membership;
        session.user.hasAccess = user.hasAccess;
        session.user.lastUsernameChange = user.lastUsernameChange;
        session.user.isUsernameChangeBlocked = user.isUsernameChangeBlocked;
      }

      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/subscribe`;
    },
  },
};

const handler = (req: Request) => Auth(req, authOptions);
export { handler };
export { authOptions };
