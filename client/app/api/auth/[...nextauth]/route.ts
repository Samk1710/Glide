import NextAuth, { NextAuthOptions } from "next-auth"
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    TwitterProvider({
      clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_TWITTER_CLIENT_SECRET!,
      version: "2.0", // opt into Twitter API v2
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: "users.read tweet.read offline.access",
          response_type: "code",
          code_challenge_method: "S256",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      if (profile) {
        console.log("Twitter Profile:", profile);
        // Handle Twitter v2 API profile structure
        const twitterProfile = profile as any;
        token.picture = twitterProfile.profile_image_url || twitterProfile.data?.profile_image_url
        token.username = twitterProfile.username || twitterProfile.data?.username
        token.name = twitterProfile.name || twitterProfile.data?.name
        token.id = twitterProfile.id || twitterProfile.data?.id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken as string
      }
      if (token.picture && session.user) {
        session.user.image = token.picture as string
      }
      if (token.username && session.user) {
        (session.user as any).username = token.username as string
      }
      if (token.name && session.user) {
        session.user.name = token.name as string
      }
      if (token.id && session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect back to the homepage after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };