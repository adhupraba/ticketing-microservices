import { RequestHandler } from "express";
import { Order } from "../models/order";

export const getAllOrders: RequestHandler = async (req, res) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate("ticket");

  res.send(orders);
};
