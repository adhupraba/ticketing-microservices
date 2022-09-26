import mongoose from "mongoose";
import { app } from "./app";
import { checkEnv, config } from "./constants";
import {
  ExpirationCompleteSubscriber,
  OrderAwaitingPaymentSubscriber,
  PaymentCompletedSubscriber,
  TicketCreatedSubscriber,
  TicketUpdatedSubscriber,
} from "./events/subscribers";
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

    new TicketCreatedSubscriber(natsWrapper.client).listen();
    new TicketUpdatedSubscriber(natsWrapper.client).listen();
    new ExpirationCompleteSubscriber(natsWrapper.client).listen();
    new OrderAwaitingPaymentSubscriber(natsWrapper.client).listen();
    new PaymentCompletedSubscriber(natsWrapper.client).listen();

    await mongoose.connect(config.mongoUrl);
    console.log("orders mongodb connected to", config.mongoUrl);
  } catch (err) {
    console.error(err);
  }

  app.listen(6003, () => {
    console.log("orders service running on port 6003");
  });
};

start();
