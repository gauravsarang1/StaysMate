import { prisma } from "../../../../prisma/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { otp, email } = body;
    
        const decodedEmail = decodeURIComponent(email);
        if(!otp.trim() || !decodedEmail.trim()) return errorResponse('Email and OTP is required', 400);
        if(isNaN(otp)) return errorResponse('OTP must be a 6 digit number', 400);
    
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if(!user) return errorResponse('No user found with this email', 404);
        if(user.email_verified) return errorResponse('Email is Already verified', 403);
    
        if(user.otp !== otp) return errorResponse('Invalid OTP Entered', 403);
        if(user.otp_expiry && user.otp_expiry < new Date()) return errorResponse('OTP expired', 403);

        await prisma.user.update({
            where: { email },
            data: {
                otp: null,
                otp_expiry: null,
                email_verified: true
            }
        });
    
        return successResponse({}, 'OTP verified successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('internal server error', 500, {error});
    }
}