import { RequestHandler } from "express";
import { Ticket } from "../models/ticket";

export const getAllTickets: RequestHandler = async (req, res) => {
  const tickets = await Ticket.find({ orderId: null });

  res.status(200).send(tickets);
};
