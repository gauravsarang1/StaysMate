import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import { updatePostSchema } from "@/schema/schema";

export async function GET(req: NextRequest, context: {
    params: Promise<{ id: string}>
}) {
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

        const id = Number((await context.params).id);
        if(isNaN(id) || id <= 0) return errorResponse('Invalid Post Id', 400);

        const post = await prisma.roomMatePost.findUnique({
            where: { id }
        });

        return successResponse(post, 'Post found successfully');
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
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401)
        const parsedToken = Number(token.id);

        const admin = await prisma.user.findUnique({
            where: { 
                id: parsedToken
            }
        });
        if(admin && admin.role !== 'ADMIN') return errorResponse('Forbidden - Admin protected routes', 403);

        const roommate_post_id = Number(id);

        const body = await req.json();
        const parsedBody = updatePostSchema.parse(body);
        const { description, preferences, status} = parsedBody;
        if(!description && !preferences && !status) return errorResponse('At least one field is required to update the Post', 400);

        const existingPost = await prisma.roomMatePost.findUnique({
            where: { 
                id: roommate_post_id, 
            }
        });

        const updatedePostData: any = {}
        if(description !== undefined) updatedePostData.description = description;
        if(preferences !== undefined) updatedePostData.preferences = preferences;
        if(status !== undefined) updatedePostData.status = status;

        const updatedPost = await prisma.roomMatePost.update({
            where: { id: roommate_post_id },
            data: updatedePostData
        });

        return successResponse(updatedPost, 'Post updated successfully');
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
        if(!token?.id) return errorResponse('Unauthorized request - Token not found', 401)
        const parsedToken = Number(token.id);

        const admin = await prisma.user.findUnique({
            where: { 
                id: parsedToken
            }
        });
        if(admin && admin.role !== 'ADMIN') return errorResponse('Forbidden - Admin protected routes', 403);

        const roommate_post_id = Number(id);
        if(isNaN(roommate_post_id) || roommate_post_id <= 0) return errorResponse('Invalid Post Id', 400);

        const deletedPost = await prisma.roomMatePost.delete({
            where: { id: roommate_post_id }
        });
        if(!deletedPost) return errorResponse('Post not found', 404);

        return successResponse(deletedPost, 'Post deleted successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};