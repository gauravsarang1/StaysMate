import { prisma } from "../../../../prisma/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password }: {email: string, password: string} = body;

    // Validation
    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse("User not found with this email address", 404);
    }

    //restricted password to be string
    const userPassword: string = user.password_hash as string

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userPassword
    );

    if (!isPasswordCorrect) {
      return errorResponse("Invalid credentials", 401);
    }
    

    // Optional: remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    // Success
    return successResponse(
      { user: userWithoutPassword },
      "Login successful",
      200
    );
  } catch (error) {
    console.log('interval server error', error instanceof Error ? error.message : error);
    return errorResponse('internal server error', 500, {error})
  }
};
