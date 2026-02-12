import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { userId, action } = await req.json();

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (action === "authorize") {
            const { error } = await supabaseAdmin
                .from("users")
                .update({ is_authorized: true })
                .eq("id", userId);

            if (error) throw error;
            return NextResponse.json({ message: "Admin authorized successfully" });
        }

        if (action === "reject") {
            const { error } = await supabaseAdmin
                .from("users")
                .delete()
                .eq("id", userId);

            if (error) throw error;
            return NextResponse.json({ message: "Admin account removed" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: unknown) {
        console.error("Authorization error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { data: pendingAdmins, error } = await supabaseAdmin
            .from("users")
            .select("id, name, email, role, created_at")
            .eq("role", "ADMIN")
            .eq("is_authorized", false);

        if (error) throw error;

        return NextResponse.json({ pendingAdmins });
    } catch (error: unknown) {
        console.error("Fetch pending error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
