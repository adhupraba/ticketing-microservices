import express from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import { errorHandler } from "@trensetickets/packages/middlewares";
import { NotFoundError } from "@trensetickets/packages/errors";
import "express-async-errors";

import { router } from "./routes";

export const app = express();

// ! ingress acts as a proxy to route traffic,
// ! so we need to tell express to trust the proxy
app.set("trust-proxy", true);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use("/api/users", router);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);
