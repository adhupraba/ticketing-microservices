import { Router } from "express";
import { body } from "express-validator";
import { checkCurrentUser, requireAuth, validateRequest } from "@trensetickets/packages/middlewares";
import { createPaymentIntent, stripeWebhook } from "../controllers";
import express from "express";

export const router = Router();

const paymentValidation = [body("orderId").not().isEmpty()];

router.post("/", checkCurrentUser, requireAuth, paymentValidation, validateRequest, createPaymentIntent);

router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);
