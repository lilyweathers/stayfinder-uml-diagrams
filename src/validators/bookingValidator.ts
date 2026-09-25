import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

export const bookingSchema = z
  .object({
    property_id: z.string().min(1, "Property ID is required"),
    guest_name: z.string().min(1, "Guest name is required"),
    guest_email: z.email("Valid email is required"),
    check_in: z.string().min(1, "Check-in date is required"),
    check_out: z.string().min(1, "Check-out date is required"),
    guests: z.number().int().positive("Guests must be greater than 0"),
    booking_id: z.string().min(1).optional(),
    status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
  })
  .strict();

export const bookingValidator = zValidator(
  "json",
  bookingSchema,
  (result, c) => {
    if (!result.success) {
      return c.json({ errors: result.error.issues }, 400);
    }
  },
);
