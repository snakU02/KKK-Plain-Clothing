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
                password: { label: "Password", type: "password" },
                code: { label: "2FA Code", type: "text" }
            },
            async authorize(credentials) {
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

                // --- 2FA LOGIC ---
                const rawCode = credentials?.code;
                const hasProvidedCode = rawCode && rawCode !== "" && rawCode !== "undefined";

                // Only attempt verification if the user provided a code AND we have one in the database
                if (hasProvidedCode && user.two_fa_code) {
                    const providedCode = rawCode.trim();
                    if (user.two_fa_code !== providedCode) {
                        throw new Error("Incorrect verification code.");
                    }
                    
                    // Force UTC parsing for the expiration check
                    const expiresStr = user.two_fa_expires;
                    const expiresDate = expiresStr.endsWith('Z') ? new Date(expiresStr) : new Date(expiresStr + 'Z');
                    
                    if (expiresDate.getTime() < Date.now()) {
                        throw new Error("Verification code has expired.");
                    }
                    
                    // Clear code after successful verification
                    await supabaseAdmin
                        .from('users')
                        .update({ two_fa_code: null, two_fa_expires: null })
                        .eq('id', user.id);
                } else {
                    // Send 2FA code if not provided
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    const expires = new Date(Date.now() + 1800000).toISOString(); // 30 minutes

                    await supabaseAdmin
                        .from('users')
                        .update({ two_fa_code: code, two_fa_expires: expires })
                        .eq('id', user.id);

                    // Send email with code
                    const transporter = (await import("nodemailer")).default.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_PASS,
                        },
                    });

                    await transporter.sendMail({
                        from: `"KK Plain Store" <${process.env.GMAIL_USER}>`,
                        to: user.email,
                        subject: "Security Code - KK Plain Clothing",
                        html: `<div style="text-align:center; font-family:sans-serif; padding:40px;">
                            <h2 style="letter-spacing:4px;">SECURITY CODE</h2>
                            <p>Enter the code below to complete your sign in.</p>
                            <h1 style="font-size:48px; letter-spacing:8px; margin:20px 0;">${code}</h1>
                            <p style="color:#666;">This code will expire in 10 minutes.</p>
                        </div>`
                    });

                    throw new Error("2FA_REQUIRED");
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
