import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import { updateRoomSchema } from "@/schema/schema";
import parsedIds from "@/utils/parsedIds";

export async function GET(req: NextRequest, context: {
    params: Promise<{ stayId: string, roomId: string}>
}) {
    const { stayId, roomId} = await context.params;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found');

        const { parsedArg1: ParsedStayId, parsedArg2: parsedRoomId} = parsedIds(stayId, roomId);

        const room = await prisma.stayRoom.findUnique({
            where: { 
                id: parsedRoomId,
                stay_id: ParsedStayId
            },
            include: {
                stay: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                }
            }
        });
        if(!room) return successResponse({}, 'No room found reletd to this stay', 404);

        return successResponse( room,'Room found successfully');
    } catch (error) {
        console.error('internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error', 500, {error});
    }
};

export async function PUT(req: NextRequest, context: {
    params: Promise<{ stayId: string, roomId: string}>
}) {
    const { stayId, roomId} = await context.params;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found');
        const parsedTokenId = Number(token.id);

        const { parsedArg1: ParsedStayId, parsedArg2: parsedRoomId} = parsedIds(stayId, roomId);

        const body = await req.json();
        const parsedBody = updateRoomSchema.parse(body);
        const { price, capacity, room_type} = parsedBody;
        if(!price && !capacity && !room_type) return errorResponse('At least one field required for update the room', 400);

        const existingRoom = await prisma.stayRoom.findUnique({
            where: { id: parsedRoomId }
        });
        if(existingRoom && existingRoom.stay_id !== ParsedStayId) return errorResponse('Forbidden - you can not update this room', 403);

        const existingStay = await prisma.stay.findUnique({
            where: {
                id: ParsedStayId
            }
        });
        if(existingStay && existingStay.owner_id !== parsedTokenId) return errorResponse('Forbidden - you can not update this room', 403);

        const updatedData: any = {};
        if(price !== undefined) updatedData.price = price;
        if(capacity !== undefined) updatedData.capacity = capacity;
        if(room_type !== undefined) updatedData.room_type = room_type;

        const updatedRoom = await prisma.stayRoom.update({
            where: { id: parsedRoomId },
            data: updatedData
        });

        return successResponse(updatedRoom, 'Room updated succesfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error', 500, { error});
    }
};

export async function DELETE(req: NextRequest, context: {
    params: Promise<{ stayId: string, roomId: string}>
}) {
    const { stayId, roomId} = await context.params;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found');
        const parsedTokenId = Number(token.id);

        const { parsedArg1: ParsedStayId, parsedArg2: parsedRoomId} = parsedIds(stayId, roomId);

        const existingRoom = await prisma.stayRoom.findUnique({
            where: { id: parsedRoomId }
        });
        if(existingRoom && existingRoom.stay_id !== ParsedStayId) return errorResponse('Forbidden - you can not update this room', 403);

        const existingStay = await prisma.stay.findUnique({
            where: {
                id: ParsedStayId
            }
        });
        if(existingStay && existingStay.owner_id !== parsedTokenId) return errorResponse('Forbidden - you can not update this room', 403);

        const deletedStayRoom = await prisma.stayRoom.delete({
            where: { id: parsedRoomId }
        });
        
        return successResponse(deletedStayRoom, 'Room deleted successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message: error);
        return errorResponse('Internal server error');
    }
};