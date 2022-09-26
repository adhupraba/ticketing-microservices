import { Router } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@trensetickets/packages/middlewares";

import { createTicket, getAllTickets, getTicket, updateTicket } from "../controllers";

export const router = Router();

const ticketValidation = [
  body("title").not().isEmpty().withMessage("Title is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
];

router.get("/", getAllTickets);

router.get("/:id", getTicket);

router.post("/", requireAuth, ticketValidation, validateRequest, createTicket);

router.put("/:id", requireAuth, ticketValidation, validateRequest, updateTicket);
