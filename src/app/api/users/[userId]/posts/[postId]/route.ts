import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import parsedIds from "@/utils/parsedIds";
import { updatePostSchema } from "@/schema/schema"

export async function GET(req: NextRequest, context: {
    params: Promise<{userId: string, postId: string}>
}) {
    const { userId, postId } = await context.params;

    try {
        const {parsedArg1: parsedUserId, parsedArg2: parsedPostId} = parsedIds(userId, postId);

        const post = await prisma.roomMatePost.findUnique({
            where: { 
                id: parsedPostId,
                user_id: parsedUserId
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
        if(!post) return errorResponse('Post not found', 404);

        return successResponse(post, 'Post found successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

export async function PUT(req: NextRequest, context: {
    params: Promise<{userId: string, postId: string}>
}) {
    const {userId, postId} = (await context.params);

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found', 401);

        const {parsedArg1: parsedUserId, parsedArg2: parsedPostId} = parsedIds(userId, postId);

        const body = await req.json();
        const parsedBody = updatePostSchema.parse(body);
        const { description, preferences, status} = parsedBody;
        if(!description && !preferences && !status) return errorResponse('At least one field is required to update the Post', 400);

        const existingPost = await prisma.roomMatePost.findUnique({
            where: { 
                id: parsedPostId,
                user_id: parsedUserId
            }
        });
        if(existingPost && existingPost.user_id !== Number(token.id)) return errorResponse('Forbidden - you  can not update this post', 403);

        const updatedePostData: any = {}
        if(description !== undefined) updatedePostData.description = description;
        if(preferences !== undefined) updatedePostData.preferences = preferences;
        if(status !== undefined) updatedePostData.status = status;

        const updatedPost = await prisma.roomMatePost.update({
            where: { id: parsedPostId },
            data: updatedePostData
        });

        return successResponse(updatedPost, 'Post updated successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};

export async function DELETE(req: NextRequest, context: {
    params: Promise<{ userId: string, postId: string}>
}) {
    const { userId, postId} = (await context.params);

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - Token not found', 401);

        const {parsedArg1: parsedUserId, parsedArg2: parsedPostId} = parsedIds(userId, postId);

        const existingPost = await prisma.roomMatePost.findUnique({
            where: { 
                id: parsedPostId,
                user_id: parsedUserId
            }
        });
        if(existingPost && existingPost.user_id !== Number(token.id) ) return errorResponse('Forbidden - you can not delete this post', 403);

        const deletedPost = await prisma.roomMatePost.delete({
            where: { id: parsedPostId }
        });

        return successResponse(deletedPost, 'Post deleted successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error',500, {error});
    }
};