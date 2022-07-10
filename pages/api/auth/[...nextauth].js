import spotifyApi from "lib/spotify"
import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import SpotifyWebApi from "spotify-web-api-node"
import { LOGIN_URL } from "lib/spotify"

const refreshAccessToken = async(token) => {
    try {
        SpotifyWebApi.setAccessToken(token.accessToken),
        SpotifyWebApi.setRefreshToken(token.refreshToken)

        const { body: refreshedToken } = await spotifyApi.refreshAccessToken()

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now + refreshedToken.expires_in * 1000,
            refreshToken: refreshedToken.refresh_token ?? token.refresh_token
        }
        
    } catch(e) {
        return {
            ...token,
            error: "Refresh access token error"
        }
    }
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL
    }),
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: '/login'
  },
  callbacks:{
    async jwt({ token, account, user}) {
        if (account && user) {
            return {
                ...token,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                accessTokenExpires: account.expires_at * 1000
            }   
        }

        if(Date.now < token.accessTokenExpires){
            return token;
        }

        return await refreshAccessToken(token)
    },
    async session({ session, token }) {
        session.user.accessToken = token.accessToken
        session.user.refreshToken = token.refreshToken,
        session.user.username = token.username

        return session;
    }
  }
})