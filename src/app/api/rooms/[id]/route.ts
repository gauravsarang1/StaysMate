import { prisma } from "../../../../../prisma/prisma";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";

interface updatedDataProps { 
    price?: number,
    capacity?: number,
    room_type?: Room_Type
}

type Room_Type = 'SINGLE'| 'DOUBLE' | 'TRIPLE' | 'MORE'| 'DELUX';

export async function GET(req: NextRequest, context: {
    params: Promise<{ id: string}>
}) {
    const id = (await context.params).id;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unautorized - No token found');

        const room_id = Number(id);
        if(isNaN(room_id) || room_id <= 0) return errorResponse('Invalid user id', 400);

        const room = await prisma.stayRoom.findUnique({
            where: { id: room_id }
        });

        return successResponse( room,'Room found successfully');
    } catch (error) {
        console.error('internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error', 500, {error});
    }
};

export async function PUT(req: NextRequest, context: {
    params: Promise<{ id: string}>
}) {
    const id = (await context.params).id;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - No token found', 401);

        const room_id = Number(id);
        if(isNaN(room_id) || room_id <= 0) return errorResponse('Invalid user id', 400);


        const body = await req.json();
        const { price, capacity, room_type} = body;
        if(!price && !capacity && !room_type) return errorResponse('At least one field required for update the room', 400);

        const room = await prisma.stayRoom.findUnique({
            where: { id: room_id }
        });
        if(!room) return errorResponse('No Room found', 404);

        const stay = await prisma.stay.findUnique({
            where: {
                id: room.stay_id
            }
        })
        if(!stay || stay.owner_id !== Number(token.id)) return errorResponse('Forbidden - you can not update this room');

        const updatedData: updatedDataProps = {};
        if(price !== undefined) updatedData.price = price;
        if(capacity !== undefined) updatedData.capacity = capacity;
        if(room_type !== undefined) updatedData.room_type = room_type;

        const updatedRoom = await prisma.stayRoom.update({
            where: { id: room_id },
            data: updatedData
        });

        return successResponse(updatedRoom, 'Room updated succesfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error', 500, { error});
    }
}

export async function DELETE(req: NextRequest, context: {
    params: Promise<{ id: string}>
}) {
    const id = (await context.params).id;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - No token found', 401);

        const room_id = Number(id);
        if(isNaN(room_id) || room_id <= 0) return errorResponse('Invalid user id', 400);

        const room =  await prisma.stayRoom.findUnique({
            where: { id: room_id }
        });
        if(!room) return errorResponse('Room not found', 404);

        const stay = await prisma.stay.findUnique({
            where: { id: room.stay_id}
        });
        if(!stay || stay.owner_id !== Number(token.id)) return errorResponse("Forbidden - You cannot delete this room", 403);

        const deletedStayRoom = await prisma.stayRoom.delete({
            where: { id: room_id }
        });
        
        return successResponse(deletedStayRoom, 'Room deleted successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message: error);
        return errorResponse('Internal server error');
    }

}