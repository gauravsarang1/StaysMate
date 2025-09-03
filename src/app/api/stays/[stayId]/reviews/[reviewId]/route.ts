import { prisma } from "@/utils/prisma";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import parsedIds from "@/utils/parsedIds";

export async function GET(req: NextRequest, context: {
    params: Promise<{ stayId: string, reviewId: string}>
}) {
    const { stayId, reviewId} = (await context.params)

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401);

        const {parsedArg1: parsedStayId, parsedArg2: parsedreviewId} = parsedIds(stayId, reviewId);
        
        const review = await prisma.reviews.findUnique({
            where: { 
                id: parsedreviewId,
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
        if(!review) return errorResponse('Review not found releted to this stay', 404);

        return successResponse(review, 'Review found successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};