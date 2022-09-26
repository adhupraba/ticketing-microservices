import { NotFoundError, UnauthorizedError } from "@trensetickets/packages/errors";
import { RequestHandler } from "express";
import { Order } from "../models/order";

export const getOrder: RequestHandler = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("ticket");

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new UnauthorizedError();
  }

  res.send(order);
};
