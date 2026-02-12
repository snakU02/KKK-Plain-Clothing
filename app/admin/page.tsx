"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    Users,
    Package,
    Settings,
    Search,
    Bell,
    LogOut,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Truck,
    ArrowUpRight,
    TrendingUp,
    Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";

// --- Mock Admin Data ---
const ADMIN_ORDERS = [
    { id: "ORD-9284", customer: "John Doe", items: "Heavyweight Box Tee (2)", total: 700, status: "PENDING", date: "Just Now" },
    { id: "ORD-9283", customer: "Alice Smith", items: "Everyday Hoodie (1)", total: 1200, status: "PROCESSING", date: "2h ago" },
    { id: "ORD-9282", customer: "Bob Wilson", items: "Ramadan Tee (3)", total: 1050, status: "SHIPPED", date: "5h ago" },
    { id: "ORD-9281", customer: "Charlie Brown", items: "Family Set (1)", total: 1500, status: "DELIVERED", date: "Yesterday" },
];

const RECENT_CHATS = [
    { id: 1, name: "John Doe", message: "Is the XXL size available?", time: "5m ago", unread: true, avatar: "https://ui-avatars.com/api/?name=John+Doe" },
    { id: 2, name: "Alice Smith", message: "Sent you the proof of payment.", time: "1h ago", unread: false, avatar: "https://ui-avatars.com/api/?name=Alice+Smith" },
    { id: 3, name: "Bob Wilson", message: "Thanks for the quick delivery!", time: "4h ago", unread: false, avatar: "https://ui-avatars.com/api/?name=Bob+Wilson" },
];

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("orders");
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    // Real Chat States
    const [allMessages, setAllMessages] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [adminChatInput, setAdminChatInput] = useState("");

    const fetchAllMessages = async () => {
        try {
            const res = await fetch("/api/chat");
            const data = await res.json();
            if (Array.isArray(data)) {
                setAllMessages(data);
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    };

    useEffect(() => {
        if (activeTab === "messages") {
            fetchAllMessages();
            const interval = setInterval(fetchAllMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const handleAdminSendMessage = async () => {
        if (!adminChatInput || !selectedUserId) return;
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: adminChatInput,
                    chatUserId: selectedUserId
                })
            });
            if (res.ok) {
                setAdminChatInput("");
                fetchAllMessages();
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    // Derived: Group all messages by chat_user_id for the sidebar
    // We want the most recent message per user
    const conversationsMap = new Map();
    allMessages.forEach(msg => {
        const uid = msg.chat_user_id;
        if (!conversationsMap.has(uid)) {
            conversationsMap.set(uid, {
                userId: uid,
                name: msg.sender_role === 'USER' ? msg.sender_name : 'User ' + uid.slice(0, 4),
                message: msg.content,
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unread: msg.sender_role === 'USER', // Simple heuristic for unread
                avatar: `https://ui-avatars.com/api/?name=${msg.sender_name || 'U'}`
            });
        }
    });
    const conversations = Array.from(conversationsMap.values());

    const selectedChatMessages = allMessages
        .filter(m => m.chat_user_id === selectedUserId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const selectedUser = conversations.find(c => c.userId === selectedUserId);

    const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

    const sidebarItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "orders", label: "Orders", icon: ShoppingBag },
        { id: "messages", label: "Messages", icon: MessageSquare },
        { id: "products", label: "Products", icon: Package },
        { id: "customers", label: "Customers", icon: Users },
        ...(isSuperAdmin ? [{ id: "authorization", label: "Authorization", icon: ShieldAlert }] : []),
    ];

    useEffect(() => {
        if (isSuperAdmin && activeTab === "authorization") {
            fetchPendingAdmins();
        }
    }, [isSuperAdmin, activeTab]);

    const fetchPendingAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const res = await fetch("/api/admin/authorize");
            const data = await res.json();
            setPendingAdmins(data.pendingAdmins || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleAuthorize = async (userId: string, action: "authorize" | "reject") => {
        try {
            const res = await fetch("/api/admin/authorize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action }),
            });
            if (res.ok) {
                setPendingAdmins(prev => prev.filter(a => a.id !== userId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex h-screen bg-neutral-100 text-neutral-900 font-sans">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
                <div className="p-8">
                    <h1 className="text-xl font-bold tracking-tighter uppercase">KK Admin.</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                                ? "bg-black text-white shadow-lg shadow-black/10"
                                : "text-neutral-500 hover:bg-neutral-50 hover:text-black"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-neutral-100">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-8">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-neutral-500 hover:text-black">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="flex items-center gap-3 border-l border-neutral-200 pl-6 cursor-pointer group">
                            <div className="text-right">
                                <p className="text-sm font-bold">{session?.user?.name || "Admin Seller"}</p>
                                <p className="text-xs text-neutral-400 font-medium tracking-wide uppercase">
                                    {isSuperAdmin ? "Super Admin" : "Store Admin"}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-neutral-100 group-hover:ring-neutral-200 transition-all uppercase">
                                {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('') : "AS"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Views */}
                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === "orders" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-black transition-all">Export</button>
                                        <button className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all">Add Order</button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><ShoppingBag className="h-6 w-6" /></div>
                                            <span className="text-green-500 text-xs font-bold flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +12%</span>
                                        </div>
                                        <p className="text-sm text-neutral-400 font-medium">New Orders</p>
                                        <p className="text-2xl font-bold">48</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-yellow-50 text-yellow-500 rounded-xl"><Circle className="h-6 w-6" /></div>
                                            <span className="text-red-500 text-xs font-bold flex items-center gap-1"><TrendingUp className="h-3 w-3 rotate-180" /> -2%</span>
                                        </div>
                                        <p className="text-sm text-neutral-400 font-medium">Pending Approvals</p>
                                        <p className="text-2xl font-bold">12</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-green-50 text-green-500 rounded-xl"><CheckCircle2 className="h-6 w-6" /></div>
                                            <span className="text-green-500 text-xs font-bold flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +5%</span>
                                        </div>
                                        <p className="text-sm text-neutral-400 font-medium">Completed</p>
                                        <p className="text-2xl font-bold">1,204</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-neutral-900 text-white rounded-xl">₱</div>
                                            <span className="text-green-500 text-xs font-bold flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +18%</span>
                                        </div>
                                        <p className="text-sm text-neutral-400 font-medium">Total Revenue</p>
                                        <p className="text-2xl font-bold">₱42.5k</p>
                                    </div>
                                </div>

                                {/* Orders Table */}
                                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-bold uppercase tracking-widest border-b border-neutral-200">
                                                <th className="px-8 py-4">Order ID</th>
                                                <th className="px-8 py-4">Customer</th>
                                                <th className="px-8 py-4">Items</th>
                                                <th className="px-8 py-4">Total</th>
                                                <th className="px-8 py-4">Status</th>
                                                <th className="px-8 py-4">Date</th>
                                                <th className="px-8 py-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {ADMIN_ORDERS.map((order) => (
                                                <tr key={order.id} className="hover:bg-neutral-50 transition-colors group">
                                                    <td className="px-8 py-4 text-sm font-bold text-black">{order.id}</td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 bg-neutral-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                                {order.customer.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <span className="text-sm font-medium">{order.customer}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-sm text-neutral-500">{order.items}</td>
                                                    <td className="px-8 py-4 text-sm font-bold">₱{order.total}</td>
                                                    <td className="px-8 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === "PENDING" ? "bg-yellow-50 text-yellow-600" :
                                                            order.status === "PROCESSING" ? "bg-blue-50 text-blue-600" :
                                                                order.status === "SHIPPED" ? "bg-purple-50 text-purple-600" :
                                                                    "bg-green-50 text-green-600"
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-sm text-neutral-400">{order.date}</td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {order.status === "PENDING" && (
                                                                <>
                                                                    <button className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Accept"><CheckCircle2 className="h-4 w-4" /></button>
                                                                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject"><XCircle className="h-4 w-4" /></button>
                                                                </>
                                                            )}
                                                            {order.status === "PROCESSING" && (
                                                                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Ship"><Truck className="h-4 w-4" /></button>
                                                            )}
                                                            <button className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"><MoreVertical className="h-4 w-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "messages" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex gap-8"
                            >
                                {/* Chat List */}
                                <div className="w-80 bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col">
                                    <div className="p-6 border-b border-neutral-100">
                                        <h3 className="text-lg font-bold">Conversations</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {conversations.length === 0 ? (
                                            <div className="p-8 text-center text-neutral-400 text-sm">No conversations yet.</div>
                                        ) : conversations.map((chat) => (
                                            <div
                                                key={chat.userId}
                                                onClick={() => setSelectedUserId(chat.userId)}
                                                className={`p-4 flex gap-4 cursor-pointer hover:bg-neutral-50 transition-colors border-l-4 ${selectedUserId === chat.userId ? 'border-black bg-neutral-50/50' : 'border-transparent'}`}
                                            >
                                                <div className="relative h-12 w-12 flex-shrink-0">
                                                    <Image src={chat.avatar} alt={chat.name} fill className="rounded-full" />
                                                    {chat.unread && <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-sm font-bold truncate">{chat.name}</span>
                                                        <span className="text-[10px] text-neutral-400 font-medium">{chat.time}</span>
                                                    </div>
                                                    <p className={`text-xs truncate ${chat.unread ? 'text-black font-bold' : 'text-neutral-500'}`}>
                                                        {chat.message}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Chat Window */}
                                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col overflow-hidden">
                                    {selectedUserId ? (
                                        <>
                                            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 relative">
                                                        <Image src={selectedUser?.avatar || ""} alt={selectedUser?.name || "User"} fill className="rounded-full" />
                                                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold">{selectedUser?.name}</h4>
                                                        <p className="text-xs text-neutral-400 font-medium">Customer</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 p-6 overflow-y-auto bg-neutral-50 space-y-4">
                                                {selectedChatMessages.map((m) => {
                                                    const isBuyer = m.sender_id === m.chat_user_id;
                                                    return (
                                                        <div key={m.id} className={`flex gap-3 ${!isBuyer ? 'flex-row-reverse' : ''}`}>
                                                            {isBuyer && (
                                                                <div className="h-8 w-8 relative flex-shrink-0">
                                                                    <Image src={selectedUser?.avatar || ""} alt="Avatar" fill className="rounded-full" />
                                                                </div>
                                                            )}
                                                            <div className={`${!isBuyer ? 'bg-black text-white rounded-tr-none' : 'bg-white text-neutral-700 rounded-tl-none'} p-4 rounded-2xl shadow-sm max-w-[80%]`}>
                                                                {m.is_image ? (
                                                                    <div className="relative aspect-square w-64 bg-neutral-100 rounded-lg overflow-hidden my-1">
                                                                        <Image src={m.content} alt="chat-img" fill className="object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm">{m.content}</p>
                                                                )}
                                                                <p className={`text-[10px] ${!isBuyer ? 'text-white/50' : 'text-neutral-400'} mt-2 font-medium`}>
                                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                            {!isBuyer && (
                                                                <div className="h-8 w-8 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0">AD</div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="p-6 border-t border-neutral-100">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={adminChatInput}
                                                        onChange={(e) => setAdminChatInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAdminSendMessage()}
                                                        placeholder="Type your message..."
                                                        className="w-full pl-6 pr-16 py-4 bg-neutral-100 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                                                    />
                                                    <button
                                                        onClick={handleAdminSendMessage}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-xl hover:bg-neutral-800 transition-all"
                                                    >
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 gap-4">
                                            <MessageSquare className="h-12 w-12 opacity-20" />
                                            <p className="text-sm font-medium">Select a conversation to start chatting</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        {activeTab === "authorization" && isSuperAdmin && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold tracking-tight">Admin Authorization</h2>
                                    <button onClick={fetchPendingAdmins} className="p-2 hover:bg-neutral-200 rounded-full transition-all">
                                        <TrendingUp className="h-5 w-5 rotate-90" />
                                    </button>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                                    {loadingAdmins ? (
                                        <div className="p-12 flex flex-col items-center justify-center gap-4">
                                            <Loader2 className="h-10 w-10 animate-spin text-neutral-300" />
                                            <p className="text-neutral-500 font-medium">Loading pending requests...</p>
                                        </div>
                                    ) : pendingAdmins.length === 0 ? (
                                        <div className="p-20 text-center space-y-4">
                                            <div className="h-16 w-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
                                                <CheckCircle2 className="h-8 w-8 text-neutral-200" />
                                            </div>
                                            <h3 className="text-lg font-bold">All clear!</h3>
                                            <p className="text-neutral-500">No admin accounts are currently pending authorization.</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-bold uppercase tracking-widest border-b border-neutral-200">
                                                    <th className="px-8 py-4">Name</th>
                                                    <th className="px-8 py-4">Email</th>
                                                    <th className="px-8 py-4">Requested Date</th>
                                                    <th className="px-8 py-4 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {pendingAdmins.map((admin) => (
                                                    <tr key={admin.id} className="hover:bg-neutral-50 transition-colors">
                                                        <td className="px-8 py-4 text-sm font-bold text-black">{admin.name}</td>
                                                        <td className="px-8 py-4 text-sm text-neutral-500">{admin.email}</td>
                                                        <td className="px-8 py-4 text-sm text-neutral-400">{new Date(admin.created_at).toLocaleDateString()}</td>
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <button
                                                                    onClick={() => handleAuthorize(admin.id, "authorize")}
                                                                    className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2"
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" /> Authorize
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAuthorize(admin.id, "reject")}
                                                                    className="px-4 py-2 bg-white border border-red-100 text-red-500 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
