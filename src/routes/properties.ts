import { Hono } from "hono";
import { readJsonFile, writeJsonFile } from "../lib/jsonDatabase.js";
import {
  partialPropertyValidator,
  propertyValidator,
} from "../validators/propertyValidator.js";

const propertiesApp = new Hono({ strict: false });
const fileName = "properties.json";

propertiesApp.get("/", async (c) => {
  try {
    return c.json(await readJsonFile<Property>(fileName));
  } catch (error) {
    console.error("Failed to read properties", error);
    return c.json({ error: "Failed to read properties" }, 500);
  }
});

propertiesApp.get("/:id", async (c) => {
  const properties = await readJsonFile<Property>(fileName);
  const property = properties.find(
    (item) => item.property_id === c.req.param("id"),
  );

  return property
    ? c.json(property)
    : c.json({ error: "Property not found" }, 404);
});

propertiesApp.post("/", propertyValidator, async (c) => {
  const body: NewProperty = c.req.valid("json");
  const properties = await readJsonFile<Property>(fileName);
  const highestId = properties.reduce((highest, property) => {
    const numericId = Number(property.property_id.replace("property_", ""));
    return Number.isNaN(numericId) ? highest : Math.max(highest, numericId);
  }, 1000);
  const property: Property = {
    ...body,
    property_id: `property_${highestId + 1}`,
  };

  properties.push(property);
  await writeJsonFile(fileName, properties);
  return c.json(property, 201);
});

propertiesApp.patch("/:id", partialPropertyValidator, async (c) => {
  const id = c.req.param("id");
  const properties = await readJsonFile<Property>(fileName);
  const index = properties.findIndex((item) => item.property_id === id);

  if (index === -1) return c.json({ error: "Property not found" }, 404);

  const updates: Partial<Property> = c.req.valid("json");
  const currentProperty = properties[index];
  if (!currentProperty) return c.json({ error: "Property not found" }, 404);

  const updatedProperty: Property = {
    ...currentProperty,
    ...updates,
    property_id: id,
  };
  properties[index] = updatedProperty;
  await writeJsonFile(fileName, properties);
  return c.json(updatedProperty);
});

propertiesApp.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const properties = await readJsonFile<Property>(fileName);
  const index = properties.findIndex((item) => item.property_id === id);

  if (index === -1) return c.json({ error: "Property not found" }, 404);

  const [deletedProperty] = properties.splice(index, 1);
  await writeJsonFile(fileName, properties);
  return c.json(deletedProperty);
});

export default propertiesApp;
