import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into Supabase
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert([
                {
                    name,
                    email,
                    password: hashedPassword,
                    role: role === "ADMIN" ? "ADMIN" : "CUSTOMER",
                    is_authorized: role === "ADMIN" ? false : true
                }
            ])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (error: any) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
