import { prisma } from "@/utils/prisma";
import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getToken } from "next-auth/jwt";

interface updateDataProps {
    name?:      string,
    address?:   string,
    contact?:   string,
    latitude?:  number,
    longitude?: number
}

// GET: Fetch Stay by ID
export async function GET(request: NextRequest, context: {
  params: Promise<{ id: string}>
}) {
  const id = (await context.params).id;

  try {
    const token = await getToken({req: request});
    if(!token?.id)  return errorResponse('Unauthorized request - token is empty', 401);

    const stay_id = Number(id);
    if (isNaN(stay_id) || stay_id <= 0) return errorResponse("Invalid Stay Id", 400);

    const stay = await prisma.stay.findUnique({ where: { id: stay_id } });
    if (!stay) return errorResponse("Stay not found", 404);

    if(stay.id !== Number(token.id)) return errorResponse('Forbidden - You can not this stay', 403);

    return successResponse(stay, "Stay found successfully");
  } catch (error) {
    console.error("Internal server error", error instanceof Error ? error.message : error);
    return errorResponse("Internal server error", 500, {error});
  }
}

// PUT: Update Stay
export async function PUT(request: NextRequest, context: {
  params: Promise<{ id: string}>
}) {
  const id = (await context.params).id;

  try {
    const token = await getToken({req: request});
    if(!token) return errorResponse('Unauthorized - No token', 401)

    const stay_id = Number(id);
    if (isNaN(stay_id) || stay_id <= 0) return errorResponse("Invalid Stay Id", 400);

    const body: updateDataProps = await request.json();
    const { name, address, contact, latitude, longitude } = body;

    const existingStay = await prisma.stay.findUnique({
        where: { id: stay_id }
    });
    if(!existingStay) return errorResponse('Stay not found', 404);

    if(existingStay.owner_id !== Number(token.id)) return errorResponse('Forbidden - you can not update this stay', 403)

    // Build dynamic update object
    const updateData: updateDataProps = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (contact) updateData.contact = contact;
    if (latitude) updateData.latitude = Number(latitude);
    if (longitude) updateData.longitude = Number(longitude);

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
  params: Promise<{ id: string}>
}) {
  const id = (await context.params).id;

  try {
    const token = await getToken({req: request});
    if(!token) return errorResponse('Unauthorized - No token', 401)

  const stay_id = Number(id);
  if (isNaN(stay_id) || stay_id <= 0) return errorResponse("Invalid Stay Id", 400);
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
