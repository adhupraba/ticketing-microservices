import Queue from "bull";
import { config, vars } from "../constants";
import { ExpirationCompletePublisher } from "../events/publishers/expirationCompletePublisher";
import { natsWrapper } from "../natsWrapper";

interface IPayload {
  orderId: string;
}

export const expirationQueue = new Queue<IPayload>(vars.bullQueueName, {
  redis: {
    host: config.redisHost,
  },
});

expirationQueue.process(async (job) => {
  await new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});
