import { prisma } from "../../../../prisma/prisma";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import bcrypt from "bcryptjs";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    try {
        const {name, email, phone, password} = await request.json()
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

export async function GET() {
    try {
        const users = await prisma.user.findMany()
        if(!users) return errorResponse('No users found in db', 404)

        return successResponse(users, 'All users fetched from database', 200)
    } catch (error) {
        console.log('internal server error', error)
        return errorResponse('Internal server error', 500, {error})
    }
}