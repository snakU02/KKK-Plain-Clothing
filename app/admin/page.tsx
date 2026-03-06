"use client";

import { useState, useRef, useEffect } from "react";
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
    Circle,
    Image as ImageIcon,
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Upload,
    AlertTriangle,
    Calendar,
    Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { ShieldAlert, Loader2 } from "lucide-react";

// --- Mock Admin Data ---
const ADMIN_ORDERS = [
    { id: "ORD-9284", customer: "John Doe", items: "Heavyweight Box Tee (2)", total: 700, status: "PENDING", date: "Just Now" },
    { id: "ORD-9283", customer: "Alice Smith", items: "Everyday Hoodie (1)", total: 1200, status: "PROCESSING", date: "2h ago" },
    { id: "ORD-9282", customer: "Bob Wilson", items: "Ramadan Tee (3)", total: 1050, status: "SHIPPED", date: "5h ago" },
    { id: "ORD-9281", customer: "Charlie Brown", items: "Family Set (1)", total: 1500, status: "DELIVERED", date: "Yesterday" },
];

// --- Mock Product Data (Synced with Home) ---
const INITIAL_PRODUCTS = [
    {
        id: 6,
        name: "Ramadan Kareem Calligraphy",
        price: 350,
        colors: ["#171717", "#0F766E", "#1E3A8A", "#991B1B", "#B45309"],
        image: "/model-ramadan-black.png",
        tag: "Seasonal",
        stock: 150
    },
    {
        id: 8,
        name: "Ramadan Crescent Tee",
        price: 350,
        colors: ["#991B1B", "#171717", "#1E3A8A", "#065F46", "#3730A3"],
        image: "/model-ramadan-red.png",
        tag: "Seasonal",
        stock: 85
    },
    {
        id: 9,
        name: "Family Roles Tee Set",
        price: 1500,
        colors: ["#0F766E", "#171717", "#1E3A8A", "#991B1B", "#D97706"],
        image: "/model-family-set.jpg",
        tag: "Bundle",
        stock: 45
    },
    {
        id: 10,
        name: "Happy Family Day Tee",
        price: 350,
        colors: ["#800000", "#171717", "#1E3A8A", "#991B1B", "#4B5563"], // Maroon, Black, Navy, Red, Grey
        image: "/model-family-maroon.jpg",
        tag: "Bestseller",
        stock: 200
    },
    {
        id: 11,
        name: "Together Forever Tee",
        price: 350,
        colors: ["#FFFFFF", "#171717", "#1E3A8A", "#991B1B", "#EC4899"], // White, Black, Navy, Red, Pink
        image: "/model-together-white.jpg",
        tag: "New",
        stock: 120
    },
    {
        id: 12,
        name: "Customize T-Shirt Design",
        price: 450,
        colors: ["#FFFFFF", "#171717", "#1E3A8A", "#991B1B", "#10B981", "#8B5CF6"], // White, Black, Navy, Red, Green, Violet
        image: "/customize-tshirt.jpg",
        tag: "Customizable",
        stock: 500
    }
];

// --- Mock Dashboard Data ---
const SALES_DATA = [
    { name: "Calligraphy Tee", goal: 100, actual: 125, growth: 25.0, lastYear: 100 },
    { name: "Crescent Tee", goal: 80, actual: 75, growth: -6.2, lastYear: 80 },
    { name: "Family Set", goal: 50, actual: 60, growth: 20.0, lastYear: 50 },
    { name: "Family Day Tee", goal: 150, actual: 180, growth: 20.0, lastYear: 150 },
    { name: "Together Tee", goal: 120, actual: 110, growth: -8.3, lastYear: 120 },
    { name: "Custom Tee", goal: 200, actual: 230, growth: 15.0, lastYear: 200 }
];

