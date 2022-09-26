import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "@trensetickets/packages/middlewares";
import { getAllOrders, getOrder, createOrder, deleteOrder } from "../controllers";
import mongoose from "mongoose";

export const router = Router();

const orderValidation = [
  body("ticketId")
    .not()
    .isEmpty()
    // this custom validation assumes that the id will be in the format of mongodb id
    // suppose in the future if database is changed and the id format also changes
    // that could result in a failure in this validation check
    // but for learning purpose, we are implementing it this way since we know the database won't change
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage("Ticket id is required"),
];

router.get("/", getAllOrders);

router.get("/:id", getOrder);

router.post("/", orderValidation, validateRequest, createOrder);

router.delete("/:id", deleteOrder);
