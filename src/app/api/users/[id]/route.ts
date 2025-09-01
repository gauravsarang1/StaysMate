import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { prisma } from "./../../../../../prisma/prisma";
import { getToken } from "next-auth/jwt";

interface updateDataProps {
  name?: string,
  email?: string,
  phone?: string
}

// ✅ GET: Fetch user by ID
export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ id: string}>
  }
) {
    const id = (await context.params).id;

    try {
      const token = await getToken({req})
      if(!token?.id) return errorResponse('Unauthorized Request - token is empty', 401)

      const userId = Number(id);
      if (isNaN(userId) || userId <= 0) {
        return errorResponse("Invalid user ID", 400);
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return errorResponse("User not found", 404);

      if(user.id !== Number(token.id)) return errorResponse('Forbidden - you can not get this user', 403)

      return successResponse(user, "User fetched successfully");
    } catch (error) {
      console.error("Internal server error", error instanceof Error ? error.message : error);
      return errorResponse("Internal server error", 500, { error});
    }
}

// ✅ PUT: Update user
export async function PUT(
  req: NextRequest,
  context: {
    params: Promise<{ id: string}>
  }
) {
  const id = (await context.params).id;

  try {
    const token = await getToken({req})
    if(!token) return errorResponse('Unauthorized Request - token is empty', 401)

    const userId = Number(id);
    if (isNaN(userId) || userId <= 0) {
      return errorResponse("Invalid user ID", 400);
    }

    const body = await req.json();
    const { name, email, phone } = body;

    // Make sure at least one field is provided
    if (!name && !email && !phone) {
      return errorResponse("At least one field (name, email, phone) is required to update", 400);
    }

    // Check if user exists first
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) return errorResponse("User not found", 404);

    if(existingUser.id !== Number(token.id)) return errorResponse('forbidden - you can not update this user', 403);

      const updateData: updateDataProps = {}

    // If email is provided, check if it belongs to another user
    if (email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists && emailExists.id !== userId) {
        return errorResponse("Email is already in use", 409);
      }
    }

    // If phone is provided, check uniqueness too
    {/*if (phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone },
      });
      if (phoneExists && phoneExists.id !== id) {
        return errorResponse("Phone number is already in use", 409);
      }
    }*/}

    if(name !== undefined) updateData.name = name;
    if(email !== undefined) updateData.email = email;
    if(phone !== undefined) updateData.phone = phone;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return successResponse(updatedUser, "User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    return errorResponse("Failed to update user", 500);
  }
}

// ✅ DELETE: Remove user
export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>
  }
) {
  const id = (await context.params).id;

  try {
    const token = await getToken({req})
    if(!token) return errorResponse('Unauthorized Request - token is empty', 401)

    const userId = Number(id);
    if (isNaN(userId) || userId <= 0) {
      return errorResponse("Invalid user ID", 400);
    }
    // Check if user exists before trying delete
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) return errorResponse("User not found", 404);

    if(existingUser.id !== Number(token.id)) return errorResponse('forbidden - you can not delete this user');

    const user = await prisma.user.delete({ where: { id: userId } });

    return successResponse({name: user.name, email: user.email}, "User deleted successfully");
  } catch (error) {
    console.error("Internal server error:", error instanceof Error ? error.message : error);
    return errorResponse("Failed to delete user", 500, {error});
  }
}
