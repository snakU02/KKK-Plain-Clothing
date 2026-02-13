import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const role = (session.user as any).role;

        let query = supabaseAdmin.from("messages").select("*");

        if (role === "ADMIN" || role === "SUPER_ADMIN") {
            if (userId) {
                // Admin fetching a specific user's chat
                query = query.eq("chat_user_id", userId).order("created_at", { ascending: true });
            } else {
                // Admin fetching all recent chats (grouped by user)
                // This is complex in Supabase without a separate conversations table
                // For now, let's just fetch all messages and we'll handle grouping in JS if needed,
                // or just fetch all and let the client filter.
                // But for the list, we want unique users.
                query = query.order("created_at", { ascending: false });
            }
        } else {
            // Regular user fetching their own chat
            query = query.eq("chat_user_id", (session.user as any).id).order("created_at", { ascending: true });
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Chat GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content, isImage, chatUserId } = await req.json();
        const senderId = (session.user as any).id;
        const senderRole = (session.user as any).role || "USER";
        const senderName = session.user.name || "Customer";

        const isUser = senderRole !== "ADMIN" && senderRole !== "SUPER_ADMIN";

        // If it's a user sending, chatUserId is their own ID.
        // If it's an admin sending, chatUserId is the buyer's ID they are responding to.
        const targetChatUserId = !isUser ? chatUserId : senderId;

        if (!targetChatUserId) {
            return NextResponse.json({ error: "Missing chatUserId" }, { status: 400 });
        }

        // 1. Insert the original message
        const { data: messageData, error: insertError } = await supabaseAdmin
            .from("messages")
            .insert([
                {
                    chat_user_id: targetChatUserId,
                    sender_id: senderId,
                    sender_name: senderName,
                    sender_role: senderRole,
                    content,
                    is_image: isImage || false
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error("Supabase Insert Error:", insertError);
            throw insertError;
        }

        // 2. Automatic Reply Logic
        // If a USER sent the message, create an automated "Seller" acknowledgement.
        if (isUser) {
            try {
                // Check if we should send an auto-reply
                // Don't reply if the last message was from an admin (active conversation)
                // or if there was a recent auto-reply to avoid spamming
                const { data: lastMessages } = await supabaseAdmin
                    .from("messages")
                    .select("sender_role, created_at")
                    .eq("chat_user_id", targetChatUserId)
                    .neq("id", messageData.id) // Exclude current message
                    .order("created_at", { ascending: false })
                    .limit(1);

                const lastMessage = lastMessages?.[0];
                let shouldAutoReply = true;

                if (lastMessage) {
                    const isLastAdmin = lastMessage.sender_role === "ADMIN" || lastMessage.sender_role === "SUPER_ADMIN";
                    const lastMsgTime = new Date(lastMessage.created_at).getTime();
                    const now = new Date().getTime();
                    const hoursSinceLastMsg = (now - lastMsgTime) / (1000 * 60 * 60);

                    // If admin replied recently (within 24 hours), assume active conversation or recent acknowledgement
                    if (isLastAdmin && hoursSinceLastMsg < 24) {
                        shouldAutoReply = false;
                    }
                }

                if (shouldAutoReply) {
                    const autoReplyContent = "Hello! 👋 Thank you for messaging KK Plain. We've received your inquiry and our support team will get back to you as soon as possible. In the meantime, feel free to check out our 'New Arrivals' section!";

                    await supabaseAdmin.from("messages").insert([
                        {
                            chat_user_id: targetChatUserId,
                            sender_id: "system-assistant",
                            sender_name: "KK Plain Assistant",
                            sender_role: "ADMIN",
                            content: autoReplyContent,
                            is_image: false
                        }
                    ]);
                }
            } catch (autoReplyErr) {
                console.error("Auto-reply failed (non-critical):", autoReplyErr);
            }
        }

        return NextResponse.json(messageData);
    } catch (error: any) {
        console.error("Chat POST Exception:", error);
        return NextResponse.json({
            error: error.message || "Unknown server error",
            details: error.details || error.hint || ""
        }, { status: 500 });
    }
}
