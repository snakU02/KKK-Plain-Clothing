"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("An error occurred during login");
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">Welcome Back.</h1>
                    <p className="text-neutral-500">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                                placeholder="Email or Username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Password</label>
                            <Link href="#" className="text-xs font-bold text-neutral-400 hover:text-black transition-colors">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 bg-neutral-50 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:bg-neutral-300 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-neutral-500">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-bold text-black border-b border-black hover:border-transparent transition-all pb-0.5">
                        Create Account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
