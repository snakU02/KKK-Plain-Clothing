import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="w-full border-t bg-background py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">KK Plain Clothing</h3>
                        <p className="text-sm text-muted-foreground">
                            Premium minimalist fashion for the modern individual. Quality, comfort, and style in every stitch.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider">Shop</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
                            <li><Link href="/shop?category=men" className="hover:text-primary transition-colors">Men</Link></li>
                            <li><Link href="/shop?category=women" className="hover:text-primary transition-colors">Women</Link></li>
                            <li><Link href="/shop?category=new" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider">Connect</h4>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                        </div>
                        <div className="pt-4">
                            <p className="text-xs text-muted-foreground">
                                &copy; {new Date().getFullYear()} KK Plain Clothing. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
