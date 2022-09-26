import type { RequestHandler } from "express";
import "@trensetickets/packages/types";

export const currentUser: RequestHandler = async (req, res) => {
  return res.send({ currentUser: req.currentUser || null });
};
