import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string
    }
  }

  interface JWT {
    accessToken?: string
    username?: string
    picture?: string
  }

  interface Profile {
    picture?: string
    profile_image_url?: string
    username?: string
  }
}
