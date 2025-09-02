import { prisma } from "@/utils/prisma";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import bcrypt from "bcryptjs";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";
import * as z from "zod";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const createUserScema = z.object({
    name: z.coerce.string(),
    email: z.email(),
    phone: z.coerce.string(),
    password: z.coerce.string()
})

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsedBody = createUserScema.parse(body);
        const {name, email, phone, password} = parsedBody;
        if(!name || !email || !phone || !password) {
            return errorResponse('all fields are required', 400)
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const existingUser = await prisma.user.findFirst({
            where: {
                email
            }
        })
        
        if(existingUser) {
            if(existingUser.email_verified) {
                return errorResponse("email is already exists on another account", 409)
            } else {
                const user = await prisma.user.update({
                    where: {
                        email
                    },
                    data: {
                        name,
                        email,
                        phone,
                        password_hash: hashedPassword,
                        otp,
                        otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
                    }
                })
                await sendVerificationEmail(user.email, user.name, otp)
                return successResponse({}, 'verification mail sent to you email');
            }
        } else {
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    phone,
                    password_hash: hashedPassword,
                    otp,
                    otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
                }
            })
            await sendVerificationEmail(newUser.email, newUser.name, otp)
            return successResponse({name: newUser.name, email}, 'Account created succesfully kindely check your email', 201)
        }
    } catch (error) {
        console.log('internal server error', error)
        return errorResponse('Internal server error', 500, {error})
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401)
        const parsedToken = Number(token.id);

        const admin = await prisma.user.findUnique({
            where: { id: parsedToken}
        });
        if(admin && admin.role !== 'ADMIN') return errorResponse('Forbidden - Admin protected routes', 403);

        const users = await prisma.user.findMany()
        if(users && users.length === 0) return errorResponse('No users found in db', 404);

        return successResponse(users, 'All users fetched from database', 200)
    } catch (error) {
        console.log('internal server error', error)
        return errorResponse('Internal server error', 500, {error})
    }
}