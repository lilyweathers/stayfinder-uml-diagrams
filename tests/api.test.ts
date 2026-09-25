import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";

const testDataDirectory = await fs.mkdtemp(
  path.join(os.tmpdir(), "stay-finder-test-"),
);
process.env.DATA_DIR = testDataDirectory;

const sourceDataDirectory = path.resolve(process.cwd(), "src", "data");

before(async () => {
  await fs.copyFile(
    path.join(sourceDataDirectory, "properties.json"),
    path.join(testDataDirectory, "properties.json"),
  );
  await fs.copyFile(
    path.join(sourceDataDirectory, "bookings.json"),
    path.join(testDataDirectory, "bookings.json"),
  );
});

after(async () => {
  await fs.rm(testDataDirectory, { recursive: true, force: true });
  delete process.env.DATA_DIR;
});

const { default: app } = await import("../src/app.js");

test("root identifies the API", async () => {
  const response = await app.request("/");
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "StayFinder API");
});

test("properties can be listed and fetched by id", async () => {
  const listResponse = await app.request("/properties");
  assert.equal(listResponse.status, 200);
  const properties = (await listResponse.json()) as Property[];
  assert.equal(properties.length, 4);

  const itemResponse = await app.request("/properties/property_1001");
  assert.equal(itemResponse.status, 200);
});

test("booking CRUD persists to the JSON database", async () => {
  const body = {
    property_id: "property_1001",
    guest_name: "Test Guest",
    guest_email: "guest@example.com",
    check_in: "2026-10-10",
    check_out: "2026-10-12",
    guests: 2,
  };
  const createResponse = await app.request("/bookings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  assert.equal(createResponse.status, 201);
  const created = (await createResponse.json()) as Booking;
  assert.match(created.booking_id, /^booking_\d{4}$/);
  assert.equal(created.status, "pending");

  const updateResponse = await app.request(`/bookings/${created.booking_id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...body,
      booking_id: "attempted-id-change",
      status: "confirmed",
    }),
  });
  assert.equal(updateResponse.status, 200);
  const updated = (await updateResponse.json()) as Booking;
  assert.equal(updated.booking_id, created.booking_id);
  assert.equal(updated.status, "confirmed");

  const deleteResponse = await app.request(`/bookings/${created.booking_id}`, {
    method: "DELETE",
  });
  assert.equal(deleteResponse.status, 200);

  const missingResponse = await app.request(`/bookings/${created.booking_id}`);
  assert.equal(missingResponse.status, 404);
});

test("invalid booking input returns validation details", async () => {
  const response = await app.request("/bookings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ guest_email: "not-an-email" }),
  });
  assert.equal(response.status, 400);
  const result = (await response.json()) as { errors: unknown[] };
  assert.ok(result.errors.length > 0);
});
