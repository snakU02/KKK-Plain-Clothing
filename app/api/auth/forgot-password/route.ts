import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if user exists
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, name')
            .eq('email', email)
            .single();

        if (userError || !user) {
            // We return success anyway for security reasons (avoid email enumeration)
            return NextResponse.json({ success: true });
        }

        // Generate reset code (6 digits)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

        // Update user with reset code
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                reset_token: code,
                reset_expires: expires
            })
            .eq('id', user.id);

        if (updateError) {
            console.error("Update error:", updateError);
            return NextResponse.json({ error: "System configuration error." }, { status: 500 });
        }

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"KK Plain Store" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Password Reset Code - KK Plain Clothing",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; text-align: center; padding: 40px;">
                    <h1 style="color: #000; letter-spacing: 4px;">PASSWORD RESET</h1>
                    <p style="margin-top: 20px;">Hello ${user.name},</p>
                    <p>Use the verification code below to reset your password. This code will expire in 1 hour.</p>
                    <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px; margin: 30px 0;">
                        <h1 style="font-size: 48px; letter-spacing: 12px; margin: 0; color: #000;">${code}</h1>
                    </div>
                    <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
                    <p style="font-size: 11px; color: #bbb;">© 2026 KK Plain Clothing</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Forgot password API error:", error);
        return NextResponse.json({ error: "An interval server error occurred." }, { status: 500 });
    }
}
