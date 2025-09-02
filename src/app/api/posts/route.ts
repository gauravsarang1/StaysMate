import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import * as z from "zod";

const createUserAdminSchema = z.object({
    user_id: z.coerce.number(),
    stay_id: z.coerce.number(),
    description: z.coerce.string(),
    preferences: z.record(z.any()).optional()
})

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401)
        const parsedToken = Number(token.id);

        const admin = await prisma.user.findUnique({
            where: { 
                id: parsedToken
            }
        });
        if(admin && admin.role !== 'ADMIN') return errorResponse('Forbidden - Admin protected routes', 403);
        
        const posts = await prisma.roomMatePost.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile_pic: true
                    }
                }
            }
        });
        if(posts.length === 0) return errorResponse('No posts found in database', 404);
        
        return successResponse(posts, 'all Posts fetched successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401)
        const parsedToken = Number(token.id);

        const admin = await prisma.user.findUnique({
            where: { id: parsedToken}
        });
        if(admin && admin.role !== 'ADMIN') return errorResponse('Forbidden - Admin protected routes', 403);
        
        const posts = await prisma.roomMatePost.findMany();
        if(posts.length === 0) return errorResponse('No posts found in database', 404);

        const body = await req.json();
        const parsedBody = createUserAdminSchema.parse(body);
        const { user_id, stay_id, description, preferences } = parsedBody;

        // Validation
        if (!user_id || !stay_id || !description) {
            return errorResponse("user_id, stay_id and description are required", 400);
        }

        const user = await prisma.user.findUnique({
            where: { id: user_id}
        });
        if(!user) return errorResponse('User not found', 404);

        const stay = await prisma.stay.findUnique({
            where: { id: stay_id}
        });
        if(!stay) return errorResponse('Stay not found', 404);

        const newData: any = {
        user_id: Number(user_id),
        stay_id: Number(stay_id),
        description,
        ...(preferences !== undefined && { preferences }),
        };

        const newPost = await prisma.roomMatePost.create({
        data: newData,
        });

        return successResponse(newPost, "Roommate post created successfully");
    } catch (error) {
        console.error(
        "Internal server error",
        error instanceof Error ? error.message : error
        );
        return errorResponse("Internal server error", 500, { error });
    }
}