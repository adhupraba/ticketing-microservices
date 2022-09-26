import { RequestHandler } from "express";
import { BadRequestError, NotFoundError } from "@trensetickets/packages/errors";

import { Ticket } from "../models/ticket";

export const getTicket: RequestHandler = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  if (ticket.orderId) {
    throw new BadRequestError("Ticket already booked");
  }

  return res.status(200).send(ticket);
};
