import { KeyboardEvent } from "react";

export const numInputValidator = (e: KeyboardEvent<HTMLInputElement>) =>
  ["e", "E", "+", "-"].includes(e.key) && e.preventDefault();
