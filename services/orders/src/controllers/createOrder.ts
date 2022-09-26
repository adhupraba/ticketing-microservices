import { OrderStatus } from "@trensetickets/packages/types";
import { BadRequestError, NotFoundError } from "@trensetickets/packages/errors";
import { RequestHandler } from "express";
import { Order } from "../models/order";
import { Ticket } from "../models/ticket";
import { vars } from "../constants";
import { OrderCreatedPublisher } from "../events/publishers";
import { natsWrapper } from "../natsWrapper";

export const createOrder: RequestHandler = async (req, res) => {
  const { ticketId } = req.body;

  // FIND THE TICKET THE USER IS TRYING TO ORDER IN THE DATABASE
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new NotFoundError();
  }

  // MAKE SURE THAT THE TICKET IS NOT ALREADY RESERVED
  const isReserved = await ticket.isReserved();

  if (isReserved) {
    throw new BadRequestError("Ticket is already reserved");
  }

  // CALCULATE AN EXPIRATION DATE FOR THIS ORDER
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + vars.expiry);

  // BUILD THE ORDER AND SAVE IT TO DATABASE
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket,
  });
  await order.save();

  console.log("order created in orders =>", order.version);

  // PUBLISH AN EVENT SAYING THAT AN ORDER WAS CREATED
  new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    expiresAt: order.expiresAt.toISOString(),
    status: order.status,
    userId: order.userId,
    version: order.version,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  });

  res.status(201).send(order);
};
