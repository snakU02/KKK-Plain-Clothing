import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { data: users, error } = await supabaseAdmin
            .from("users")
            .select("id, name, email, role, is_authorized, created_at")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ users });
    } catch (error: any) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { userId, role, isAuthorized } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (role !== undefined) updateData.role = role;
        if (isAuthorized !== undefined) updateData.is_authorized = isAuthorized;

        const { error } = await supabaseAdmin
            .from("users")
            .update(updateData)
            .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ message: "User updated successfully" });
    } catch (error: any) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
