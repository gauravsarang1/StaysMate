import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";;
import * as z from "zod";
import { updateStaySchema } from "@/schema/schema";

const idSchema = z.coerce.number();

// GET: Fetch Stay by ID
export async function GET(request: NextRequest, context: {
  params: Promise<{ stayId: string}>
}) {
  const id = (await context.params).stayId;

  try {
    const stay_id = idSchema.parse(id);

    const stay = await prisma.stay.findUnique({ 
      where: { id: stay_id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profile_pic: true,
            phone: true
          }
        }
      }
    });
    if (!stay) return errorResponse("Stay not found", 404);

    return successResponse(stay, "Stay found successfully");
  } catch (error) {
    console.error("Internal server error", error instanceof Error ? error.message : error);
    return errorResponse("Internal server error", 500, {error});
  }
}

// PUT: Update Stay
export async function PUT(request: NextRequest, context: {
  params: Promise<{ stayId: string}>
}) {
  const id = (await context.params).stayId;

  try {
    const token = await getToken({req: request});
    if(!token) return errorResponse('Unauthorized - No token', 401)

    const stay_id = idSchema.parse(id);

    const body = await request.json();
    const parsedBody = updateStaySchema.parse(body);
    const { name, address, contact, latitude, longitude } = parsedBody;

    const existingStay = await prisma.stay.findUnique({
        where: { id: stay_id }
    });
    if(!existingStay) return errorResponse('Stay not found', 404);

    if(existingStay.owner_id !== Number(token.id)) return errorResponse('Forbidden - you can not update this stay', 403)

    // Build dynamic update object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (contact) updateData.contact = contact;
    if (latitude) updateData.latitude = latitude;
    if (longitude) updateData.longitude = longitude;

    if (Object.keys(updateData).length === 0) {
      return errorResponse("At least one field is required to update", 400);
    }

    const updatedStay = await prisma.stay.update({
      where: { id: stay_id },
      data: updateData,
    });

    return successResponse(updatedStay, "Stay updated successfully");
  } catch (error) {
    console.error("Internal server error", error instanceof Error ? error.message : error);
    return errorResponse("Internal server error", 500, {error});
  }
}


// DELETE: Remove Stay by ID
export async function DELETE(request: NextRequest, context: {
  params: Promise<{ stayId: string}>
}) {
  const id = (await context.params).stayId;

  try {
    const token = await getToken({req: request});
    if(!token) return errorResponse('Unauthorized - No token', 401)

    const stay_id = idSchema.parse(id);
  
    const stay = await prisma.stay.findUnique({
        where: { id: stay_id}
    })
    if(!stay) return errorResponse('Stay is not found', 404)

    if(stay.owner_id !== Number(token.id)) return errorResponse('Forbidden - you can not delete this stay', 403)

    const deletedStay = await prisma.stay.delete({
      where: { id: stay_id },
    });

    return successResponse(deletedStay, "Stay deleted successfully");
  } catch (error) {
    console.error("Internal server error", error instanceof Error ? error.message : error);

    return errorResponse("Internal server error", 500, {error});
  }
}
