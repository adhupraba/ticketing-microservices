import mongoose from "mongoose";
import { app } from "./app";
import { checkEnv, config } from "./constants";
import { OrderCancelledSubscriber } from "./events/subscribers/orderCancelledSubscriber";
import { OrderCreatedSubscriber } from "./events/subscribers/orderCreatedSubscriber";
import { natsWrapper } from "./natsWrapper";

const start = async () => {
  console.log("checking env variables");
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

    await mongoose.connect(config.mongoUrl);
    console.log("tickets mongodb connected to", config.mongoUrl);
  } catch (err) {
    console.error(err);
  }

  app.listen(6002, () => {
    console.log("tickets service running on port 6002");
  });
};

start();
