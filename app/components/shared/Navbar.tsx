"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, Search, User, LogOut, LayoutDashboard } from "lucide-react";

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session, status } = useSession();

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tighter sm:text-2xl uppercase">
                        KK Plain.
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
                    <Link href="/" className="text-foreground/80 hover:text-black transition-colors">
                        Shop
                    </Link>
                    <Link href="/about" className="text-foreground/80 hover:text-black transition-colors">
                        About
                    </Link>
                    {((session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "SUPER_ADMIN") && (
                        <Link href="/admin" className="text-primary hover:text-black transition-colors flex items-center gap-1">
                            <LayoutDashboard className="h-4 w-4" /> Admin
                        </Link>
                    )}
                </div>

                {/* Icons */}
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors hidden sm:flex">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </button>

                    <Link href="/cart" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors relative">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Cart</span>
                    </Link>

                    {status === "authenticated" ? (
                        <div className="flex items-center gap-2 border-l pl-4 ml-2">
                            <span className="text-xs font-bold hidden lg:block uppercase tracking-widest text-neutral-400">
                                {session.user?.name}
                            </span>
                            <button
                                onClick={() => signOut()}
                                className="p-2 hover:text-red-500 rounded-full transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 border-l pl-4 ml-2">
                            <Link href="/login" className="text-xs font-bold uppercase tracking-widest hover:text-neutral-500 transition-colors">
                                Login
                            </Link>
                            <Link href="/signup" className="hidden sm:block text-xs font-bold uppercase tracking-widest bg-black text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors">
                                Join
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Menu</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t bg-background"
                    >
                        <div className="grid gap-2 p-4 text-center">
                            <Link
                                href="/shop"
                                className="py-2 text-sm font-medium hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Shop All
                            </Link>
                            <Link
                                href="/shop?category=men"
                                className="py-2 text-sm font-medium hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Men
                            </Link>
                            <Link
                                href="/shop?category=women"
                                className="py-2 text-sm font-medium hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Women
                            </Link>
                            <Link
                                href="/profile"
                                className="py-2 text-sm font-medium hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Account
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
