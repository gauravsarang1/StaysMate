type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Success response with generic type for data
export function successResponse<T extends JsonValue | object>(
  data: T,
  message: string = "Request successful",
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Error response with generic type for errors
export function errorResponse<E extends JsonValue | object>(
  message: string = "Something went wrong",
  status: number = 400,
  errors?: E
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      message,
      errors: errors ?? {},
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}
