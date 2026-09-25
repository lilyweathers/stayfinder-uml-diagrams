import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

const propertySchema = z
  .object({
    property_id: z.string().min(1).optional(),
    title: z.string().min(2, "Title must contain at least 2 characters"),
    description: z
      .string()
      .min(3, "Description must contain at least 3 characters"),
    location: z.string().min(2, "Location must contain at least 2 characters"),
    price_per_night: z
      .number()
      .min(100, "Price per night must be at least 100"),
    max_guests: z.number().int().positive("Max guests must be greater than 0"),
  })
  .strict();

export const propertyValidator = zValidator(
  "json",
  propertySchema,
  (result, c) => {
    if (!result.success) {
      return c.json({ errors: result.error.issues }, 400);
    }
  },
);

export const partialPropertyValidator = zValidator(
  "json",
  propertySchema.partial(),
  (result, c) => {
    if (!result.success) {
      return c.json({ errors: result.error.issues }, 400);
    }
  },
);
