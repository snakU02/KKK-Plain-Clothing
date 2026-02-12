"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Loader2, UserCircle2, ShieldCheck } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            router.push("/login?registered=true");
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-black transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Store
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-12"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">Create Account.</h1>
                    <p className="text-neutral-500">Join the KK Plain community</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole("CUSTOMER")}
                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${role === "CUSTOMER" ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"}`}
                        >
                            <UserCircle2 className={`h-8 w-8 ${role === "CUSTOMER" ? "text-black" : "text-neutral-300"}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">Buyer</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("ADMIN")}
                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${role === "ADMIN" ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"}`}
                        >
                            <ShieldCheck className={`h-8 w-8 ${role === "ADMIN" ? "text-black" : "text-neutral-300"}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">Admin/Seller</span>
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:bg-neutral-300 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-neutral-500">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-black border-b border-black hover:border-transparent transition-all pb-0.5">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
