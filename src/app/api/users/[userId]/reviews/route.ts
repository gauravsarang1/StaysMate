import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { prisma } from "@/utils/prisma";
import { getToken } from "next-auth/jwt";
import * as z from "zod";

const idSchema = z.coerce.number();

const createReviewSchema = z.object({
    stay_id: z.coerce.number(),
    comment: z.coerce.string(),
    rating: z.coerce.number().min(1).max(5).default(1)
});

export async function GET(req: NextRequest, context: {
    params: Promise<{ userId: string}>
}) {
    const id  = (await context.params).userId;

    try {
        const parsedUserId = idSchema.parse(id);

        const user_reviews = await prisma.reviews.findMany({
            where: { user_id: parsedUserId},
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
        if(user_reviews && user_reviews.length === 0) successResponse({}, 'No reviews found', 404);

        return successResponse(user_reviews, 'User reviews fetched successfully');
    } catch (error) {
        console.error("Internal server error", error instanceof Error ? error.message : error);
        return errorResponse("Internal server error", 500, { error});
    }
};

export async function POST(req: NextRequest, context: {
    params: Promise<{ userId: string}>
}) {
    const id = (await context.params).userId;

    try {
        const token = await getToken({req});
        if(!token?.id) errorResponse('Unauthorized request - Token not found', 401);

        const parsedUserId = idSchema.parse(id);

        const body = await req.json();
        const parsedBody = createReviewSchema.parse(body);
        const { stay_id, comment, rating} = parsedBody;

        const parsed_stay_id = Number(stay_id);

        const user = await prisma.user.findUnique({
            where: { id: parsedUserId }
        });
        if(!user) return errorResponse('User not found', 404);

        const stay = await prisma.stay.findUnique({
            where: { id: parsed_stay_id}
        });
        if(!stay) return errorResponse('Stay not found');

        const review = await prisma.reviews.create({
            data: {
                user_id: parsedUserId,
                stay_id: parsed_stay_id,
                comment,
                rating
            }
        });

        return successResponse(review, 'Review created successfully'); 
    } catch (error) {
        console.error("Internal server error", error instanceof Error ? error.message : error);
        return errorResponse("Internal server error", 500, { error});
    }
}

