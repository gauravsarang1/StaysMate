import { prisma } from "../../../../prisma/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({req});
        if(!token?.id) return errorResponse('Unauthorized - token not found');

        const {stay_id, room_type, capacity, price} = await req.json();
        if(!stay_id || !room_type || !capacity || !price) return errorResponse('All fields are required', 401);

        const room = await prisma.stayRoom.create({
            data: {
                stay_id,
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

export async function GET() {
    try {
        const rooms = await prisma.stayRoom.findMany();
        if(rooms.length === 0) return errorResponse('No Rooms found in database', 404);
        
        return successResponse(rooms, 'Rooms fateched successfully');
    } catch (error) {
        console.log('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('Internal server error', 500, {error});
    }
}