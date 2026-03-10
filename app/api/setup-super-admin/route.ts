import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET() {
    try {
        const email = "admin@kkplain.com"; // You can change this
        const password = "ChangeMe123!"; // Temporary password

        // Check if super admin already exists
        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('role', 'SUPER_ADMIN')
            .single();

        if (existing) {
            return NextResponse.json({ message: "Super Admin already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { error } = await supabaseAdmin
            .from('users')
            .insert([{
                name: "Super Admin",
                email: email,
                password: hashedPassword,
                role: "SUPER_ADMIN",
                is_authorized: true,
                first_name: "Super",
                last_name: "Admin"
            }]);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: "Super Admin created successfully.",
            credentials: {
                email,
                password
            },
            instruction: "Visit /forgot-password immediately to change this password."
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
