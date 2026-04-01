import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // 👇 🟢 VIP FIX: हे ऍड केल्याने गुगल नेहमी अकाउंट निवडायचा पॉपअप दाखवेल!
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
          // 👈 🟢 BACKEND LA CALL KARUYA
          const response = await fetch("http://localhost:8080/api/auth/google-login", {
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
            
            // 👈 🟢 VIP: Backend kadhun aalela data 'user' object madhe temp save kara
            // Jyane to 'jwt' callback madhe access karta yeil
            user.backendData = data;
            user.isNewUser = data.isNewUser;
            
            console.log("✅ Backend Response:", data);
            return true;
          } else {
            console.error("❌ Backend error during Google Login");
            return false;
          }
        } catch (error) {
          console.error("❌ Backend connection error:", error);
          return false;
        }
      }
      return true;
    },

    // 🔄 SESSION MADHE DATA PATHVNYASTHI HYA DON METHODS GARJECHYA AHET
    async jwt({ token, user }: any) {
      // Jevha user login hoto, tevha backend cha data token madhe taka
      if (user) {
        token.backendData = user.backendData;
        token.isNewUser = user.isNewUser;
      }
      return token;
    },

    async session({ session, token }: any) {
      // Token madhla data session madhe taka jyane to LoginPage chya 'useSession' madhe disel
      if (session.user) {
        (session.user as any).backendData = token.backendData;
        (session.user as any).isNewUser = token.isNewUser;
      }
      return session;
    },
  },
  // Security sathi secret takayla visru nako
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };