import mongoose from "mongoose";
import { app } from "./app";
import { checkEnv, config } from "./constants";

const start = async () => {
  checkEnv();

  try {
    await mongoose.connect(config.mongoUrl);
    console.log("auth mongodb connected to", config.mongoUrl);
  } catch (err) {
    console.error("auth mongo conn error =>", err);
  }

  app.listen(6001, () => {
    console.log("auth service running on port 6001");
  });
};

start();
