import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "./supabase";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // HARDCODED SUPER ADMIN LOGIN
                if (credentials?.email === "admin" && credentials?.password === "admin") {
                    return {
                        id: "super-admin-id",
                        email: "admin@kkplain.com",
                        name: "Super Admin",
                        role: "SUPER_ADMIN",
                    };
                }

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                // Search for user in Supabase 'users' table
                const { data: user, error } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .eq('email', credentials.email)
                    .single();

                if (error || !user) {
                    throw new Error("User not found");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                // CHECK AUTHORIZATION FOR ADMIN ACCOUNTS
                if (user.role === "ADMIN" && !user.is_authorized) {
                    throw new Error("Your account is pending authorization from the Super Admin.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
