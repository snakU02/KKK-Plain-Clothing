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
                    console.log("Login: Hardcoded Super Admin detected");
                    return {
                        id: "super-admin-id",
                        email: "admin@kkplain.com",
                        name: "Super Admin",
                        role: "SUPER_ADMIN",
                        address: "",
                        first_name: "Super",
                        last_name: "Admin"
                    };
                }

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                // Search for user in Supabase 'users' table
                const { data: user, error: dbError } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .eq('email', credentials.email)
                    .single();

                if (dbError) {
                    console.error("Database query error:", dbError);
                    throw new Error("Login service temporarily unavailable");
                }

                if (!user) {
                    throw new Error("User not found");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                // CHECK AUTHORIZATION FOR ADMIN ACCOUNTS
                // Treat undefined (missing column) as authorized to prevent lockout, 
                // but strictly check 'false' for actual pending admins.
                const isAuthorized = user.is_authorized !== false;
                if (user.role === "ADMIN" && !isAuthorized) {
                    throw new Error("Your account is pending authorization from the Super Admin.");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    address: user.address,
                    first_name: user.first_name,
                    last_name: user.last_name,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.address = (user as any).address;
                token.firstName = (user as any).first_name;
                token.lastName = (user as any).last_name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).address = token.address;
                (session.user as any).firstName = token.firstName;
                (session.user as any).lastName = token.lastName;
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
