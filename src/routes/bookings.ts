import { randomInt } from "node:crypto";
import { Hono } from "hono";
import { readJsonFile, writeJsonFile } from "../lib/jsonDatabase.js";
import { bookingValidator } from "../validators/bookingValidator.js";

const bookingApp = new Hono({ strict: false });
const fileName = "bookings.json";

function generateBookingId(bookings: Booking[]): string {
  let id: string;
  do {
    id = `booking_${randomInt(1000, 10000)}`;
  } while (bookings.some((booking) => booking.booking_id === id));
  return id;
}

bookingApp.get("/", async (c) => {
  try {
    return c.json(await readJsonFile<Booking>(fileName));
  } catch (error) {
    console.error("Failed to read bookings", error);
    return c.json([], 500);
  }
});

bookingApp.get("/:id", async (c) => {
  const bookings = await readJsonFile<Booking>(fileName);
  const booking = bookings.find(
    (item) => item.booking_id === c.req.param("id"),
  );

  return booking
    ? c.json(booking)
    : c.json({ error: "Booking not found" }, 404);
});

bookingApp.post("/", bookingValidator, async (c) => {
  const body: NewBooking = c.req.valid("json");
  const bookings = await readJsonFile<Booking>(fileName);
  const booking: Booking = {
    ...body,
    booking_id: body.booking_id ?? generateBookingId(bookings),
    status: body.status ?? "pending",
  };

  if (bookings.some((item) => item.booking_id === booking.booking_id)) {
    return c.json({ error: "Booking ID already exists" }, 409);
  }

  bookings.push(booking);
  await writeJsonFile(fileName, bookings);
  return c.json(booking, 201);
});

bookingApp.put("/:id", bookingValidator, async (c) => {
  const id = c.req.param("id");
  const bookings = await readJsonFile<Booking>(fileName);
  const index = bookings.findIndex((item) => item.booking_id === id);

  if (index === -1) return c.json({ error: "Booking not found" }, 404);

  const body: NewBooking = c.req.valid("json");
  const updatedBooking: Booking = {
    ...body,
    booking_id: id,
    status: body.status ?? "pending",
  };
  bookings[index] = updatedBooking;
  await writeJsonFile(fileName, bookings);
  return c.json(updatedBooking);
});

bookingApp.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const bookings = await readJsonFile<Booking>(fileName);
  const index = bookings.findIndex((item) => item.booking_id === id);

  if (index === -1) return c.json({ error: "Booking not found" }, 404);

  const [deletedBooking] = bookings.splice(index, 1);
  await writeJsonFile(fileName, bookings);
  return c.json(deletedBooking);
});

export default bookingApp;
