import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github"
import { getUserByEmail } from "./data/user";
import { loginFormSchema } from "./schema/auth.schema";

// Use Web Crypto API instead of bcryptjs for Edge Runtime compatibility
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // For development, you might want to use a simpler comparison
    // In production, implement proper password verification
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // This is a simplified approach - in production you'd want proper salt + hash
    return hashHex === hashedPassword;
  } catch {
    return false;
  }
}

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),

    Credentials({
      async authorize(credentials) {
        const validatedFields = loginFormSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const user = await getUserByEmail(email);
        if (!user || !user.password) return null;

        const isPasswordCorrect = await verifyPassword(password, user.password);
        if (!isPasswordCorrect) return null;

        return user;
      }
    })
  ],
  experimental: {
    enableWebAuthn: false,
  },
} satisfies NextAuthConfig
