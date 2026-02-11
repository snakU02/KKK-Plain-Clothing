"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./shared/Navbar";
import { Footer } from "./shared/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Pages that handle their own header/footer or don't need the default ones
    const isSpecialPage = pathname === "/" || pathname === "/admin" || pathname === "/login" || pathname === "/signup";

    return (
        <>
            {!isSpecialPage && <Navbar />}
            <main className="flex-1">
                {children}
            </main>
            {!isSpecialPage && <Footer />}
        </>
    );
}