const MOCK_CUSTOMERS = [
    { id: 1, name: "Alice Johnston", email: "alice.j@example.com", totalOrders: 12, totalSpent: 4200, status: "Active", lastOrder: "2024-03-15" },
    { id: 2, name: "Robert Fox", email: "robert.f@example.com", totalOrders: 5, totalSpent: 1750, status: "Active", lastOrder: "2024-03-10" },
    { id: 3, name: "Cody Fisher", email: "cody.f@example.com", totalOrders: 2, totalSpent: 700, status: "Inactive", lastOrder: "2023-12-20" },
    { id: 4, name: "Esther Howard", email: "esther.h@example.com", totalOrders: 8, totalSpent: 2800, status: "Active", lastOrder: "2024-02-28" },
    { id: 5, name: "Guy Hawkins", email: "guy.h@example.com", totalOrders: 1, totalSpent: 350, status: "Inactive", lastOrder: "2024-03-18" },
    { id: 6, name: "Jenny Wilson", email: "jenny.w@example.com", totalOrders: 15, totalSpent: 5250, status: "Active", lastOrder: "2024-03-19" },
];

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("dashboard"); // Default to dashboard as requested
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    // Products State
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setProducts(data);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);

    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [productForm, setProductForm] = useState({
        name: "",
        price: "",
        tag: "New",
        stock: "",
        colors: "",
        image: ""
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
                time: new Date(msg.created_at).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
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

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChatMessages, selectedUserId]);

    const handleAdminSendMessage = async (text = adminChatInput, isImage = false) => {
        if ((!text && !isImage) || !selectedUserId) return;
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: text,
                    isImage,
                    chatUserId: selectedUserId
                })
            });
            if (res.ok) {
                if (!isImage) setAdminChatInput("");
                fetchAllMessages();
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedUserId) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleAdminSendMessage(reader.result as string, true);
            };
            reader.readAsDataURL(file);
        }
    };

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

    // --- Product Handlers ---
    const handleAddProduct = () => {
        setEditingProduct(null);
        setProductForm({ name: "", price: "", tag: "New", stock: "", colors: "", image: "" });
        setImagePreview(null);
        setIsProductModalOpen(true);
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            price: product.price.toString(),
            tag: product.tag,
            stock: product.stock.toString(),
            colors: product.colors.join(", "),
            image: product.image
        });
        setImagePreview(product.image);
        setIsProductModalOpen(true);
    };

    const confirmDeleteProduct = (id: number) => {
        setProductToDelete(id);
        setDeleteModalOpen(true);
    };

    const executeDeleteProduct = async () => {
        if (productToDelete) {
            try {
                const res = await fetch(`/api/products?id=${productToDelete}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    setProducts(prev => prev.filter(p => p.id !== productToDelete));
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                }
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const productData = {
            name: productForm.name,
            price: Number(productForm.price),
            tag: productForm.tag,
            stock: Number(productForm.stock),
            colors: productForm.colors.split(",").map(c => c.trim()),
            image: imagePreview || editingProduct?.image || "/prod-tee.png"
        };

        try {
            if (editingProduct) {
                const res = await fetch("/api/products", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingProduct.id, ...productData })
                });
                if (res.ok) {
                    const updated = await res.json();
                    setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
                }
            } else {
                const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData)
                });
                if (res.ok) {
                    const created = await res.json();
                    setProducts(prev => [created, ...prev]);
                }
            }
            setIsProductModalOpen(false);
        } catch (err) {
            console.error("Save product failed:", err);
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
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative z-50">
                            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 text-neutral-500 hover:text-black">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden z-50 text-left"
                                    >
                                        <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
                                            <h3 className="font-bold">Notifications</h3>
                                            <span className="text-[10px] text-blue-500 font-bold uppercase cursor-pointer hover:underline">Mark all as read</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {[
                                                { id: 1, title: "New Order", text: "Order ORD-9284 received", time: "5 min ago", unread: true },
                                                { id: 2, title: "Low Stock", text: "Customize T-Shirt Design is running low", time: "1 hour ago", unread: true },
                                                { id: 3, title: "Payment", text: "Payment confirmed for ORD-9283", time: "2 hours ago", unread: false },
                                                { id: 4, title: "Message", text: "New message from Alice Johnston", time: "5 hours ago", unread: false }
                                            ].map((notif) => (
                                                <div key={notif.id} className={`p-4 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors ${notif.unread ? "bg-blue-50/10" : ""}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-sm font-bold text-black">{notif.title}</span>
                                                        <span className="text-[10px] text-neutral-400 font-medium">{notif.time}</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-500">{notif.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 text-center border-t border-neutral-100 bg-neutral-50">
                                            <span className="text-[10px] font-bold text-neutral-500 hover:text-black cursor-pointer uppercase tracking-widest transition-colors">View All Notifications</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-3 border-l border-neutral-200 pl-6 cursor-pointer group">
                            <div className="text-right">
                                <p className="text-sm font-bold">{mounted && session?.user?.name ? session.user.name : "Admin Seller"}</p>
                                <p className="text-xs text-neutral-400 font-medium tracking-wide uppercase">
                                    {mounted && isSuperAdmin ? "Super Admin" : "Store Admin"}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-neutral-100 group-hover:ring-neutral-200 transition-all uppercase">
                                {mounted && session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('') : "AS"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Views */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <AnimatePresence mode="wait">
                        {/* --- DASHBOARD TAB --- */}
                        {activeTab === "dashboard" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <h2 className="text-2xl font-bold tracking-tight">Performance Overview</h2>

                                {/* Top Table Section (Sales Performance) */}
                                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                                        <h3 className="text-lg font-bold">Monthly Sales Performance Chart</h3>
                                        <div className="text-xs text-neutral-400">Unit: Items / 1k PHP</div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500">Product Name</th>
                                                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Goal (Sales)</th>
                                                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Actual (Amount)</th>
                                                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Completion Rate</th>
                                                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Same Period (Last Year)</th>
                                                    <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">YoY Growth</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {SALES_DATA.map((item, idx) => {
                                                    const completion = Math.round((item.actual / item.goal) * 100);
                                                    return (
                                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                                            <td className="px-6 py-4 text-sm font-bold">{item.name}</td>
                                                            <td className="px-6 py-4 text-sm text-right">{item.goal}</td>
                                                            <td className="px-6 py-4 text-sm text-right">{item.actual}</td>
                                                            <td className="px-6 py-4 text-sm text-right font-medium text-blue-600">{completion}%</td>
                                                            <td className="px-6 py-4 text-sm text-right text-neutral-500">{item.lastYear}</td>
                                                            <td className={`px-6 py-4 text-sm text-right font-bold ${item.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                {item.growth > 0 ? "+" : ""}{item.growth}%
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="bg-neutral-900 text-white">
                                                    <td className="px-6 py-4 text-sm font-bold">Total</td>
                                                    <td className="px-6 py-4 text-sm text-right font-bold">{SALES_DATA.reduce((a, b) => a + b.goal, 0)}</td>
                                                    <td className="px-6 py-4 text-sm text-right font-bold">{SALES_DATA.reduce((a, b) => a + b.actual, 0)}</td>
                                                    <td className="px-6 py-4 text-sm text-right font-bold text-green-400">
                                                        {Math.round((SALES_DATA.reduce((a, b) => a + b.actual, 0) / SALES_DATA.reduce((a, b) => a + b.goal, 0)) * 100)}%
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right font-bold text-neutral-400">{SALES_DATA.reduce((a, b) => a + b.lastYear, 0)}</td>
                                                    <td className="px-6 py-4 text-sm text-right font-bold text-green-400">+7.1%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Bottom Chart Section (Combo Visual) */}
                                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <h3 className="text-xl font-bold">Sales Trends & Completion</h3>
                                            <p className="text-sm text-neutral-400 mt-1">Comparing monthly goals vs actual performance</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                                                <div className="w-3 h-3 bg-neutral-100 border border-neutral-200" /> Projected Goal
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                                                <div className="w-3 h-3 bg-black" /> Actual Sales
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                                                <div className="h-0.5 w-4 bg-blue-500 border border-blue-500" /> Trend Line
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative h-72 w-full">
                                        <div className="absolute inset-0 flex items-end justify-between px-8 z-10">
                                            {SALES_DATA.map((item, idx) => {
                                                const max = Math.max(...SALES_DATA.map(d => Math.max(d.goal, d.actual))) * 1.2;
                                                const goalHeight = (item.goal / max) * 100;
                                                const actualHeight = (item.actual / max) * 100;

                                                return (
                                                    <div key={idx} className="relative flex flex-col items-center justify-end h-full w-full group">
                                                        <div className="relative flex items-end gap-1 h-full w-12">
                                                            {/* Goal Ghost Bar */}
                                                            <div
                                                                className="absolute bottom-0 left-0 w-full bg-neutral-100 border-x border-t border-neutral-200 rounded-t-sm z-0"
                                                                style={{ height: `${goalHeight}%` }}
                                                            />
                                                            {/* Actual Bar */}
                                                            <div
                                                                className="absolute bottom-0 left-1 w-10 bg-black rounded-t-sm z-10 hover:bg-neutral-800 transition-all cursor-pointer"
                                                                style={{ height: `${actualHeight}%` }}
                                                            >
                                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap transition-opacity">
                                                                    Actual: {item.actual}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="absolute -bottom-6 text-[10px] font-bold text-neutral-400 uppercase tracking-wide">{item.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* SVG Line Overlay */}
                                        <svg className="absolute inset-0 h-full w-full pointer-events-none z-20 overflow-visible px-8">
                                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible pointer-events-none">
                                                <defs>
                                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                {/* Area under curve (Gradient) */}
                                                <path
                                                    fill="url(#gradient)"
                                                    d={`M 0 ${100 - (SALES_DATA[0].actual / (Math.max(...SALES_DATA.map(d => Math.max(d.goal, d.actual))) * 1.2)) * 100} ` + 
                                                        SALES_DATA.slice(1).map((item, i) => {
                                                            const max = Math.max(...SALES_DATA.map(d => Math.max(d.goal, d.actual))) * 1.2;
                                                            const pX = (i * (100 / (SALES_DATA.length - 1)));
                                                            const pY = 100 - (SALES_DATA[i].actual / max) * 100;
                                                            const cX = ((i + 1) * (100 / (SALES_DATA.length - 1)));
                                                            const cY = 100 - (item.actual / max) * 100;
                                                            const cp1X = pX + (cX - pX) / 2;
                                                            return `C ${cp1X} ${pY}, ${cp1X} ${cY}, ${cX} ${cY}`;
                                                        }).join(" ") + ` L 100 100 L 0 100 Z`
                                                    }
                                                    className="opacity-20"
                                                />
                                                <path
                                                    fill="none"
                                                    stroke="#3B82F6"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d={`M 0 ${100 - (SALES_DATA[0].actual / (Math.max(...SALES_DATA.map(d => Math.max(d.goal, d.actual))) * 1.2)) * 100} ` + 
                                                        SALES_DATA.slice(1).map((item, i) => {
                                                            const max = Math.max(...SALES_DATA.map(d => Math.max(d.goal, d.actual))) * 1.2;
                                                            const pX = (i * (100 / (SALES_DATA.length - 1)));
                                                            const pY = 100 - (SALES_DATA[i].actual / max) * 100;
                                                            const cX = ((i + 1) * (100 / (SALES_DATA.length - 1)));
                                                            const cY = 100 - (item.actual / max) * 100;
                                                            const cp1X = pX + (cX - pX) / 2;
                                                            return `C ${cp1X} ${pY}, ${cp1X} ${cY}, ${cX} ${cY}`;
                                                        }).join(" ")
                                                    }
                                                    className="drop-shadow-[0_4px_4px_rgba(59,130,246,0.3)]"
                                                    style={{ vectorEffect: "non-scaling-stroke", overflow: "visible" }}
                                                />
                                            </svg>
                                            {/* Dots */}
                                            {SALES_DATA.map((item, i) => {
                                                const max = Math.max(...SALES_DATA.map(d => Math.max(d.goal, d.actual))) * 1.2;
                                                return (
                                                    <circle
                                                        key={i}
                                                        cx={`${(i * (100 / (SALES_DATA.length - 1)))}%`}
                                                        cy={`${100 - (item.actual / max) * 100}%`}
                                                        r="4"
                                                        fill="white"
                                                        stroke="#3B82F6"
                                                        strokeWidth="2"
                                                        className="drop-shadow-sm"
                                                    />
                                                )
                                            })}
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* --- ORDERS TAB (Existing) --- */}
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

                        {/* --- PRODUCTS TAB --- */}
                        {activeTab === "products" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold tracking-tight">Product Management</h2>
                                    <button
                                        onClick={handleAddProduct}
                                        className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Add Product
                                    </button>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-bold uppercase tracking-widest border-b border-neutral-200">
                                                <th className="px-6 py-4">Image</th>
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4">Price</th>
                                                <th className="px-6 py-4">Stock</th>
                                                <th className="px-6 py-4">Colors</th>
                                                <th className="px-6 py-4">Tag</th>
                                                <th className="px-6 py-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {products.map((product) => (
                                                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="h-12 w-12 bg-neutral-100 rounded-lg relative overflow-hidden">
                                                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-black">{product.name}</td>
                                                    <td className="px-6 py-4 text-sm font-medium">₱{product.price}</td>
                                                    <td className="px-6 py-4 text-sm text-neutral-500">{product.stock || 100}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-1">
                                                            {product.colors.map((c: string) => (
                                                                <div key={c} className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c }} title={c} />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-neutral-100 rounded text-[10px] uppercase font-bold text-neutral-500">{product.tag}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => handleEditProduct(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="h-4 w-4" /></button>
                                                            <button onClick={() => confirmDeleteProduct(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* --- MESSAGES TAB (Existing) --- */}
                        {activeTab === "messages" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex gap-8"
                            >
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
                                                                    {new Date(m.created_at).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                            {!isBuyer && (
                                                                <div className="h-8 w-8 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0">AD</div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <div ref={chatEndRef} />
                                            </div>
                                            <div className="p-6 border-t border-neutral-100">
                                                <div className="relative flex items-center gap-3">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                    />
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="p-3 bg-neutral-100 text-neutral-500 rounded-xl hover:bg-neutral-200 hover:text-black transition-all"
                                                        title="Attach Image"
                                                    >
                                                        <ImageIcon className="h-5 w-5" />
                                                    </button>
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="text"
                                                            value={adminChatInput}
                                                            onChange={(e) => setAdminChatInput(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAdminSendMessage()}
                                                            placeholder="Type your message..."
                                                            className="w-full pl-6 pr-16 py-4 bg-neutral-100 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                                                        />
                                                        <button
                                                            onClick={() => handleAdminSendMessage()}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-xl hover:bg-neutral-800 transition-all"
                                                        >
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        </button>
                                                    </div>
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

                        {/* --- CUSTOMERS TAB --- */}
                        {activeTab === "customers" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <h2 className="text-2xl font-bold tracking-tight">Customer Database</h2>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                                        <p className="text-sm text-neutral-400 font-medium mb-1">Total Customers</p>
                                        <p className="text-3xl font-bold">1,204</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                                        <p className="text-sm text-neutral-400 font-medium mb-1">Active Now</p>
                                        <p className="text-3xl font-bold flex items-center gap-2">
                                            34 <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                                        <p className="text-sm text-neutral-400 font-medium mb-1">New this Month</p>
                                        <p className="text-3xl font-bold">+128</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-bold uppercase tracking-widest border-b border-neutral-200">
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Orders</th>
                                                <th className="px-6 py-4">Total Spent</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Last Order</th>
                                                <th className="px-6 py-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {MOCK_CUSTOMERS.map((customer) => (
                                                <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                                                {customer.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-bold text-black">{customer.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-neutral-500">{customer.email}</td>
                                                    <td className="px-6 py-4 text-sm font-bold">{customer.totalOrders}</td>
                                                    <td className="px-6 py-4 text-sm font-bold">₱{customer.totalSpent.toLocaleString("en-US")}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                                            {customer.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-neutral-400">{customer.lastOrder}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button className="text-neutral-400 hover:text-black">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* --- AUTHORIZATION TAB (Existing) --- */}
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
                                                        <td className="px-8 py-4 text-sm text-neutral-400">{new Date(admin.created_at).toLocaleDateString("en-US")}</td>
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

            {/* Product Modal */}
            <AnimatePresence>
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsProductModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                                <h3 className="text-lg font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                                <button onClick={() => setIsProductModalOpen(false)}><X className="h-5 w-5 text-neutral-400 hover:text-black" /></button>
                            </div>
                            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={productForm.name}
                                            onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-neutral-100 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                                            placeholder="e.g. Classic Tee"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Image</label>
                                        <div className="relative h-10 w-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="prod-img"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="prod-img"
                                                className="absolute inset-0 bg-neutral-100 border border-dashed border-neutral-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-neutral-50 transition-all overflow-hidden"
                                            >
                                                {imagePreview ? (
                                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                                ) : (
                                                    <Upload className="h-4 w-4 text-neutral-400" />
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Price (₱)</label>
                                        <input
                                            type="number"
                                            required
                                            value={productForm.price}
                                            onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                            className="w-full px-4 py-2 bg-neutral-100 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                                            placeholder="350"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Stock</label>
                                        <input
                                            type="number"
                                            required
                                            value={productForm.stock}
                                            onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                                            className="w-full px-4 py-2 bg-neutral-100 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Tag</label>
                                    <input
                                        type="text"
                                        list="tag-choices"
                                        value={productForm.tag}
                                        onChange={e => setProductForm({ ...productForm, tag: e.target.value })}
                                        className="w-full px-4 py-2 bg-neutral-100 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                                        placeholder="Enter or select a tag"
                                    />
                                    <datalist id="tag-choices">
                                        {Array.from(new Set([...products.map(p => p.tag), "New", "Bestseller", "Seasonal", "Bundle"])).filter(Boolean).map(tag => (
                                            <option key={tag} value={tag} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Colors (Hex)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={productForm.colors}
                                            onChange={e => setProductForm({ ...productForm, colors: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-neutral-100 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all"
                                            placeholder="#000000, #FFFFFF"
                                        />
                                        <div className="relative group">
                                            <input
                                                type="color"
                                                onChange={e => {
                                                    const newColor = e.target.value.toUpperCase();
                                                    const current = productForm.colors.trim();
                                                    const updated = current ? `${current}, ${newColor}` : newColor;
                                                    setProductForm({ ...productForm, colors: updated });
                                                }}
                                                className="w-10 h-10 p-0 rounded-lg border-2 border-neutral-100 cursor-pointer overflow-hidden bg-white"
                                            />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-[10px] text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                                Add from Palette
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1">Comma separated hex codes</p>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-neutral-500 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-black rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                                        <Save className="h-4 w-4" /> Save Product
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setDeleteModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6 text-center"
                        >
                            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Delete Product?</h3>
                            <p className="text-sm text-neutral-500 mb-6">
                                Are you sure you want to delete this product? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="flex-1 py-3 text-sm font-bold text-neutral-500 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDeleteProduct}
                                    className="flex-1 py-3 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
