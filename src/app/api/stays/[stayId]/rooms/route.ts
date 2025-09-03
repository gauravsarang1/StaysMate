import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import { createRoomSchema } from "@/schema/schema";
import * as z from "zod";

const idSchema = z.coerce.number();

export async function POST(req: NextRequest, context: {
    params: Promise<{ stayId: string}>
}) {
    const id = (await context.params).stayId;

    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found');
        const parsedTokenId = Number(token.id)

        const stayId = idSchema.parse(id);

        const body = await req.json();
        const parsedBody = createRoomSchema.parse(body)
        const {room_type, capacity, price} = parsedBody;
        if(!room_type || !capacity || !price) return errorResponse('All fields are required', 401);

        const existingStay = await prisma.stay.findUnique({
            where: { id: stayId}
        });
        if(existingStay && existingStay.owner_id !== parsedTokenId) return errorResponse('Forbidden - you can not create room in this stay', 403);

        const room = await prisma.stayRoom.create({
            data: {
                stay_id: stayId,
                room_type,
                price,
                capacity
            }
        });

        return successResponse(room, 'Stay Room created successfuly');
    } catch (error) {
        console.log('interval server error', error instanceof Error ? error.message : error);
        return errorResponse('internal server error', 500, {error})
    }
}

export async function GET(req: NextRequest, context: {
    params: Promise<{ stayId: string}>
}) {
    const id = (await context.params).stayId;
    try {
        const stayId = idSchema.parse(id);

        const rooms = await prisma.stayRoom.findMany({
            where: {
                stay_id: stayId
            }
        });
        if(rooms.length === 0) return errorResponse('No rooms found reletd to this stay', 404);
        
        return successResponse(rooms, 'Rooms fateched successfully');
    } catch (error) {
        console.log('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error', 500, {error});
    }
}