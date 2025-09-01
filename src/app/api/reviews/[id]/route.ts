import { prisma } from "../../../../../prisma/prisma";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

interface updatedDataProps {
    comment?: string,
    rating?: number
}

export async function GET(req: NextRequest, context: {
    params: Promise<{ id: string}>
}) {
    const id = (await context.params).id;

    try {
        const review_id = Number(id);
        if(isNaN(review_id) || review_id <= 0) return errorResponse('Invalid Review Id', 400);

        const review = await prisma.reviews.findUnique({
            where: { id: review_id }
        });
        if(!review) return errorResponse('No Review found', 404);

        return successResponse(review, 'Review found successFully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

export async function PUT(req: NextRequest, context: {
    params: Promise<{ id: string}>
}) {
    const id = (await context.params).id;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found', 401);

        const review_id = Number(id);
        if(isNaN(review_id) || review_id <= 0) return errorResponse('Invalid Review Id', 400);

        const body = await req.json();
        const { comment, rating} = body;
        if(!comment && !rating) return errorResponse('At least one field is required to update the review', 400);

        const existingReview = await prisma.reviews.findUnique({
            where: { id: review_id }
        });
        if(!existingReview) return errorResponse('Review not found', 404);

        if(existingReview.user_id !== Number(token.id)) return errorResponse('forbidden - you can not update this review', 403);

        const updatedData: updatedDataProps = {};
        if(comment !== undefined) updatedData.comment = comment;
        if(rating !== undefined) updatedData.rating = rating;

        const updatedReview = await prisma.reviews.update({
            where: { id: review_id},
            data: updatedData
        });

        return successResponse(updatedReview, 'Review updated succefully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

export async function DELETE(req: NextRequest, context: {
    params: Promise<{ id: string}>
}) {
    const id = (await context.params).id;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found', 401);

        const review_id = Number(id);
        if(isNaN(review_id) || review_id <= 0) return errorResponse('Invalid Review Id', 400);
        
        const existingReview = await prisma.reviews.findUnique({
            where: { id: review_id }
        });
        if(!existingReview) return errorResponse('No Review found', 404);

        if(existingReview.user_id !== Number(token.id)) return errorResponse('forbidden - you can not delete this review');

        const review = await prisma.reviews.delete({
            where: { id: review_id }
        });

        return successResponse(review, 'Review deleted successfully');    
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};