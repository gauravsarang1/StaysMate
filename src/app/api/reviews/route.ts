import { prisma } from "../../../../prisma/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found');
        console.log(token)

        const reviews = await prisma.reviews.findMany();
        if(reviews.length === 0) return errorResponse('No reviews found in database', 404);
        
        return successResponse(reviews, 'All reviews fetched successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found');

        const body = await req.json();
        const { user_id, stay_id, comment, rating} = body;
        if(!user_id || !stay_id || !comment || !rating) return errorResponse('All fields are required', 400);
        if(isNaN(stay_id || isNaN(user_id) || stay_id <= 0 || user_id <= 0)) return errorResponse('Invalid Id entered', 400);

        const parsed_user_id = Number(user_id);
        const parsed_stay_id = Number(stay_id);

        const user = await prisma.user.findUnique({
            where: { id: parsed_user_id }
        });
        if(!user) return errorResponse('User not found', 404);

        const stay = await prisma.stay.findUnique({
            where: { id: parsed_stay_id}
        });
        if(!stay) return errorResponse('Stay not found');

        const review = await prisma.reviews.create({
            data: {
                user_id: parsed_user_id,
                stay_id,
                comment,
                rating
            }
        });

        return successResponse(review, 'Review created successfully');
    } catch (error) {
        console.error('internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error', 500, { error});
    }
};