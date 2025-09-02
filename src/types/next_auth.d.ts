import NextAuth from "next-auth";

declare module "next-auth" {
    interface   User {
        id?:    string;
    }

    interface   Session {
        user: {
            id?:    string;
        } & DefaultSession["user"]
    }
    
    interface   JWT {
        id?:    string;
    }
}