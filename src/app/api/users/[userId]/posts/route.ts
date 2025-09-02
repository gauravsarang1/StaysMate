import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import * as z from 'zod';

const idSchema = z.coerce.number();

const createPostSchema = z.object({
    stay_id: z.coerce.number(),
    description: z.coerce.string(),
    preferences: z.record(z.any()).optional()
})

export async function GET(req: NextRequest, context: {
    params: Promise<{ userId: string}>
}) {
    const userId = (await context.params).userId;

    try {
        const parsedUserId = idSchema.parse(userId);

        const user = await prisma.user.findUnique({
            where: { id: parsedUserId}
        });
        if(!user) errorResponse('User not found', 404);

        const posts = await prisma.roomMatePost.findMany({
            where: {
                id: parsedUserId
            },
            include: { user: {
                select: {
                    id: true,
                    name: true,
                    profile_pic: true
                }
            }}
        });
        if(posts.length === 0) return successResponse({}, 'No posts found in database', 404);
        
        return successResponse(posts, 'all Posts fetched successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401);

        const body = await req.json();
        const parsedBody = createPostSchema.parse(body);
        const { stay_id, description, preferences } = parsedBody;
        const parsedUserId = Number(token.id);

        // Validation
        if (!description) {
            return errorResponse("description is required", 400);
        }

        const user = await prisma.user.findUnique({
            where: { id: parsedUserId}
        });
        if(!user) return errorResponse('User not found', 404);

        const stay = await prisma.stay.findUnique({
            where: { id: stay_id}
        });
        if(!stay) return errorResponse('Stay not found', 404);

        const newData: any = {
        user_id: parsedUserId,
        stay_id: stay_id,
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