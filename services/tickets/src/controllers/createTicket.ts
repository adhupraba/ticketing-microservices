import { RequestHandler } from "express";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticketCreatedPublisher";
import { natsWrapper } from "../natsWrapper";

export const createTicket: RequestHandler = async (req, res) => {
  const { title, price } = req.body;

  const newTicket = Ticket.build({ title, price, userId: req.currentUser!.id });
  await newTicket.save();

  new TicketCreatedPublisher(natsWrapper.client).publish({
    id: newTicket.id,
    title: newTicket.title,
    price: newTicket.price,
    userId: newTicket.userId,
    version: newTicket.version,
  });

  res.status(201).send(newTicket);
};
