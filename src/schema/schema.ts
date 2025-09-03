import * as z from "zod";

export const updateReviewSchema = z.object({
    comment: z.string().optional(),
    rating: z.number().min(1).max(5).optional()
}).refine((data) => data.comment || data.rating, {
    message: 'At least one field is required'
});

export const createReviewSchema = z.object({
    stay_id: z.coerce.number(),
    comment: z.coerce.string(),
    rating: z.coerce.number().min(1).max(5).default(1)
});

export const createPostSchema = z.object({
    stay_id: z.coerce.number(),
    description: z.coerce.string(),
    preferences: z.record(z.any()).optional()
});

export const updatePostSchema = z.object({
    description: z.coerce.string().optional(),
    preferences: z.record(z.any()).optional(),
    status: z.enum(['OPENED', 'CLOSED']).optional()
}).refine((data) => data.description || data.preferences || data.status, {
    message: 'At least one field is required'
});

export const updateUserSchema = z.object({
  email: z.coerce.string().optional(),
  phone: z.coerce.string().optional(),
  name: z.coerce.string().optional()
}).refine((data) => data.email || data.name || data.phone, {
  message: 'At least one field is required'
});

export const createUserScema = z.object({
    name: z.coerce.string(),
    email: z.email(),
    phone: z.coerce.string(),
    password: z.coerce.string()
});

export const createRoomSchema = z.object({
    stay_id: z.coerce.number().optional(),
    room_type: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'DELUX']).default('TRIPLE'),
    capacity: z.coerce.number(),
    price: z.coerce.number()
});

export const updateRoomSchema = z.object({
    price: z.coerce.number().optional(),
    capacity: z.coerce.number().optional(),
    room_type: z.enum(['SINGLE', 'DOUBLE' , 'TRIPLE' , 'MORE' , 'DELUX'])
}).refine((data) => data.capacity || data.price || data.room_type, {
    message: 'At least one field is required'
});

export const createPostAdminSchema = z.object({
    user_id: z.coerce.number(),
    stay_id: z.coerce.number(),
    description: z.coerce.string(),
    preferences: z.record(z.any()).optional()
});

export const createStaySchema = z.object({
    name: z.string(),
    address: z.string(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number()
});

export const updateStaySchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  contact: z.record(z.any()).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional()
});