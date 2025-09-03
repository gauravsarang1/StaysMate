import { prisma } from "@/utils/prisma";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import parsedIds from "@/utils/parsedIds";
import { updateReviewSchema } from "@/schema/schema";

export async function GET(req: NextRequest, context: {
    params: Promise<{ userId: string, reviewId: string}>
}) {
    const userId = (await context.params).userId;
    const reviewId = (await context.params).reviewId;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401);

        const { parsedArg1: parsedUserId, parsedArg2: parsedReviewId} = parsedIds(userId, reviewId);

        const review = await prisma.reviews.findUnique({
            where: { 
                id: parsedReviewId,
                user_id: parsedUserId
            },
            include: { user: {
                select: {
                    name: true,
                    id: true,
                    profile_pic: true
                }
            }}
        });
        if(!review) return errorResponse('No Review found', 404);

        return successResponse(review, 'Review found successFully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

export async function PUT(req: NextRequest, context: {
    params: Promise<{ userId: string, reviewId: string}>
}) {
    const userId = (await context.params).userId;
    const reviewId = (await context.params).reviewId;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found', 401);

        const { parsedArg1: parsedUserId, parsedArg2: parsedReviewId} = parsedIds(userId, reviewId);

        const body = await req.json();
        const parsedBody = updateReviewSchema.parse(body);
        const { comment, rating} = parsedBody;
        if(!comment && !rating) return errorResponse('At least one field is required to update the review', 400);

        const existingReview = await prisma.reviews.findUnique({
            where: { id: parsedReviewId }
        });
        if(!existingReview) return errorResponse('Review not found', 404);

        if(existingReview.user_id !== Number(token.id)) return errorResponse('forbidden - you can not update this review', 403);

        const updatedData: any = {};
        if(comment !== undefined) updatedData.comment = comment;
        if(rating !== undefined) updatedData.rating = rating;

        const updatedReview = await prisma.reviews.update({
            where: { id: parsedReviewId, user_id: parsedUserId},
            data: updatedData
        });

        return successResponse(updatedReview, 'Review updated succefully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

export async function DELETE(req: NextRequest, context: {
    params: Promise<{ userId: string, reviewId: string}>
}) {
    const userId = (await context.params).userId;
    const reviewId = (await context.params).reviewId;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found', 401);

        const { parsedArg1: parsedUserId, parsedArg2: parsedReviewId} = parsedIds(userId, reviewId);

        const user = await prisma.user.findUnique({
            where: { id: parsedUserId}
        });
        if(!user) return errorResponse('User not found', 404);
        
        const existingReview = await prisma.reviews.findUnique({
            where: { 
                id: parsedReviewId,
                user_id: parsedUserId
            }
        });
        if(!existingReview) return errorResponse('No Review found', 404);

        if(existingReview.user_id !== Number(token.id)) return errorResponse('forbidden - you can not delete this review', 403);

        await prisma.reviews.delete({
            where: { 
                id: parsedReviewId,
                user_id: parsedUserId
            }
        });

        return successResponse({}, 'Review deleted successfully');    
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};