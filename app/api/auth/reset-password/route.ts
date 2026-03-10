import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        // Find user with valid token
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, reset_expires')
            .eq('reset_token', token)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: "Invalid reset code" }, { status: 400 });
        }

        // Force UTC parsing for the expiration check
        const expiresStr = user.reset_expires;
        const expiresDate = expiresStr.endsWith('Z') ? new Date(expiresStr) : new Date(expiresStr + 'Z');
        
        if (expiresDate.getTime() < Date.now()) {
            return NextResponse.json({ error: "Verification code has expired" }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and clear token
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                password: hashedPassword,
                reset_token: null,
                reset_expires: null
            })
            .eq('id', user.id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Reset password API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
