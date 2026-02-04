"use client";

import Link from "next/link";
import { ShoppingCart, Menu, Search, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tighter sm:text-2xl">
                        KK Plain Clothing
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/shop" className="text-foreground/80 hover:text-primary transition-colors">
                        Shop
                    </Link>
                    <Link href="/shop?category=men" className="text-foreground/80 hover:text-primary transition-colors">
                        Men
                    </Link>
                    <Link href="/shop?category=women" className="text-foreground/80 hover:text-primary transition-colors">
                        Women
                    </Link>
                    <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors">
                        About
                    </Link>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors hidden sm:flex">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </button>

                    <Link href="/cart" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors relative">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Cart</span>
                        {/* Badge Placeholder */}
                        {/* <span className="absolute top-1 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">2</span> */}
                    </Link>

                    <Link href="/profile" className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors hidden sm:flex">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Profile</span>
                    </Link>

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
