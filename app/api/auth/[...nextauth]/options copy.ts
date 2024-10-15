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
    async jwt(payload: any) {
      const { token: tokenJWT, user: userJWT, account, trigger } = payload;
      console.log("JWT PAYLOAD", payload);
      if (trigger === "signIn" && account.type === "credentials") {
        let user = userJWT.user;
        let tokenData = userJWT.token;
        let token = {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          tokenExpires: tokenData.expiresIn,
        };

        try {
          return {
            token,
            user,
          };
        } catch (error) {
          throw new Error("Error setting up session");
        }
      }

      // console.log("TOEKEN", tokenJWT);
      const shouldRefreshTime = Math.round(
        tokenJWT.token.tokenExpires - Date.now()
      );

      console.log(
        "Check For Refersh",
        shouldRefreshTime,
        tokenJWT.token.refreshToken
      );

      if (shouldRefreshTime < 0) {
        console.log("refresh token", tokenJWT.token.refreshToken);
        try {
          let payload = {};
          let headers = {
            "Content-Type": "application/json",
            Authorization: tokenJWT.token.refreshToken,
          };

          let ResponseTokenRefresh = await refreshToken(payload, headers);
          console.log("Refersh Token", ResponseTokenRefresh);
          if (ResponseTokenRefresh.data.status === "success") {
            let data = ResponseTokenRefresh.data.data;
            console.log("Response Refersh", data);
            let token = {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              tokenExpires: data.expiresIn,
            };
            return {
              ...tokenJWT,
              token,
            };
          }
        } catch (error) {
          throw new Error("Token refresh failed");
        }
      }

      return { ...tokenJWT };
    },
    async session(payload: any) {
      // const { token } = payload;
      return {
        user: payload.token.user,
        // expires: payload.token.token.tokenExpires,
        // ...token,
      };
    },
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG || false,
};
