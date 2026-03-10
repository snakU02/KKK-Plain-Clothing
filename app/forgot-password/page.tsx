"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2, Lock, Eye, EyeOff, Hash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const router = useRouter();

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setIsSent(true);
                setMessage("Check your Gmail for the 6-digit reset code.");
            } else {
                const data = await res.json();
                setError(data.error || "Failed to send reset code.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: code, password }),
            });

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => router.push("/login"), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Invalid reset code.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <Link
                href="/login"
                className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-black transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">Reset Password.</h1>
                    <p className="text-neutral-500">
                        {isSuccess ? "Password updated successfully." : isSent ? "Enter the code sent to your Gmail." : "We'll send you a recovery code."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold mb-2">Success!</h2>
                            <p className="text-neutral-500 mb-8">Your password has been changed. Redirecting to login...</p>
                        </motion.div>
                    ) : !isSent ? (
                        <motion.form 
                            key="request"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleRequestCode} 
                            className="space-y-6"
                        >
                            {error && <div className="p-4 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 italic">{error}</div>}
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
                                        placeholder="Enter your Gmail"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:bg-neutral-300 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Code"}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="reset"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleResetPassword} 
                            className="space-y-6"
                        >
                            {error && <div className="p-4 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 italic">{error}</div>}
                            <p className="text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 italic">{message}</p>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">6-Digit Code</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">New Password</label>
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
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-300" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 bg-neutral-50 border border-neutral-100 rounded-lg focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:bg-neutral-300 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={() => setIsSent(false)}
                                className="w-full text-xs font-bold text-neutral-400 hover:text-black transition-colors uppercase tracking-widest"
                            >
                                Resend Code
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
