import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import * as z from "zod";

const idSchema = z.coerce.number();

export async function GET(req: NextRequest, context: {
    params: Promise<{ stayId: string}>
}) {
    const id = (await context.params).stayId;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401)

        const parsedStayId = idSchema.parse(id);
        
        const posts = await prisma.roomMatePost.findMany({
            where: {
                stay_id: parsedStayId
            },
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
        if(posts.length === 0) return successResponse({}, 'No posts found releted to this stay', 404);
        
        return successResponse(posts, 'all Posts fetched successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};
