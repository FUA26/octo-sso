import CredentialsProvider from "next-auth/providers/credentials";
import { login, refreshToken } from "@/services/auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "User", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Credentials not provided");
        }
        let loginResponse = await login({
          email: credentials.email,
          password: credentials.password,
        });
        // console.log(loginResponse.data);
        if (loginResponse.status === 200) {
          return loginResponse.data.data;
        }

        throw new Error("Login failed");
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login",
    signUp: "/signup",
  },

  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (trigger === "signIn" && account.type === "credentials") {
        const userData = user.user;
        const tokenData = user.token;
        const tokenExpires = tokenData.expiresIn;

        console.log(
          "New Token Expires At:",
          new Date(tokenExpires).toISOString()
        );

        return {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          tokenExpires,
          user: userData,
        };
      }
      console.log("Expires At:", token.tokenExpires);
      console.log("Now:", Date.now());
      console.log("IF Else:", Date.now() > token.tokenExpires);
      if (Date.now() > token.tokenExpires) {
        console.log("Token has expired.");
        // Tambahkan logika tambahan jika diperlukan
        return { ...token };
      }

      return token;
    },

    async session({ session, token }) {
      console.log(
        "Session Expires At:",
        new Date(token.tokenExpires).toISOString()
      );
      session.user = token.user;
      session.expires = new Date(token.tokenExpires).toISOString();
      return session;
    },
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG || false,
};
