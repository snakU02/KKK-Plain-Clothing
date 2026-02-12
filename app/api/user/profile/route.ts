import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { firstName, lastName, address } = await req.json();
        const userId = session.user.id;

        const { error } = await supabaseAdmin
            .from("users")
            .update({
                first_name: firstName,
                last_name: lastName,
                address: address
            })
            .eq("id", userId);

        if (error) throw error;

        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (error: unknown) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
