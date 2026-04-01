import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// .env मधून बॅकएंड URL मिळवणे
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://trustrent-backend.onrender.com";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // 👇 🟢 VIP FIX: गुगल नेहमी अकाउंट निवडायचा पॉपअप दाखवेल
      authorization: {
        params: {
          prompt: "select_account",
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        try {
          // 👈 🟢 आता बॅकएंड Render वर कॉल जाईल
          const response = await fetch(`${BACKEND_URL}/api/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // 👈 🟢 Backend कडून आलेला डेटा 'user' ऑब्जेक्टमध्ये सेव्ह करा
            // जेणेकरून तो पुढे 'jwt' मध्ये वापरता येईल
            user.backendData = data;
            user.isNewUser = data.isNewUser;
            
            console.log("✅ Backend Response (Google Login):", data);
            return true;
          } else {
            console.error("❌ Backend error during Google Login:", response.status);
            return false;
          }
        } catch (error) {
          console.error("❌ Backend connection error (Google Login):", error);
          return false;
        }
      }
      return true;
    },

    // 🔄 सेशन मॅनेजमेंट
    async jwt({ token, user }: any) {
      if (user) {
        token.backendData = user.backendData;
        token.isNewUser = user.isNewUser;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).backendData = token.backendData;
        (session.user as any).isNewUser = token.isNewUser;
      }
      return session;
    },
  },
  // .env मध्ये NEXTAUTH_SECRET="Anway1234" असायला हवं
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };