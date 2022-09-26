import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { BadRequestError } from "@trensetickets/packages/errors";

import { config } from "../constants";
import { User } from "../models/user";
import { Hash } from "../utils/hash";

export const signin: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new BadRequestError("User does not exist");
  }

  const isMatch = Hash.compare(user.password, password);

  if (!isMatch) {
    throw new BadRequestError("Invalid credentials");
  }

  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret);

  req.session = { jwt: token };

  return res.status(200).send(user);
};
