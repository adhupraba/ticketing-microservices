import { checkEnv, config } from "./constants";
import { OrderCreatedSubscriber } from "./events/subscribers/orderCreatedSubscriber";
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
  } catch (err) {
    console.error(err);
  }
};

start();
