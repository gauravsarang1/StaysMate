import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";
import { createStaySchema } from "@/schema/schema";



export async function GET() {
    try {
        const stays = await prisma.stay.findMany()
        if(stays.length === 0) return errorResponse('stays not found in database', 404);
        
        return successResponse(stays, 'stays find successfuly')
    } catch (error) {
        console.error('Error while fetching stays', error);
        return errorResponse('Error while fetching stays', 501, {error});
    }
}

export async function POST(reqest:NextRequest) {
    try {
        const token = await getToken({req: reqest});
        if(!token?.id) return errorResponse('Unauthorized - token not found');
        const parsedTokenId = Number(token.id)
        
        const body = await reqest.json();
        const parsedBody = createStaySchema.parse(body);
        const {name, address, latitude, longitude } = parsedBody;
        if(!name || !address  || !latitude || !longitude) return errorResponse('All fields are required', 400);

        const owner = await prisma.user.findUnique({
            where: { id: parsedTokenId}
        });
        if(owner) return errorResponse('User not found with this Id', 404);

        const newStay = await prisma.stay.create({
            data: {
                name,
                address,
                latitude,
                longitude,
                owner_id: parsedTokenId
            }
        });

        return successResponse(newStay, 'stay created successfully');
    } catch (error) {
        console.error('Internal server error', error instanceof Error ? error.message : error);
        return errorResponse('internal server error', 500, {error});
    }
}