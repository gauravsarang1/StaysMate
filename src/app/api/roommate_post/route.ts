import { prisma } from "../../../../prisma/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET() {
    try {
        const posts = await prisma.roomMatePost.findMany();
        if(posts.length === 0) return errorResponse('No posts found in database', 404);
        
        return successResponse(posts, 'all Posts fetched successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

interface NewDataProps {
  user_id: number;
  stay_id: number;
  description: string;
  preferences?: object; // Prisma expects Json type
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id, stay_id, description, preferences } = body;

        // Validation
        if (!user_id || !stay_id || !description) {
            return errorResponse("user_id, stay_id and description are required", 400);
        }
        if(isNaN(stay_id) || isNaN(user_id) || stay_id <= 0 || user_id <= 0) return errorResponse('Invalid Id entered', 400);

        const user = await prisma.user.findUnique({
            where: { id: user_id}
        });
        if(!user) return errorResponse('User not found', 404);

        const stay = await prisma.stay.findUnique({
            where: { id: stay_id}
        });
        if(!stay) return errorResponse('Stay not found', 404);

        const newData: NewDataProps = {
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