import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import parsedIds from "@/utils/parsedIds";

export async function GET(req: NextRequest, context: {
    params: Promise<{ stayId: string, postId: string}>
}) {
    const { stayId, postId} = (await context.params);

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401)

        const {parsedArg1: parsedStayId, parsedArg2: parsedPostId} = parsedIds(stayId, postId);

        const post = await prisma.roomMatePost.findUnique({
            where: { 
                id: parsedPostId,
                stay_id: parsedStayId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile_pic: true
                    }
                },
                stay: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        photos: true
                    }
                }
            }
        });
        if(!post) return errorResponse('Post not found releted to this stay', 404);

        return successResponse(post, 'Post found successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};