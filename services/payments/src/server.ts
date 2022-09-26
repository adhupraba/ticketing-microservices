import mongoose from "mongoose";
import { app } from "./app";
import { checkEnv, config } from "./constants";
import { OrderCancelledSubscriber, OrderCreatedSubscriber, OrderUpdatedSubscriber } from "./events/subscribers";
import { natsWrapper } from "./natsWrapper";

const start = async () => {
  checkEnv();

  try {
    await natsWrapper.connect(config.natsClusterId, config.natsClientId, config.natsUrl);

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit(0);
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new OrderCreatedSubscriber(natsWrapper.client).listen();
    new OrderCancelledSubscriber(natsWrapper.client).listen();
    new OrderUpdatedSubscriber(natsWrapper.client).listen();

    await mongoose.connect(config.mongoUrl);
    console.log("payments mongodb connected to", config.mongoUrl);
  } catch (err) {
    console.error(err);
  }

  app.listen(6004, () => {
    console.log("payments service running on port 6004");
  });
};

start();
