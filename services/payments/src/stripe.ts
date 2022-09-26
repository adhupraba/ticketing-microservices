import Stripe from "stripe";
import { config } from "./constants";

export const stripe = new Stripe(config.stripeSecret, {
  apiVersion: "2022-08-01",
});
