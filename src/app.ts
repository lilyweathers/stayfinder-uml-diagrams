import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import bookingApp from "./routes/bookings.js";
import propertiesApp from "./routes/properties.js";

const app = new Hono({ strict: false });

app.use(prettyJSON());

app.get("/", (c) => c.text("StayFinder API"));
app.route("/properties", propertiesApp);
app.route("/bookings", bookingApp);

app.notFound((c) => c.json({ error: "Route not found" }, 404));
app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
