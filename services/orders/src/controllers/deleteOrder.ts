import { OrderStatus } from "@trensetickets/packages/types";
import { NotFoundError, UnauthorizedError } from "@trensetickets/packages/errors";
import { RequestHandler } from "express";
import { Order } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers";
import { natsWrapper } from "../natsWrapper";

export const deleteOrder: RequestHandler = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("ticket");

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new UnauthorizedError();
  }

  order.status = OrderStatus.Cancelled;
  await order.save();

  // PUBLISH AN EVENT SAYING THIS WAS CANCELLED
  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
    },
  });

  res.status(204).send(order);
};
