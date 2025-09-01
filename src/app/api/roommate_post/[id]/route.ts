import { prisma } from "../../../../../prisma/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";

interface updatedePostDataProps {
    description?: string,
    preferences?: object,
    status?: Status
}

type Status = 'OPENED' | 'CLOSED';

export async function GET(req: NextRequest, { params }: { params: { id: string}}) {
    try {
        const id = Number(params.id);
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
        if(!token?.id) return errorResponse('Unauthorized - token not found', 401);

        const roommate_post_id = Number(id);
        if(isNaN(roommate_post_id) || roommate_post_id <= 0) return errorResponse('Invalid Post Id', 400);

        const body = await req.json();
        const { description, preferences, status} = body;
        if(!description && !preferences && !status) return errorResponse('At least one field is required to update the Post', 400);

        const existingPost = await prisma.roomMatePost.findUnique({
            where: { id: roommate_post_id }
        });
        if(existingPost && existingPost.user_id !== Number(token.id)) return errorResponse('Forbidden - you  can not update this post', 403);

        const updatedePostData: updatedePostDataProps = {}
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
        if(!token?.id) return errorResponse('Unauthorized - Token not found', 401);

        const roommate_post_id = Number(id);
        if(isNaN(roommate_post_id) || roommate_post_id <= 0) return errorResponse('Invalid Post Id', 400);

        const existingPost = await prisma.roomMatePost.findUnique({
            where: { id: roommate_post_id }
        });
        if(!existingPost || existingPost.user_id !== Number(token.id) ) return errorResponse('Forbidden - you can not delete this post', 403);

        const deletedPost = await prisma.roomMatePost.delete({
            where: { id: roommate_post_id }
        });

        return successResponse(deletedPost, 'Post deleted successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};