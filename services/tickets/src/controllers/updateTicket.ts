import { BadRequestError, NotFoundError, UnauthorizedError } from "@trensetickets/packages/errors";
import { RequestHandler } from "express";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticketUpdatedPublisher";
import { natsWrapper } from "../natsWrapper";

export const updateTicket: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { title, price } = req.body;

  const ticket = await Ticket.findById(id);

  if (!ticket) {
    throw new NotFoundError();
  }

  if (ticket.orderId) {
    throw new BadRequestError("Cannot edit a reserved ticket");
  }

  if (ticket.userId !== req.currentUser!.id) {
    throw new UnauthorizedError();
  }

  ticket.set({ title, price });
  await ticket.save();

  new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    price: ticket.price,
    title: ticket.title,
    userId: ticket.userId,
    version: ticket.version,
  });

  res.status(200).send(ticket);
};
