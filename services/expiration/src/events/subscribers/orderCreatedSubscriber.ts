import { OrderCreatedEvent, Subjects, Subscriber } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { events } from "../../constants";
import { expirationQueue } from "../../queues/expirationQueue";

export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = events.queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`Waiting ${delay} milliseconds to process the job`);

    expirationQueue.add({ orderId: data.id }, { delay });

    // ACK THE MESSAGE
    msg.ack();
  }
}
