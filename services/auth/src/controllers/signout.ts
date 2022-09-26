import type { RequestHandler } from "express";

export const signout: RequestHandler = async (req, res) => {
  req.session = null;
  res.send({});
};
