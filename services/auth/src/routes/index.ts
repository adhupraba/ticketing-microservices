import { Router } from "express";
import { body } from "express-validator";
import { checkCurrentUser, validateRequest } from "@trensetickets/packages/middlewares";

import { currentUser, signin, signout, signup } from "../controllers";

export const router = Router();

const signupValidation = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password").trim().isLength({ min: 4, max: 20 }).withMessage("Password must be between 4 and 20 characters"),
];

const signinValidation = [
  body("email").isEmail().withMessage("Email must be valid"),
  body("password").trim().notEmpty().withMessage("You must supply a password"),
];

router.post("/signup", signupValidation, validateRequest, signup);

router.post("/signin", signinValidation, validateRequest, signin);

router.post("/signout", signout);

router.get("/currentUser", checkCurrentUser, currentUser);
