import NextAuth from "next-auth";

declare module "next-auth" {
    interface   User {
        id?:    string;
        name?:  string;
        email?: string;
        email_verified?:    string;
        profile_pic?:       string;
        role?:  string
    }

    interface   Session {
        user: {
            id?:    string;
            name?:  string;
            email?: string;
            email_verified?:    string;
            profile_pic?:       string;
            role?:  string
        } & DefaultSession["user"]
    }
    
    interface   JWT {
        id?:    string;
        name?:  string;
        email?: string;
        email_verified?:    string;
        profile_pic?:       string;
        role?:  string

    }
}