import express, { RequestHandler } from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import { errorHandler } from "@trensetickets/packages/middlewares";
import { NotFoundError } from "@trensetickets/packages/errors";
import "express-async-errors";
import { router } from "./routes";

export const app = express();

const jsonMiddleware: RequestHandler = (req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
};

// ! ingress acts as a proxy to route traffic,
// ! so we need to tell express to trust the proxy
app.set("trust-proxy", true);

app.use(cors());
app.use(jsonMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use("/api/payments", router);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);
