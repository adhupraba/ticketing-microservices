import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { config } from "../constants";
import { BadRequestError } from "@trensetickets/packages/errors";
import { User } from "../models/user";

export const signup: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;

  const exist = await User.findOne({ email }).lean();

  if (exist) {
    throw new BadRequestError("User already exists");
  }

  const newUser = User.build({ email, password });
  await newUser.save();
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, config.jwtSecret);

  req.session = { jwt: token };

  return res.status(201).send(newUser);
};
