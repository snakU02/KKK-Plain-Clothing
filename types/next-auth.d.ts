import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            address?: string;
            firstName?: string;
            lastName?: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
        address?: string;
        first_name?: string;
        last_name?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        address?: string;
        firstName?: string;
        lastName?: string;
    }
}
