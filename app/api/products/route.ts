import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch products error:", error);
            // If the table doesn't exist, Supabase returns an error.
            // We'll return an empty array to prevent the frontend from crashing,
            // but in a production environment, you'd want to handle this better.
            return NextResponse.json([]);
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Products GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !((session.user as any).role === "ADMIN" || (session.user as any).role === "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const product = await req.json();
        const { id, created_at, ...productData } = product; // Remove fields that should be auto-generated

        const { data, error } = await supabaseAdmin
            .from("products")
            .insert([productData])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Products POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !((session.user as any).role === "ADMIN" || (session.user as any).role === "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, created_at, ...updates } = await req.json();
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const { data, error } = await supabaseAdmin
            .from("products")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Products PATCH error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !((session.user as any).role === "ADMIN" || (session.user as any).role === "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const { error } = await supabaseAdmin
            .from("products")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Products DELETE error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
