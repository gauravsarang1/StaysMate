import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "../../../../../prisma/prisma";
import bcrypt from "bcryptjs";
import  CredentialsProvider  from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        }), 

        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "  Enter your email" },
                password: { label: "Password", type: "password", placeholder: "  Enter your password" }
            },
            async authorize(credentials: any): Promise<any>{
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }
                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });
                    if (!user) {
                        throw new Error("No user found with the provided credentials");
                    }
                    if(!user.email_verified) {
                        throw new Error("Please verify your email before logging in");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash as string);
                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    }
                    return {
                        id: user.id.toString(),
                        email: user.email,
                        email_verified: user.email_verified,
                        name: user.name,
                        profile_pic: user.profile_pic,
                        role: user.role,
                    };
                } catch (error) {
                    throw new Error(`Error fetching user from database, ${error}`);
                }
            }
        }),
    ],

    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google" && profile) {
                const googleProfile = profile as { email_verified: boolean; email: string; name: string; picture: string };
                if(!googleProfile.email_verified) {
                    throw new Error('Google email is not verified')
                }
                const existingUser = await prisma.user.findFirst({
                    where: {
                        email: googleProfile.email
                    }
                })
                if(!existingUser) {
                    await prisma.user.create({
                        data: {
                            email: googleProfile.email,
                            email_verified: googleProfile.email_verified,
                            name: googleProfile.name,
                            profile_pic: googleProfile.picture,
                            role: "USER", // or default role
                        }
                    })
                }
            }
            return true // Do different verification for other providers that don't have `email_verified`
        },

        async jwt({ token, user}) {
            if(user) {
                token.id = user.id
                token.email = user.email
                token.email_verified = user.email_verified
                token.name = user.name
                token.profile_pic = user.profile_pic
                token.role = user.role
            }
            return token
        },

        async session({ session, token}) {
            if(token) {
                session.user.id = token.id
                session.user.email = token.email
                session.user.email_verified = token.email_verified
                session.user.name = token.name
                session.user.profile_pic = token.profile_pic
                session.user.role = token.role
            }
            return session
        },
    },

    session: {
        strategy: 'jwt'
    },

    secret: process.env.NEXTAUTH_SECRET
}
